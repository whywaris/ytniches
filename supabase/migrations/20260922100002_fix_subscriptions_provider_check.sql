-- Down:
-- alter table public.subscriptions drop constraint subscriptions_provider_check;
-- alter table public.subscriptions add constraint subscriptions_provider_check
--   check (provider in ('stripe', 'paddle', 'manual'));

-- D-010 (Resolved 2026-09-19): Creem.io, not Stripe/Paddle. The original
-- check constraint (supabase/migrations/20260920095004_create_subscriptions.sql)
-- predates that resolution and still only allows 'stripe'/'paddle'/'manual' --
-- a hard block on every real webhook insert, not just stale doc text.
-- 'manual' kept for admin-granted/comp subscriptions.
alter table public.subscriptions drop constraint subscriptions_provider_check;

alter table public.subscriptions add constraint subscriptions_provider_check
  check (provider in ('creem', 'manual'));
