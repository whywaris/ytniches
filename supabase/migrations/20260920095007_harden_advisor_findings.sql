-- Down:
-- grant execute on function public.handle_new_user() to anon, authenticated;
-- create or replace function public.set_updated_at() returns trigger
--   language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

-- Fixes from `get_advisors` (security) after the initial schema migrations:
--
-- 1. set_updated_at had a mutable search_path (function_search_path_mutable).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2. handle_new_user is a `returns trigger` function, only ever meant to
-- fire from the auth.users trigger — but Supabase's default grants make it
-- callable directly via PostgREST (anon_security_definer_function_executable,
-- authenticated_security_definer_function_executable). Revoking EXECUTE
-- from anon/authenticated does not affect the trigger itself (trigger
-- firing isn't gated by EXECUTE grants), it only closes the direct RPC path.
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;
