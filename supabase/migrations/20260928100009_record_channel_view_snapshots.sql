-- Down:
-- drop trigger if exists record_channel_view_snapshot on public.channels;
-- drop function if exists public.record_channel_view_snapshot();

-- D-077: one total-views reading per channel per day, from ANY refresh
-- (search, sync, discovery, enrichment), with no app code and no extra
-- YouTube quota. Total views only grow, so the day keeps its highest
-- reading: a cached (older) refresh later in the day can't lower it. An
-- emptied channel (the 30-day purge sets its counts to 0) records nothing.
create or replace function public.record_channel_view_snapshot()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.total_view_count > 0 then
    insert into public.channel_view_snapshots (channel_id, snapshot_date, total_view_count)
    values (new.id, current_date, new.total_view_count)
    on conflict (channel_id, snapshot_date) do update
      set total_view_count = greatest(
        public.channel_view_snapshots.total_view_count,
        excluded.total_view_count
      );
  end if;
  return new;
end;
$$;

revoke all on function public.record_channel_view_snapshot() from public, anon, authenticated;

create trigger record_channel_view_snapshot
  after insert or update of total_view_count on public.channels
  for each row execute function public.record_channel_view_snapshot();
