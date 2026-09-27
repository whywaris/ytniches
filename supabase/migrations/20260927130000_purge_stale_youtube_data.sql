-- Down:
-- drop function if exists public.purge_stale_youtube_data(integer);

-- D-067b / YouTube Developer Policies III.E.4.d: YouTube API data we
-- haven't refreshed in p_max_age_days (30, lib/youtube/retention.ts) is
-- deleted, or emptied where deleting would destroy a user's own work:
--   * tracked_events + YouTube notifications older than the window go
--     (their payloads/text hold titles and view counts)
--   * stale videos go, unless a saved prompt or thumbnail idea points at
--     one -- prompts cascade from videos -- then only the YouTube fields
--     are emptied and the user's generated output stays
--   * stale channels nobody tracks and with no remaining videos go; any
--     other stale channel (tracked but not syncing) is emptied down to its
--     YouTube id, so a resumed sync can refresh it
-- Tracked channels are re-synced far inside the window, so they're
-- untouched. Idempotent; returns what it did.
create or replace function public.purge_stale_youtube_data(p_max_age_days integer)
returns table (
  events_deleted integer,
  notifications_deleted integer,
  videos_deleted integer,
  videos_emptied integer,
  channels_deleted integer,
  channels_emptied integer
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  cutoff timestamptz := now() - make_interval(days => p_max_age_days);
begin
  delete from public.tracked_events where detected_at < cutoff;
  get diagnostics events_deleted = row_count;

  delete from public.notifications
  where created_at < cutoff
    and notification_type in ('new_video', 'view_spike', 'cadence_change', 'outlier_detected');
  get diagnostics notifications_deleted = row_count;

  delete from public.videos v
  where v.last_synced_at < cutoff
    and not exists (select 1 from public.prompts p where p.source_video_id = v.id);
  get diagnostics videos_deleted = row_count;

  update public.videos
  set title = '', description = null, tags = '{}', thumbnail_url = '', language = null,
      duration_seconds = 0, view_count = 0, like_count = null, comment_count = null,
      published_at = 'epoch', has_transcript = false
  where last_synced_at < cutoff and (title <> '' or view_count <> 0);
  get diagnostics videos_emptied = row_count;

  delete from public.channels c
  where c.last_synced_at < cutoff
    and not exists (select 1 from public.tracked_channels tc where tc.channel_id = c.id)
    and not exists (select 1 from public.videos v where v.channel_id = c.id);
  get diagnostics channels_deleted = row_count;

  update public.channels
  set name = '', handle = null, description = null, avatar_url = null, banner_url = null,
      country = null, language = null, is_monetized = null, subscriber_count = 0,
      video_count = 0, total_view_count = 0, youtube_created_at = 'epoch'
  where last_synced_at < cutoff and (name <> '' or subscriber_count <> 0);
  get diagnostics channels_emptied = row_count;

  return next;
end;
$$;

revoke all on function public.purge_stale_youtube_data(integer) from public, anon, authenticated;
grant execute on function public.purge_stale_youtube_data(integer) to service_role;
