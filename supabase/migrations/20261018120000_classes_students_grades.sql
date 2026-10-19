-- Admin-owned classes, students, enrollments, grades and grade-email log.
-- Every row carries owner_id (the admin, from auth.uid()). Composite foreign keys guarantee that
-- related rows always share the same owner, and RLS lets each admin see only their own rows.

-- ---------------------------------------------------------------------------
-- Old Express/MySQL tables: moved out of the API's reach (not deleted)
-- ---------------------------------------------------------------------------
create schema if not exists legacy;
revoke all on schema legacy from public, anon, authenticated;

do $$
begin
  if to_regclass('public.grades') is not null and to_regclass('public.students2') is not null then
    alter table public.grades set schema legacy;
    alter table public.students2 set schema legacy;
  end if;
  if to_regclass('public.login') is not null then
    alter table public.login set schema legacy;
  end if;
end $$;

-- New objects in public must not be granted to the API roles automatically
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on functions from anon, authenticated, public;

-- Helper functions live in a schema the Data API does not expose
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.classes (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name       text not null check (char_length(btrim(name)) between 1 and 100),
  created_at timestamptz not null default now(),
  unique (id, owner_id)
);
create index classes_owner_id_idx on public.classes (owner_id);

create table public.students (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  student_number text not null check (student_number ~ '^[0-9]{1,20}$'),
  name           text not null check (char_length(btrim(name)) between 1 and 100),
  email          text check (char_length(email) <= 254 and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  created_at     timestamptz not null default now(),
  -- Unique per admin: a global constraint would reveal other admins' student numbers
  unique (owner_id, student_number),
  unique (id, owner_id)
);

create table public.enrollments (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid(),
  class_id   uuid not null,
  student_id uuid not null,
  created_at timestamptz not null default now(),
  -- Scoped by owner so another admin probing with foreign ids gets an ownership error, never "already exists"
  unique (owner_id, class_id, student_id),
  unique (id, owner_id),
  foreign key (class_id, owner_id) references public.classes (id, owner_id) on delete cascade,
  foreign key (student_id, owner_id) references public.students (id, owner_id) on delete cascade
);
create index enrollments_student_id_idx on public.enrollments (student_id);
create index enrollments_owner_id_idx on public.enrollments (owner_id);

create table public.grades (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null default auth.uid(),
  enrollment_id uuid not null,
  subject       text not null check (char_length(btrim(subject)) between 1 and 100),
  score         numeric(5,2) not null check (score between 0 and 100),
  comment       text check (char_length(comment) <= 2000),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (owner_id, enrollment_id, subject),
  foreign key (enrollment_id, owner_id) references public.enrollments (id, owner_id) on delete cascade
);
create index grades_owner_id_idx on public.grades (owner_id);

create table public.grade_emails (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            uuid not null default auth.uid(),
  class_id            uuid not null,
  student_id          uuid not null,
  recipient           text not null,
  status              text not null check (status in ('sent', 'failed')),
  error               text check (char_length(error) <= 1000),
  provider_message_id text,
  created_at          timestamptz not null default now(),
  foreign key (class_id, owner_id) references public.classes (id, owner_id) on delete cascade,
  foreign key (student_id, owner_id) references public.students (id, owner_id) on delete cascade
);
create index grade_emails_owner_created_idx on public.grade_emails (owner_id, created_at);
create index grade_emails_class_student_idx on public.grade_emails (class_id, student_id);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
-- Student number and owner can never change, even for roles that bypass column grants
create function private.students_block_immutable_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.student_number is distinct from old.student_number then
    raise exception 'student_number cannot be changed' using errcode = 'check_violation';
  end if;
  if new.owner_id is distinct from old.owner_id then
    raise exception 'owner_id cannot be changed' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger students_block_immutable_changes
  before update on public.students
  for each row execute function private.students_block_immutable_changes();

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger grades_set_updated_at
  before update on public.grades
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- Privileges: anon gets nothing; authenticated gets only the columns it may write
-- ---------------------------------------------------------------------------
revoke all on public.classes, public.students, public.enrollments, public.grades, public.grade_emails
  from anon, authenticated;

grant select, delete on public.classes to authenticated;
grant insert (name), update (name) on public.classes to authenticated;

grant select, delete on public.students to authenticated;
grant insert (student_number, name, email) on public.students to authenticated;
grant update (name, email) on public.students to authenticated;

grant select, delete on public.enrollments to authenticated;
grant insert (class_id, student_id) on public.enrollments to authenticated;

grant select, delete on public.grades to authenticated;
grant insert (enrollment_id, subject, score, comment) on public.grades to authenticated;
grant update (subject, score, comment) on public.grades to authenticated;

grant select on public.grade_emails to authenticated;
grant insert (class_id, student_id, recipient, status, error, provider_message_id) on public.grade_emails to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security: each admin sees and changes only rows they own
-- ---------------------------------------------------------------------------
alter table public.classes      enable row level security;
alter table public.students     enable row level security;
alter table public.enrollments  enable row level security;
alter table public.grades       enable row level security;
alter table public.grade_emails enable row level security;

create policy "Owners read their classes" on public.classes
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "Owners create their classes" on public.classes
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "Owners update their classes" on public.classes
  for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "Owners delete their classes" on public.classes
  for delete to authenticated using (owner_id = (select auth.uid()));

create policy "Owners read their students" on public.students
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "Owners create their students" on public.students
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "Owners update their students" on public.students
  for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "Owners delete their students" on public.students
  for delete to authenticated using (owner_id = (select auth.uid()));

create policy "Owners read their enrollments" on public.enrollments
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "Owners create their enrollments" on public.enrollments
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "Owners delete their enrollments" on public.enrollments
  for delete to authenticated using (owner_id = (select auth.uid()));

create policy "Owners read their grades" on public.grades
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "Owners create their grades" on public.grades
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "Owners update their grades" on public.grades
  for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "Owners delete their grades" on public.grades
  for delete to authenticated using (owner_id = (select auth.uid()));

create policy "Owners read their grade emails" on public.grade_emails
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "Owners log their grade emails" on public.grade_emails
  for insert to authenticated with check (owner_id = (select auth.uid()));
