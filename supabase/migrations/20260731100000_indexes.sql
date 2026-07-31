-- Indexes for the most frequent lookups so queries stay fast as
-- registrations and materials grow.
-- (registrations.user_id and attendance.registration_id are already covered
--  by their unique constraints; sessions.token is the primary key.)

create index if not exists registrations_service_status_idx
  on public.registrations (service_id, status);

create index if not exists materials_service_idx
  on public.materials (service_id);
