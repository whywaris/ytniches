-- Local/dev-only test user + baseline data. Never run against a project
-- with real users. Password meets Security.md §2.1 (12+ chars, upper,
-- lower, number).
-- email_change/email_change_token_new/recovery_token: explicit '' rather
-- than the column default (NULL). GoTrue's Go SQL driver scans these as
-- non-nullable strings; a NULL here doesn't break user creation but
-- breaks every later password sign-in with "error finding user: sql:
-- Scan error ... converting NULL to string is unsupported" (a 500 from
-- /auth/v1/token, not a bad-credentials error) -- found live testing the
-- Phase 3 Workspace flow's password login, on a user seeded before this
-- fix existed.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, confirmation_token,
  email_change, email_change_token_new, recovery_token,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated',
  'test@ytniches.dev',
  crypt('TestPassword123!', gen_salt('bf')),
  now(), '',
  '', '', '',
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

-- Mirrors what lib/services/onboarding.ts's completeOnboarding() creates
-- for a real new user (Monetization.md §5.1: 14-day Pro trial, no card).
-- Was tier='free'/status='active' -- 'free' isn't a real product tier
-- (Monetization.md §1.2: no permanent free tier) and predated Task 5.
insert into public.subscriptions (
  user_id, tier, status, provider,
  current_period_start, current_period_end, trial_ends_at, is_current
) values (
  '11111111-1111-1111-1111-111111111111',
  'pro', 'trialing', 'creem',
  now(), now() + interval '14 days', now() + interval '14 days', true
)
on conflict do nothing;

-- Real per-tier monthly allocations (Monetization.md §3.2). Was
-- tier='free'/100 credits -- a placeholder from before D-011/D-012
-- resolved; 'free' isn't a real tier and 100 didn't match any real
-- allocation. Team's rollover_max=500 is Monetization.md §3.3's
-- single-cycle rollover exception; Starter/Pro get none (0).
insert into public.credit_allocations (
  user_id, tier, credits_per_cycle, rollover_max, effective_from
) values
  (null, 'starter', 200, 0, now()),
  (null, 'pro', 1000, 0, now()),
  (null, 'team', 3000, 500, now())
on conflict do nothing;
