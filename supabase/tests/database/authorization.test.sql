-- Authorization and data-integrity rules, checked as real API roles (anon / authenticated admins).
-- Run with: npm run db:test
begin;
create extension if not exists pgtap with schema extensions;
select plan(41);

-- Two admins
insert into auth.users (id, email, aud, role)
values ('11111111-1111-1111-1111-111111111111', 'admin-a@example.com', 'authenticated', 'authenticated'),
       ('22222222-2222-2222-2222-222222222222', 'admin-b@example.com', 'authenticated', 'authenticated');

create function pg_temp.act_as(uid uuid) returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
$$;

-- ---------------------------------------------------------------- structure
select ok(bool_and(relrowsecurity), 'RLS is enabled on every app table')
from pg_class
where oid in ('public.classes'::regclass, 'public.students'::regclass, 'public.enrollments'::regclass,
              'public.grades'::regclass, 'public.grade_emails'::regclass);

select is_empty(
  $$ select table_name, privilege_type from information_schema.role_table_grants
     where table_schema = 'public' and grantee = 'anon' $$,
  'anon has no table privileges in public');

select ok(not has_schema_privilege('authenticated', 'legacy', 'USAGE'), 'legacy schema is not reachable by the API');
select ok(not has_schema_privilege('anon', 'private', 'USAGE'), 'private helper schema is not reachable by the API');

-- ---------------------------------------------------------------- admin A creates data
select pg_temp.act_as('11111111-1111-1111-1111-111111111111');

select lives_ok($$ insert into public.classes (name) values ('Math A') $$, 'admin A creates a class');
select is((select owner_id from public.classes where name = 'Math A'),
          '11111111-1111-1111-1111-111111111111'::uuid, 'class owner is set from the session');

select throws_ok(
  $$ insert into public.classes (name, owner_id) values ('Stolen', '22222222-2222-2222-2222-222222222222') $$,
  '42501', null, 'admin A cannot choose an owner for a class');

select lives_ok($$ insert into public.students (student_number, name, email) values ('1001', 'Dana', 'dana@example.com') $$,
                'admin A creates a student');
select throws_ok($$ insert into public.students (student_number, name) values ('1001', 'Dup') $$,
                 '23505', null, 'student number is unique per admin');
select throws_ok($$ insert into public.students (student_number, name) values ('12a', 'Bad') $$,
                 '23514', null, 'student number must be digits only');
select throws_ok($$ insert into public.students (student_number, name, email) values ('1002', 'Bad', 'not-an-email') $$,
                 '23514', null, 'invalid email is rejected');
select throws_ok($$ insert into public.students (student_number, name) values ('1003', '   ') $$,
                 '23514', null, 'blank name is rejected');

select lives_ok($$ insert into public.enrollments (class_id, student_id)
                   select c.id, s.id from public.classes c, public.students s
                   where c.name = 'Math A' and s.student_number = '1001' $$,
                'admin A enrolls the student');
select lives_ok($$ insert into public.grades (enrollment_id, subject, score, comment)
                   select id, 'Algebra', 95.5, 'Great' from public.enrollments $$,
                'admin A adds a grade');
select throws_ok($$ insert into public.grades (enrollment_id, subject, score) select id, 'Algebra', 80 from public.enrollments $$,
                 '23505', null, 'one grade per subject per enrollment');
select throws_ok($$ insert into public.grades (enrollment_id, subject, score) select id, 'Geometry', 101 from public.enrollments $$,
                 '23514', null, 'score above 100 is rejected');
select throws_ok($$ insert into public.grades (enrollment_id, subject, score) select id, 'Geometry', -1 from public.enrollments $$,
                 '23514', null, 'negative score is rejected');

-- Student number and ownership are immutable
select throws_ok($$ update public.students set student_number = '9999' $$,
                 '42501', null, 'student number cannot be updated by an admin');
select throws_ok($$ update public.classes set owner_id = '22222222-2222-2222-2222-222222222222' $$,
                 '42501', null, 'class ownership cannot be transferred');
select throws_ok($$ update public.enrollments set class_id = class_id $$,
                 '42501', null, 'enrollments cannot be moved between classes');
select lives_ok($$ update public.students set name = 'Dana R.', email = 'dana.r@example.com' where student_number = '1001' $$,
                'student name and email are editable');
select lives_ok($$ update public.grades set score = 97 where subject = 'Algebra' $$, 'grade score is editable');

-- ---------------------------------------------------------------- admin B is isolated from A
select pg_temp.act_as('22222222-2222-2222-2222-222222222222');

select is_empty($$ select * from public.classes $$, 'admin B sees none of A''s classes');
select is_empty($$ select * from public.students $$, 'admin B sees none of A''s students');
select is_empty($$ select * from public.enrollments $$, 'admin B sees none of A''s enrollments');
select is_empty($$ select * from public.grades $$, 'admin B sees none of A''s grades');

select lives_ok($$ insert into public.students (student_number, name) values ('1001', 'Other Dana') $$,
                'admin B may reuse a student number that admin A has');

with changed as (update public.students set name = 'hacked' where student_number = '1001' returning owner_id)
select is((select count(*)::int from changed where owner_id <> '22222222-2222-2222-2222-222222222222'), 0,
          'admin B cannot rename A''s student');
with removed as (delete from public.classes returning id) select is((select count(*)::int from removed), 0,
          'admin B cannot delete A''s class');
with changed as (update public.grades set score = 0 returning id) select is((select count(*)::int from changed), 0,
          'admin B cannot change A''s grades');

reset role;
create temp table a_ids as
  select c.id as class_id, s.id as student_id, e.id as enrollment_id
  from public.classes c join public.enrollments e on e.class_id = c.id join public.students s on s.id = e.student_id
  where c.name = 'Math A';
grant select on a_ids to authenticated;
select pg_temp.act_as('22222222-2222-2222-2222-222222222222');

select throws_ok($$ insert into public.enrollments (class_id, student_id) select class_id, student_id from a_ids $$,
                 '23503', null, 'admin B cannot enroll into A''s class using A''s ids');
select throws_ok($$ insert into public.enrollments (class_id, student_id)
                    select a.class_id, s.id from a_ids a, public.students s where s.owner_id = '22222222-2222-2222-2222-222222222222' $$,
                 '23503', null, 'admin B cannot put their own student into A''s class');
select throws_ok($$ insert into public.grades (enrollment_id, subject, score) select enrollment_id, 'Hack', 1 from a_ids $$,
                 '23503', null, 'admin B cannot add a grade to A''s enrollment');
select throws_ok($$ insert into public.grades (enrollment_id, subject, score) select enrollment_id, 'Algebra', 1 from a_ids $$,
                 '23503', null, 'probing A''s enrollment with an existing subject reveals nothing');
select throws_ok($$ insert into public.grade_emails (class_id, student_id, recipient, status)
                    select class_id, student_id, 'x@example.com', 'sent' from a_ids $$,
                 '23503', null, 'admin B cannot log an email for A''s student');

-- ---------------------------------------------------------------- anon
reset role;
set local role anon;
select throws_ok($$ select * from public.classes $$, '42501', null, 'anon cannot read classes');
select throws_ok($$ insert into public.classes (name) values ('x') $$, '42501', null, 'anon cannot create classes');

-- ---------------------------------------------------------------- immutability backstop and cascades
reset role;
select throws_ok($$ update public.students set student_number = '7' where name = 'Dana R.' $$,
                 '23514', 'student_number cannot be changed', 'trigger blocks student-number changes even for the table owner');

select pg_temp.act_as('11111111-1111-1111-1111-111111111111');
select lives_ok($$ delete from public.classes where name = 'Math A' $$, 'admin A deletes the class');
select is((select count(*)::int from public.enrollments) + (select count(*)::int from public.grades), 0,
          'deleting a class removes its enrollments and grades');
select is((select count(*)::int from public.students), 1, 'the student record itself is kept for other classes');

select * from finish();
rollback;
