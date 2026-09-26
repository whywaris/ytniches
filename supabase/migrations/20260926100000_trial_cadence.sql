-- D-060: trials sync at Pro's cadence ("Try every Pro feature free").
-- Backfills channels tracked by users whose current subscription is a
-- trial. Must equal TRIAL.refreshCadenceHours in lib/billing/plans.ts
-- (tests/lib/billing/plans.test.ts). New rows and plan changes are
-- handled in code.
--
-- Down:
--   update public.tracked_channels tc set refresh_cadence_hours = 24
--   from public.subscriptions s
--   where s.user_id = tc.user_id and s.is_current and s.status = 'trialing';

update public.tracked_channels tc
set refresh_cadence_hours = 6
from public.subscriptions s
where s.user_id = tc.user_id
  and s.is_current
  and s.status = 'trialing';
