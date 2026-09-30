-- Down: re-run section 4 of 20260928100008_channel_niches_and_card_fields.sql
-- (daily snapshots kept 90 days, Mondays kept indefinitely).

-- D-084: YouTube Developer Policies III.E.4 allow statistics from API Data
-- (Non-Authorized Data) to be stored for at most 30 days, and niche
-- snapshots are statistics derived from it. Until the derived-metrics
-- amendment is accepted (then up to 36 months), every snapshot older than
-- p_snapshot_days is deleted: no weekly Monday rows kept, and the default
-- drops from 90 to 30. Otherwise identical to 20260928100008.
create or replace function public.purge_stale_youtube_data(
  p_max_age_days integer,
  p_snapshot_days integer default 30,
  p_view_snapshot_days integer default 30
)
returns table (
  events_deleted integer,
  notifications_deleted integer,
  videos_deleted integer,
  videos_emptied integer,
  channels_deleted integer,
  channels_emptied integer,
  outliers_deleted integer,
  snapshots_deleted integer,
  view_snapshots_deleted integer
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

  -- A channel any user-created row points at is emptied below, never
  -- deleted: calendar entries (soft-deleted ones too, they can be restored),
  -- per-channel notification settings, and tasks linked to the channel.
  delete from public.channels c
  where c.last_synced_at < cutoff
    and not exists (select 1 from public.tracked_channels tc where tc.channel_id = c.id)
    and not exists (select 1 from public.videos v where v.channel_id = c.id)
    and not exists (select 1 from public.calendar_entries ce where ce.channel_id = c.id)
    and not exists (
      select 1 from public.notification_channel_overrides o where o.channel_id = c.id
    )
    and not exists (
      select 1 from public.tasks t where t.linked_type = 'channel' and t.linked_id = c.id
    );
  get diagnostics channels_deleted = row_count;

  -- Niche tags and view readings of channels about to be emptied go too:
  -- both are derived from their YouTube data.
  delete from public.channel_niches cn
  using public.channels c
  where c.id = cn.channel_id and c.last_synced_at < cutoff;

  delete from public.channel_view_snapshots s
  where s.snapshot_date < current_date - p_view_snapshot_days
    or exists (
      select 1 from public.channels c where c.id = s.channel_id and c.last_synced_at < cutoff
    );
  get diagnostics view_snapshots_deleted = row_count;

  update public.channels
  set name = '', handle = null, description = null, avatar_url = null, banner_url = null,
      country = null, language = null, is_monetized = null, subscriber_count = 0,
      video_count = 0, total_view_count = 0, youtube_created_at = 'epoch',
      avg_views_recent = null, outlier_score = null, first_upload_at = null,
      uploads_playlist_id = null, has_shorts = null, made_for_kids = null,
      likely_monetized = null, is_faceless = null, niche_id = null,
      classification_confidence = null, classified_at = null, enriched_at = null,
      median_views_recent = null, content_type = null, views_last_30d = null
  where last_synced_at < cutoff and (name <> '' or subscriber_count <> 0 or enriched_at is not null);
  get diagnostics channels_emptied = row_count;

  delete from public.niche_snapshots s
  where s.snapshot_date < current_date - p_snapshot_days;
  get diagnostics snapshots_deleted = row_count;

  return next;
end;
$$;


revoke all on function public.purge_stale_youtube_data(integer, integer, integer)
  from public, anon, authenticated;
grant execute on function public.purge_stale_youtube_data(integer, integer, integer)
  to service_role;
