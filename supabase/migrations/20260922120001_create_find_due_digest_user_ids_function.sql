-- TRD.md §4.2 "digest.email: Scheduled Daily 8am user local" + Phase 2 Task
-- 2's constraint (only users with >=1 tracked channel). Same hourly-cron
-- "find due, dispatch events" shape as find_due_channel_ids -- a single
-- global cron can't be "8am" for every time zone at once, so this runs
-- hourly and filters to whoever's local wall-clock hour is 8 right now.
-- distinct on (user_id) is safe because digest_cadence/digest_day_of_week
-- are kept identical across a user's notification_preferences rows
-- (Backend-Schema.md §4.4, Phase 2 Task 2 gap 2) -- any one row is
-- authoritative. search_path pinned + schema-qualified from the start,
-- matching find_due_channel_ids' own hardening fix.
create function public.find_due_digest_user_ids()
returns table (user_id uuid, cadence text)
language sql
stable
set search_path = ''
as $$
  select distinct on (np.user_id)
    np.user_id,
    np.digest_cadence as cadence
  from public.notification_preferences np
  join public.profiles p on p.id = np.user_id
  where np.digest_cadence in ('daily', 'weekly')
    and extract(hour from (now() at time zone p.time_zone))::int = 8
    and (
      np.digest_cadence = 'daily'
      or np.digest_day_of_week = extract(dow from (now() at time zone p.time_zone))::int
    )
    and exists (
      select 1 from public.tracked_channels tc where tc.user_id = np.user_id
    )
  order by np.user_id;
$$;

revoke all on function public.find_due_digest_user_ids() from public, anon, authenticated;
grant execute on function public.find_due_digest_user_ids() to service_role;
