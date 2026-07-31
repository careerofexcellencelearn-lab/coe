-- Career of Excellence — initial schema

-- ── Profiles (role per auth user) ────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text not null default '',
  phone text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

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

-- ── Materials (metadata; files live in Storage bucket 'materials')
create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete cascade,
  name text not null,
  storage_path text not null,
  mime text not null default '',
  size bigint not null default 0,
  uploaded_at timestamptz not null default now()
);

-- ── App sessions (login persists until explicit logout) ──────────
create table if not exists public.sessions (
  token uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  email text not null,
  role text not null check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- ── Storage bucket for materials ─────────────────────────────────
insert into storage.buckets (id, name, public)
values ('materials', 'materials', true)
on conflict (id) do nothing;

-- ── Row Level Security (app uses service role; RLS guards anon key)
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.registrations enable row level security;
alter table public.attendance enable row level security;
alter table public.materials enable row level security;
alter table public.sessions enable row level security;

drop policy if exists "services readable by all" on public.services;
create policy "services readable by all" on public.services for select using (true);

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "own registrations" on public.registrations;
create policy "own registrations" on public.registrations for select using (auth.uid() = user_id);

drop policy if exists "own attendance" on public.attendance;
create policy "own attendance" on public.attendance for select
  using (exists (select 1 from public.registrations r where r.id = registration_id and r.user_id = auth.uid()));

-- ── Seed the two services (only if none exist yet) ───────────────
insert into public.services
  (title, description, objectives, duration, price, offer_price, offer_label)
select * from (
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
      '8 Weeks · Live Online', 5999::numeric, 4499::numeric, 'Launch Offer'
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
      '10 Weeks · Live Online', 8999::numeric, null::numeric, ''
    )
) as seed(title, description, objectives, duration, price, offer_price, offer_label)
where not exists (select 1 from public.services);

-- ── Make the admin account an admin (auth user must already exist)
update public.profiles set role = 'admin'
where email = 'careerofexcellence.learn@gmail.com';

-- If the auth user was created before this migration (no trigger yet),
-- backfill their profile and set the admin role.
insert into public.profiles (id, email, name, role)
select u.id, u.email, split_part(u.email, '@', 1), 'admin'
from auth.users u
where u.email = 'careerofexcellence.learn@gmail.com'
on conflict (id) do update set role = 'admin';
