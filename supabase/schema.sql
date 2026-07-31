-- Career of Excellence — Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New query → paste → Run

-- ── Profiles (role per auth user) ────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text not null default '',
  phone text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile whenever an auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Services ─────────────────────────────────────────────────────
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  objectives text[] not null default '{}',
  duration text not null default '',
  price numeric not null default 0,
  offer_price numeric,
  offer_label text not null default '',
  class_start text not null default '10:00',
  class_end text not null default '18:00',
  one_on_one_start text not null default '19:00',
  one_on_one_end text not null default '20:00',
  zoom_link text not null default '',
  created_at timestamptz not null default now()
);

-- ── Registrations ────────────────────────────────────────────────
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete cascade,
  message text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved')),
  paid boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, service_id)
);

-- ── Attendance ───────────────────────────────────────────────────
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations (id) on delete cascade,
  date date not null,
  type text not null check (type in ('class', 'oneonone')),
  created_at timestamptz not null default now(),
  unique (registration_id, date, type)
);

-- ── Materials (metadata; files live in Storage bucket 'materials') ─
create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete cascade,
  name text not null,
  storage_path text not null,
  mime text not null default '',
  size bigint not null default 0,
  uploaded_at timestamptz not null default now()
);

-- ── Storage bucket for materials ─────────────────────────────────
insert into storage.buckets (id, name, public)
values ('materials', 'materials', true)
on conflict (id) do nothing;

-- ── Row Level Security ───────────────────────────────────────────
-- The app talks to the DB through the server with the service-role key,
-- so RLS mainly protects against direct client access with the anon key.
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.registrations enable row level security;
alter table public.attendance enable row level security;
alter table public.materials enable row level security;

-- Services are publicly readable (shown on the home page)
drop policy if exists "services readable by all" on public.services;
create policy "services readable by all" on public.services for select using (true);

-- Users can read their own profile
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for select using (auth.uid() = id);

-- Users can read their own registrations
drop policy if exists "own registrations" on public.registrations;
create policy "own registrations" on public.registrations for select using (auth.uid() = user_id);

-- Users can read their own attendance
drop policy if exists "own attendance" on public.attendance;
create policy "own attendance" on public.attendance for select
  using (exists (select 1 from public.registrations r where r.id = registration_id and r.user_id = auth.uid()));

-- ── Seed the two services ────────────────────────────────────────
insert into public.services
  (title, description, objectives, duration, price, offer_price, offer_label)
values
  (
    'Soft Skills & Business Communication',
    'One complete program covering the interpersonal and professional communication skills every career is built on — taught through live practice sessions.',
    array[
      'Communicate clearly and confidently in any situation',
      'Write professional emails, reports and messages',
      'Speak up in meetings and deliver impactful presentations',
      'Master teamwork, time management and workplace etiquette'
    ],
    '8 Weeks · Live Online', 5999, 4499, 'Launch Offer'
  ),
  (
    'IELTS & TOEFL Training',
    'Complete preparation for both IELTS and TOEFL with score-boosting strategies, regular mock tests and personal feedback on every module.',
    array[
      'Master Listening, Reading, Writing & Speaking modules',
      'Learn score-boosting strategies and time management',
      'Practise with regular mock tests and personal feedback',
      'Build the vocabulary and grammar for IELTS Band 7+ / TOEFL 100+'
    ],
    '10 Weeks · Live Online', 8999, null, ''
  )
on conflict do nothing;

-- ── Make the admin account an admin ──────────────────────────────
-- (The auth user careerofexcellence.learn@gmail.com must already exist
--  in Authentication → Users; run this after it does.)
update public.profiles set role = 'admin'
where email = 'careerofexcellence.learn@gmail.com';
