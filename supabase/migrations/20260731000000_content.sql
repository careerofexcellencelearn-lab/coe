-- Student stories (testimonials) + editable site content

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  name text not null,
  role text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;
alter table public.site_content enable row level security;

drop policy if exists "testimonials readable by all" on public.testimonials;
create policy "testimonials readable by all" on public.testimonials for select using (true);

drop policy if exists "site content readable by all" on public.site_content;
create policy "site content readable by all" on public.site_content for select using (true);

-- Seed the three existing stories (only if the table is empty)
insert into public.testimonials (quote, name, role)
select * from (
  values
    (
      'Ma''am''s sessions completely changed the way I speak in meetings. The classes are interactive and every concept comes with real practice.',
      'Priya S.', 'HR Executive'
    ),
    (
      'I joined for interview preparation before campus placements. The mock interviews and feedback gave me the confidence I was missing.',
      'Rahul M.', 'Engineering Graduate'
    ),
    (
      'As a working professional, the online format was perfect. Practical business communication lessons I could apply the very next day.',
      'Anjali K.', 'Marketing Professional'
    )
) as seed(quote, name, role)
where not exists (select 1 from public.testimonials);
