-- Pricing promises vs product (2026-09-25).
--
-- 1. Default monthly credit allocations (Monetization.md §3.2). Until now
--    these rows existed only as hand-inserted data in ytniches-dev, so a
--    fresh database (production) would allocate 0 credits on a first
--    payment. Values must equal TIER_INFO.<tier>.monthlyCredits in
--    lib/billing/plans.ts -- tests/lib/billing/plans.test.ts enforces it.
--    Idempotent: skips any tier that already has a default row.
--
-- 2. Backfill tracked_channels.refresh_cadence_hours from each tracker's
--    current plan: Starter 24h, Pro 6h, Team 1h, trial/none/lapsed 24h
--    (TIER_INFO.<tier>.refreshCadenceHours / TRIAL.refreshCadenceHours in
--    lib/billing/plans.ts, same test). New rows and plan changes are
--    handled in code (saveChannelToTracking, applyRefreshCadence).
--
-- Down:
--   delete from public.credit_allocations
--     where user_id is null and tier in ('starter', 'pro', 'team')
--     and effective_from >= '2026-09-25';
--   update public.tracked_channels set refresh_cadence_hours = 24;

insert into public.credit_allocations (tier, credits_per_cycle)
select v.tier::public.subscription_tier, v.credits
from (values ('starter', 200), ('pro', 1000), ('team', 3000)) as v (tier, credits)
where not exists (
  select 1
  from public.credit_allocations ca
  where ca.tier = v.tier::public.subscription_tier
    and ca.user_id is null
);

update public.tracked_channels tc
set refresh_cadence_hours = case
  when s.status in ('active', 'past_due') and s.tier = 'pro' then 6
  when s.status in ('active', 'past_due') and s.tier = 'team' then 1
  else 24
end
from public.subscriptions s
where s.user_id = tc.user_id
  and s.is_current;
