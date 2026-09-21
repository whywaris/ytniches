-- Down:
-- delete from public.credit_events
--   where event_type = 'allocation' and reason = 'Trial allocation — Phase 0 seed';
-- create or replace function public.handle_new_user()
-- returns trigger
-- language plpgsql
-- security definer
-- set search_path = public
-- as $$
-- begin
--   insert into public.profiles (id, name, avatar_url)
--   values (
--     new.id,
--     new.raw_user_meta_data ->> 'full_name',
--     new.raw_user_meta_data ->> 'avatar_url'
--   );
--   return new;
-- end;
-- $$;

-- Monetization.md §3.2: trial allocation is 50 credits, one-time. Billing
-- (Phase 1 Task 5) hasn't shipped yet, so without this every user's balance
-- is 0 and lib/credits' balance check blocks every action — this seeds the
-- trial allocation now so the consume-and-check path is actually
-- exercisable in Phase 1. Real per-cycle allocation logic (credit_events
-- §2.4 credit_allocations, renewal jobs) still belongs to Task 5.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );

  insert into public.credit_events (user_id, event_type, amount, reason)
  values (new.id, 'allocation', 50, 'Trial allocation — Phase 0 seed');

  return new;
end;
$$;

-- Backfill: profiles created before this migration (e.g. the Phase 0 OAuth
-- test account) never got an allocation event. Guarded by NOT EXISTS so
-- re-running this migration is safe.
insert into public.credit_events (user_id, event_type, amount, reason)
select id, 'allocation', 50, 'Trial allocation — Phase 0 seed'
from public.profiles
where not exists (
  select 1 from public.credit_events
  where credit_events.user_id = profiles.id
    and credit_events.event_type = 'allocation'
);
