-- Down:
-- drop function if exists public.purge_stale_youtube_data(integer, integer);
-- then re-run 20260927130000_purge_stale_youtube_data.sql

-- D-073: one 30-day purge. Extends main's purge_stale_youtube_data (D-067b,
-- YouTube Developer Policies III.E.4.d, 20260927130000) to the Discovery
-- Engine's tables instead of running a second purge. Main's rules are kept
-- verbatim -- including "a stale video a saved prompt or thumbnail idea
-- points at is emptied, not deleted" -- and the discovery steps are added:
--   * outliers_feed rows for stale videos or channels go first, so an
--     emptied video never lingers in the global feed
--   * emptying a video also clears its outlier_multiple
--   * emptying a channel also clears every YouTube-derived discovery column
--     (enriched_at included, so the feeds drop it); our own provenance
--     (discovered_at, discovered_via_seed, refresh_tier) stays
--   * niche_snapshots (per-niche aggregates, no titles or per-video data)
--     older than p_snapshot_days roll up to one row per ISO week
-- The return type grows, so the function is dropped and recreated. This
-- also removes the discovery branch's earlier 3-argument purge from any
-- database it reached (ytniches-dev).

drop function if exists public.purge_stale_youtube_data(integer, integer, integer);
drop function if exists public.purge_stale_youtube_data(integer);

create function public.purge_stale_youtube_data(
  p_max_age_days integer,
  p_snapshot_days integer default 90
)
returns table (
  events_deleted integer,
  notifications_deleted integer,
  videos_deleted integer,
  videos_emptied integer,
  channels_deleted integer,
  channels_emptied integer,
  outliers_deleted integer,
  snapshots_deleted integer
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

  -- Discovery: before videos are deleted or emptied.
  delete from public.outliers_feed o
  where exists (
      select 1 from public.videos v where v.id = o.video_id and v.last_synced_at < cutoff
    )
    or exists (
      select 1 from public.channels c where c.id = o.channel_id and c.last_synced_at < cutoff
    );
  get diagnostics outliers_deleted = row_count;

  delete from public.videos v
  where v.last_synced_at < cutoff
    and not exists (select 1 from public.prompts p where p.source_video_id = v.id);
  get diagnostics videos_deleted = row_count;

  update public.videos
  set title = '', description = null, tags = '{}', thumbnail_url = '', language = null,
      duration_seconds = 0, view_count = 0, like_count = null, comment_count = null,
      published_at = 'epoch', has_transcript = false,
      outlier_multiple = null
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
      video_count = 0, total_view_count = 0, youtube_created_at = 'epoch',
      avg_views_recent = null, outlier_score = null, first_upload_at = null,
      uploads_playlist_id = null, has_shorts = null, made_for_kids = null,
      likely_monetized = null, is_faceless = null, niche_id = null,
      classification_confidence = null, classified_at = null, enriched_at = null
  where last_synced_at < cutoff and (name <> '' or subscriber_count <> 0 or enriched_at is not null);
  get diagnostics channels_emptied = row_count;

  delete from public.niche_snapshots s
  where s.snapshot_date < current_date - p_snapshot_days
    and extract(isodow from s.snapshot_date) <> 1;
  get diagnostics snapshots_deleted = row_count;

  return next;
end;
$$;

revoke all on function public.purge_stale_youtube_data(integer, integer)
  from public, anon, authenticated;
grant execute on function public.purge_stale_youtube_data(integer, integer) to service_role;
