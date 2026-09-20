-- Down:
-- drop function if exists public.set_updated_at();
-- drop extension if exists pgcrypto;

-- pgcrypto: needed for crypt()/gen_salt() used by supabase/seed.sql to create
-- a local/dev test user directly in auth.users. gen_random_uuid() itself is
-- Postgres core (13+) and does not need this extension.
create extension if not exists pgcrypto;

-- Shared updated_at trigger (Backend-Schema.md §1.2: every table auto-updates
-- updated_at via trigger on any row change).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
