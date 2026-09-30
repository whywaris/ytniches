-- Down:
-- drop function if exists public.purge_stale_youtube_data(integer, integer, integer);
-- then re-run 20260928100007_purge_keeps_user_references.sql
-- drop table if exists public.channel_view_snapshots;
-- drop table if exists public.channel_niches;
-- alter table public.channels drop column if exists median_views_recent,
--   drop column if exists content_type, drop column if exists views_last_30d;

-- D-077, Niche Finder redesign.

-- 1. A channel can sit in up to 3 niches (tags + filtering). Niche SCORES
--    still count the primary niche only; channels.niche_id stays as that
--    primary until every reader moves to this table.
create table public.channel_niches (
  channel_id uuid not null references public.channels (id) on delete cascade,
  niche_id uuid not null references public.niches (id) on delete cascade,
  confidence numeric not null check (confidence between 0 and 1),
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (channel_id, niche_id)
);

create unique index channel_niches_one_primary
  on public.channel_niches (channel_id) where is_primary;
create index channel_niches_niche_idx on public.channel_niches (niche_id);

alter table public.channel_niches enable row level security;

-- Same as niches: derived from public data, readable by everyone; only the
-- service role (classify job) writes.
create policy "anyone_read_channel_niches" on public.channel_niches
  for select
  using (true);

insert into public.channel_niches (channel_id, niche_id, confidence, is_primary)
select id, niche_id, coalesce(classification_confidence, 1), true
from public.channels
where niche_id is not null
on conflict do nothing;

-- 2. Card fields, computed at enrichment from the kept recent uploads, so
--    they refresh with the channel (and the 30-day purge empties them).
alter table public.channels
  add column median_views_recent numeric,
  add column content_type text check (content_type in ('long', 'shorts', 'mixed')),
  add column views_last_30d bigint;

-- 3. One total-views reading per channel per day it's refreshed, so "Views
--    (30 days)" can become a true difference once 30 days of readings
--    exist. Kept 30 days (today plus 30 prior dates), inside YouTube's
--    30-day limit; the purge below expires older rows.
create table public.channel_view_snapshots (
  channel_id uuid not null references public.channels (id) on delete cascade,
  snapshot_date date not null,
  total_view_count bigint not null,
  primary key (channel_id, snapshot_date)
);

alter table public.channel_view_snapshots enable row level security;

create policy "anyone_read_channel_view_snapshots" on public.channel_view_snapshots
  for select
  using (true);

-- 4. The purge (D-073) also expires view readings and clears an emptied
--    channel's niche tags. Otherwise identical to 20260928100007.
drop function if exists public.purge_stale_youtube_data(integer, integer);

create or replace function public.purge_stale_youtube_data(
  p_max_age_days integer,
  p_snapshot_days integer default 90,
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
  where s.snapshot_date < current_date - p_snapshot_days
    and extract(isodow from s.snapshot_date) <> 1;
  get diagnostics snapshots_deleted = row_count;

  return next;
end;
$$;

revoke all on function public.purge_stale_youtube_data(integer, integer, integer)
  from public, anon, authenticated;
grant execute on function public.purge_stale_youtube_data(integer, integer, integer)
  to service_role;
