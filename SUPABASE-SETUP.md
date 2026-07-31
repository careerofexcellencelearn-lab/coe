# Supabase Setup — Career of Excellence

The app currently runs on a local JSON file (`data/db.json`) in **prototype mode** (any login works).
Everything below prepares the switch to Supabase for the real project.

## 1. Add your keys

Copy `.env.example` to `.env.local` and fill in from
**Supabase Dashboard → Project Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        ← server-only, keep secret
ADMIN_EMAIL=careerofexcellence.learn@gmail.com
```

## 2. Create the database

Open **SQL Editor** in the Supabase dashboard, paste the whole of
`supabase/schema.sql`, and Run. This creates:

- `profiles` (linked to Supabase Auth users, with a `role` column)
- `services`, `registrations`, `attendance`, `materials` tables
- a public `materials` storage bucket for PDFs/PPTs/images
- the two seed services
- sets `careerofexcellence.learn@gmail.com` as **admin**
  (create that user first in **Authentication → Users → Add user** if it
  doesn't exist yet, then re-run the last UPDATE statement)

## 3. What changes when Supabase goes live

| Feature | Prototype (now) | Supabase (after switch) |
|---|---|---|
| Login | any email/password | real Supabase Auth (email + password) |
| Admin | any login on /admin | only `careerofexcellence.learn@gmail.com` (role=admin) |
| Enrolment | JSON file | creates Auth user + registration row |
| Services / offers / timings | JSON file | `services` table |
| Attendance | JSON file | `attendance` table |
| Materials | files in `public/uploads` | Supabase Storage bucket `materials` |

## 4. Flipping the switch

After steps 1–2 are done, tell Claude "the Supabase keys are in .env.local" —
the API routes get switched from the JSON store to Supabase
(`lib/supabase.ts` is already in place) and tested end-to-end.
