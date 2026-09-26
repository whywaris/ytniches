-- Down:
-- delete from public.credit_events where idempotency_key like 'ledger-cutover:%';
-- drop function if exists public.credit_balance(uuid);

-- D-063 / Monetization.md §3.3. The balance becomes the sum of the whole
-- ledger; cycle resets are explicit 'expiration' rows written at each cycle
-- close (lib/credits/ledger.ts). Before this, the balance only summed rows
-- since the current period start, which reset implicitly but also wiped
-- grants and left no room for Team rollover.

-- Summed in SQL, not in the app: PostgREST caps a select at 1,000 rows.
-- security invoker, so RLS still limits a signed-in user to their own rows.
create or replace function public.credit_balance(p_user_id uuid)
returns integer
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(sum(amount), 0)::integer
  from public.credit_events
  where user_id = p_user_id;
$$;

-- Cutover: expire everything from past cycles, so each user's balance is
-- exactly what it was under the old windowed rule. Idempotent per user.
insert into public.credit_events (user_id, event_type, amount, reason, idempotency_key)
select
  totals.user_id,
  'expiration',
  -(totals.all_time - totals.this_cycle),
  'Credits from past cycles expired (ledger cutover)',
  'ledger-cutover:' || totals.user_id
from (
  select
    e.user_id,
    sum(e.amount) as all_time,
    coalesce(
      sum(e.amount) filter (
        where e.created_at >= coalesce(
          s.current_period_start,
          date_trunc('month', now() at time zone 'utc') at time zone 'utc'
        )
      ),
      0
    ) as this_cycle
  from public.credit_events e
  left join public.subscriptions s on s.user_id = e.user_id and s.is_current
  group by e.user_id, s.current_period_start
) totals
where totals.all_time - totals.this_cycle > 0
on conflict do nothing;
