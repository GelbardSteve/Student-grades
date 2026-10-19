# ReactStudentsGradesTable

Admins sign up, create classes, add students and grades, and email each student their grades.

- **reactApp/**: React app. Talks to Supabase directly with the publishable key; every request is checked by Row Level Security.
- **supabase/**: database migrations, database tests and the `send-grade-report` Edge Function.
- **e2e-playwright/**: browser tests.

## Security model

- Admins are Supabase Auth users (email + password, email confirmation required).
- Every row in `classes`, `students`, `enrollments`, `grades` and `grade_emails` has an `owner_id`. RLS policies only let an admin see and change their own rows, and composite foreign keys make sure related rows always share the same owner.
- Student numbers are digits only, unique per admin, and cannot be changed (column privileges plus a trigger).
- Emails are sent by the `send-grade-report` Edge Function, which reads the data with the caller's own session (so RLS applies) and holds the email provider key. No secret or service-role key is ever in the React app.

## Local development

Requires Docker.

```bash
npm install                      # Supabase CLI and test client (repo root)
npm run db:start                 # local Supabase stack; prints local URLs and keys
cp supabase/functions/.env.example supabase/functions/.env   # fill in (or point BREVO_API_URL at a mock)
npm run functions:serve          # Edge Functions

cd reactApp && npm install && npm start   # uses reactApp/.env.development.local (local stack)
```

Create `reactApp/.env.development.local` with the local `API_URL` and `PUBLISHABLE_KEY` from `npx supabase status`:

```
REACT_APP_SUPABASE_URL=http://127.0.0.1:54321
REACT_APP_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Confirmation emails sent by the local stack are visible at http://127.0.0.1:54324.

## Tests

```bash
npm run db:test      # RLS, ownership and data-integrity rules (pgTAP)
npm run test:api     # Data API and Edge Function called directly, as two admins and as anonymous
cd e2e-playwright && npx playwright test   # browser tests (copy .env.example to .env first)
```

## Production

1. Link the project: `npx supabase login` and `npx supabase link --project-ref <ref>`.
2. Apply migrations: `npx supabase db push`.
3. Set function secrets: `npx supabase secrets set --env-file supabase/functions/.env` (real Brevo key, verified sender, production `ALLOWED_ORIGIN`).
4. Deploy the function: `npx supabase functions deploy send-grade-report`.
5. In the Supabase dashboard (Authentication): keep email confirmations on, set the Site URL to the app's address, require at least 8 characters with letters and digits, and configure custom SMTP for confirmation emails.
6. Build the app with `reactApp/.env` (production URL and publishable key): `cd reactApp && npm run build`, and host `reactApp/build` on any static host.
