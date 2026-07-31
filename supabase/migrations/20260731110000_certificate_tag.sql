-- Optional per-service "Certificate Provided" tag, set by the admin and
-- shown on the home page service card.
alter table public.services
  add column if not exists certificate_provided boolean not null default false;
