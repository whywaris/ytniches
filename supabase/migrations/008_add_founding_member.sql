alter table public.users
  add column if not exists is_founding_member boolean not null default false;
