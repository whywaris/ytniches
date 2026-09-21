-- Supabase advisor flagged the function from the previous migration as
-- having a mutable search_path (a schema-shadowing risk for a SECURITY
-- DEFINER-adjacent function). Pins it and schema-qualifies the table refs.
create or replace function public.find_due_channel_ids()
returns table (channel_id uuid)
language sql
stable
set search_path = ''
as $$
  select sub.channel_id
  from (
    select
      tc.channel_id,
      min(tc.refresh_cadence_hours) as min_cadence_hours,
      max(c.last_synced_at) as last_synced_at
    from public.tracked_channels tc
    join public.channels c on c.id = tc.channel_id
    group by tc.channel_id
  ) sub
  where
    sub.last_synced_at is null
    or sub.last_synced_at < now() - (sub.min_cadence_hours || ' hours')::interval;
$$;
