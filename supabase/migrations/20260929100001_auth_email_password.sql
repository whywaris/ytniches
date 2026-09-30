-- Down:
-- drop function if exists public.admin_signup_counts(timestamptz);
-- drop function if exists public.auth_user_exists(text);

-- D-083: email + password sign-up (D-015 resolved). Both functions read
-- auth.users, which the Data API can't, so they're SECURITY DEFINER and
-- executable by the service role only (D-070): nothing in the browser can
-- call them.

-- Admin dashboard: only verified accounts count as signups; unverified
-- email sign-ups are shown separately as "pending verification". Google
-- accounts arrive verified.
create or replace function public.admin_signup_counts(p_since timestamptz)
returns table (verified bigint, verified_since bigint, pending bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select
    count(*) filter (where u.email_confirmed_at is not null),
    count(*) filter (where u.email_confirmed_at is not null and p.created_at >= p_since),
    count(*) filter (where u.email_confirmed_at is null)
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.deleted_at is null;
$$;

-- The login lockout alert (Security.md §2.4) goes only to an address that
-- has an account; the lock itself applies to any address so the login
-- page never reveals which ones exist.
create or replace function public.auth_user_exists(p_email text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from auth.users where lower(email) = lower(trim(p_email)));
$$;

revoke execute on function public.admin_signup_counts(timestamptz) from public;
revoke execute on function public.admin_signup_counts(timestamptz) from anon;
revoke execute on function public.admin_signup_counts(timestamptz) from authenticated;
revoke execute on function public.auth_user_exists(text) from public;
revoke execute on function public.auth_user_exists(text) from anon;
revoke execute on function public.auth_user_exists(text) from authenticated;
grant execute on function public.admin_signup_counts(timestamptz) to service_role;
grant execute on function public.auth_user_exists(text) to service_role;
