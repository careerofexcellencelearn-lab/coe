-- Demo / counselling requests and general enquiries from the public website.
-- Only the server (service role) reads or writes this table: RLS is on with no policies.

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'demo' check (kind in ('demo', 'enquiry')),
  name text not null,
  phone text not null,
  email text not null,
  program text not null default '',
  contact_method text not null default '' check (contact_method in ('', 'phone', 'whatsapp', 'email')),
  preferred_time text not null default '',
  message text not null default '',
  consent boolean not null default false,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists enquiries_created_at_idx on public.enquiries (created_at desc);

alter table public.enquiries enable row level security;
