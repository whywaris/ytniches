-- Local/dev-only test user + baseline data. Never run against a project
-- with real users. Password meets Security.md §2.1 (12+ chars, upper,
-- lower, number).
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, confirmation_token,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated',
  'test@ytniches.dev',
  crypt('TestPassword123!', gen_salt('bf')),
  now(), '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Test User"}'::jsonb,
  now(), now()
)
on conflict (id) do nothing;

insert into auth.identities (
  provider_id, user_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) values (
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  jsonb_build_object(
    'sub', '11111111-1111-1111-1111-111111111111',
    'email', 'test@ytniches.dev'
  ),
  'email',
  now(), now(), now()
)
on conflict (provider, provider_id) do nothing;

-- public.profiles row is auto-created by the handle_new_user trigger above.

insert into public.subscriptions (
  user_id, tier, status, provider,
  current_period_start, current_period_end, is_current
) values (
  '11111111-1111-1111-1111-111111111111',
  'free', 'active', 'manual',
  now(), now() + interval '1 month', true
)
on conflict do nothing;

-- Default free-tier allocation (user_id null). Placeholder value per
-- Backend-Schema.md §2.4 ("Values TBD per D-012").
insert into public.credit_allocations (
  user_id, tier, credits_per_cycle, rollover_max, effective_from
) values (
  null, 'free', 100, 0, now()
)
on conflict do nothing;
