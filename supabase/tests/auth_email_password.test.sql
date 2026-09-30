-- D-083: signup counts split verified / pending, and both auth helpers are
-- service-role only. Run by scripts/test-sql.sh against a scratch database
-- with every migration applied; one rolled-back transaction.

begin;

insert into auth.users (id, email, raw_user_meta_data, email_confirmed_at)
values
  ('00000000-0000-0000-0000-0000000000a1', 'google@example.com', '{}', now()),
  ('00000000-0000-0000-0000-0000000000a2', 'Pending@Example.com', '{}', null),
  ('00000000-0000-0000-0000-0000000000a3', 'old@example.com', '{}', now());
update public.profiles set created_at = now() - interval '90 days'
where id = '00000000-0000-0000-0000-0000000000a3';

do $$
declare
  counts record;
begin
  select * into counts from public.admin_signup_counts(now() - interval '30 days');
  assert counts.verified = 2, format('verified: expected 2, got %s', counts.verified);
  assert counts.verified_since = 1, format('verified_since: expected 1, got %s', counts.verified_since);
  assert counts.pending = 1, format('pending: expected 1, got %s', counts.pending);

  assert public.auth_user_exists('  pending@example.COM '), 'existing email not found';
  assert not public.auth_user_exists('nobody@example.com'), 'missing email reported as existing';

  assert not has_function_privilege('anon', 'public.auth_user_exists(text)', 'execute'),
    'anon can call auth_user_exists';
  assert not has_function_privilege('authenticated', 'public.auth_user_exists(text)', 'execute'),
    'authenticated can call auth_user_exists';
  assert not has_function_privilege('authenticated', 'public.admin_signup_counts(timestamptz)', 'execute'),
    'authenticated can call admin_signup_counts';
  assert has_function_privilege('service_role', 'public.admin_signup_counts(timestamptz)', 'execute'),
    'service_role cannot call admin_signup_counts';
end $$;

rollback;
