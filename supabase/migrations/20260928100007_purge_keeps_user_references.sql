-- Down:
-- alter table public.prompts drop constraint prompts_source_video_id_fkey,
--   add constraint prompts_source_video_id_fkey foreign key (source_video_id)
--   references public.videos (id) on delete cascade;
-- then re-run 20260928100006_extend_youtube_purge_for_discovery.sql

-- The purge must never delete user-created rows (D-073). Two guards:
--
-- 1. purge_stale_youtube_data no longer deletes a channel that a calendar
--    entry, a notification override or a channel-linked task references.
--    calendar_entries.channel_id is ON DELETE SET NULL, so the entry would
--    have survived, but it would silently lose its channel; overrides are
--    ON DELETE CASCADE and would have gone. Such channels are emptied instead.
--
-- 2. prompts.source_video_id goes from ON DELETE CASCADE to RESTRICT. Today
--    only the purge's "not exists prompt" check keeps prompts alive; with
--    RESTRICT any other path that deletes a prompted video fails loudly
--    instead of deleting the user's prompts.

alter table public.prompts
  drop constraint prompts_source_video_id_fkey,
  add constraint prompts_source_video_id_fkey foreign key (source_video_id)
    references public.videos (id) on delete restrict;

create or replace function public.purge_stale_youtube_data(
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
