-- Certificates: one per registration, uploaded by admin, downloadable by the student

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations (id) on delete cascade unique,
  name text not null,
  storage_path text not null,
  uploaded_at timestamptz not null default now()
);

alter table public.certificates enable row level security;

drop policy if exists "own certificate" on public.certificates;
create policy "own certificate" on public.certificates for select
  using (exists (select 1 from public.registrations r where r.id = registration_id and r.user_id = auth.uid()));
