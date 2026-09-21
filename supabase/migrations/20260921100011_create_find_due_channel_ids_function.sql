-- Backend-Schema.md §4 / TRD.md §4.2: channels due for a refresh, using the
-- fastest cadence any tracker asked for. WHERE can't reference the MIN()
-- aggregate directly, so the comparison happens in an outer query over a
-- GROUP BY subquery. Server-only (cron job via service role) -- not a
-- user-facing surface, so no RLS-equivalent grant to authenticated/anon.
create function public.find_due_channel_ids()
returns table (channel_id uuid)
language sql
stable
as $$
  select sub.channel_id
  from (
    select
      tc.channel_id,
      min(tc.refresh_cadence_hours) as min_cadence_hours,
      max(c.last_synced_at) as last_synced_at
    from tracked_channels tc
    join channels c on c.id = tc.channel_id
    group by tc.channel_id
  ) sub
  where
    sub.last_synced_at is null
    or sub.last_synced_at < now() - (sub.min_cadence_hours || ' hours')::interval;
$$;

revoke all on function public.find_due_channel_ids() from public, anon, authenticated;
grant execute on function public.find_due_channel_ids() to service_role;
