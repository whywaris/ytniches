-- Down:
-- drop table if exists public.outliers_feed;
-- drop table if exists public.niche_snapshots;
-- alter table public.videos drop column if exists outlier_multiple;
-- alter table public.channels
--   drop column if exists avg_views_recent, drop column if exists outlier_score,
--   drop column if exists first_upload_at, drop column if exists uploads_playlist_id,
--   drop column if exists has_shorts, drop column if exists made_for_kids,
--   drop column if exists likely_monetized, drop column if exists is_faceless,
--   drop column if exists niche_id, drop column if exists classification_confidence,
--   drop column if exists classified_at, drop column if exists refresh_tier,
--   drop column if exists enriched_at, drop column if exists discovered_at,
--   drop column if exists discovered_via_seed;
-- drop table if exists public.niches;
-- drop table if exists public.discovery_seeds;

-- Niche Discovery Engine (D-069, Niche-Discovery-Engine.md §5). Extends the
-- shared channels/videos cache rather than forking it: tracking, prompts
-- and calendar already point at those rows.

-- What the crawler searches. Internal: RLS on, zero policies, so only the
-- service role (workers + lib/services/discovery, D-070) can touch it.
create table public.discovery_seeds (
  id uuid primary key default gen_random_uuid(),
  keyword text not null unique,
  source text not null check (source in ('manual', 'user_search', 'expansion')),
  priority int not null default 5 check (priority between 1 and 10),
  last_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index discovery_seeds_due_idx
  on public.discovery_seeds (priority, last_run_at nulls first);

create trigger set_discovery_seeds_updated_at
  before update on public.discovery_seeds
  for each row execute function public.set_updated_at();

alter table public.discovery_seeds enable row level security;

-- AI niche clusters. 'channels' is reserved: /niches/channels/[id] already
-- exists, so a niche with that slug would be unreachable.
create table public.niches (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and slug <> 'channels'),
  name text not null,
  description text,
  embedding extensions.vector(1536),
  status text not null default 'active'
    check (status in ('active', 'rising', 'saturated', 'declining')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_niches_updated_at
  before update on public.niches
  for each row execute function public.set_updated_at();

alter table public.niches enable row level security;

create policy "anyone_read_niches" on public.niches
  for select
  using (true);

-- enriched_at is separate from last_synced_at on purpose: channel-sync
-- keeps tracked channels' last_synced_at fresh without computing the
-- discovery metrics, so enrichment due-ness can't key off it. The 30-day
-- purge still keys off last_synced_at (any refresh counts).
alter table public.channels
  add column avg_views_recent numeric,
  add column outlier_score numeric,
  add column first_upload_at timestamptz,
  add column uploads_playlist_id text,
  add column has_shorts boolean,
  add column made_for_kids boolean,
  add column likely_monetized boolean,
  add column is_faceless boolean,
  add column niche_id uuid references public.niches (id) on delete set null,
  add column classification_confidence numeric
    check (classification_confidence between 0 and 1),
  add column classified_at timestamptz,
  add column refresh_tier text not null default 'warm'
    check (refresh_tier in ('hot', 'warm', 'cold')),
  add column enriched_at timestamptz,
  add column discovered_at timestamptz,
  add column discovered_via_seed uuid references public.discovery_seeds (id) on delete set null;

create index channels_niche_id_idx on public.channels (niche_id);
create index channels_last_synced_at_idx on public.channels (last_synced_at);
create index channels_youtube_created_at_idx on public.channels (youtube_created_at);
create index channels_outlier_score_idx on public.channels (outlier_score desc nulls last);
create index channels_enrichment_due_idx on public.channels (refresh_tier, enriched_at nulls first);

alter table public.videos
  add column outlier_multiple numeric;

-- Daily niche scores; the source of trend arrows and the 90-day chart.
create table public.niche_snapshots (
  niche_id uuid not null references public.niches (id) on delete cascade,
  snapshot_date date not null,
  opportunity_score int not null check (opportunity_score between 0 and 100),
  -- The five signals, percentile-normalised 0-1 (supply inverted: 1 = least
  -- supply). Score = sum of weight x signal (lib/discovery/config.ts).
  demand numeric,
  accessibility numeric,
  momentum numeric,
  outlier_density numeric,
  supply numeric,
  channel_count int not null default 0,
  new_channels_30d int not null default 0,
  median_views numeric,
  -- Denormalised at snapshot time so the feed is a plain indexed read:
  -- trend = score minus the score TREND_WINDOW_DAYS earlier (null if none),
  -- why_chips = the top-2 contributing signals, already worded (spec §8).
  trend int,
  why_chips text[] not null default '{}',
  created_at timestamptz not null default now(),
  primary key (niche_id, snapshot_date)
);

create index niche_snapshots_snapshot_date_idx
  on public.niche_snapshots (snapshot_date, opportunity_score desc);

alter table public.niche_snapshots enable row level security;

create policy "anyone_read_niche_snapshots" on public.niche_snapshots
  for select
  using (true);

-- Global outlier feed: one row per video >= 3x its channel baseline.
create table public.outliers_feed (
  video_id uuid primary key references public.videos (id) on delete cascade,
  channel_id uuid not null references public.channels (id) on delete cascade,
  niche_id uuid references public.niches (id) on delete set null,
  outlier_multiple numeric not null,
  detected_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index outliers_feed_detected_at_idx on public.outliers_feed (detected_at desc);
create index outliers_feed_niche_id_idx on public.outliers_feed (niche_id, detected_at desc);
create index outliers_feed_channel_id_idx on public.outliers_feed (channel_id);

create trigger set_outliers_feed_updated_at
  before update on public.outliers_feed
  for each row execute function public.set_updated_at();

alter table public.outliers_feed enable row level security;

create policy "anyone_read_outliers_feed" on public.outliers_feed
  for select
  using (true);
