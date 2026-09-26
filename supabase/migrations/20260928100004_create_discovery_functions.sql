-- Down:
-- drop function if exists public.purge_stale_youtube_data(int, int, int);
-- drop function if exists public.niche_signal_inputs(numeric, bigint, int, numeric);
-- drop function if exists public.match_niche(extensions.vector, double precision);
-- drop function if exists public.find_due_enrichment_channel_ids(int, int, int, int);

-- Niche Discovery Engine helpers (D-069). All are called by server-only
-- workers through the service role (D-070), so EXECUTE is revoked from
-- everyone else. Tunables are parameters, not literals: the TS side
-- (lib/discovery/config.ts) is the single source of truth for them.

-- Channels due for enrichment by refresh tier. Tracked channels first
-- (spec §14 step 3: enrichment is seeded from what users already track),
-- then never-enriched, then oldest.
create or replace function public.find_due_enrichment_channel_ids(
  p_limit int,
  p_hot_days int,
  p_warm_days int,
  p_cold_days int
)
returns table (channel_id uuid)
language sql
stable
set search_path = ''
as $$
  select c.id
  from public.channels c
  where c.unavailable_since is null
    and (
      c.enriched_at is null
      or c.enriched_at < now() - make_interval(days => case c.refresh_tier
        when 'hot' then p_hot_days
        when 'warm' then p_warm_days
        else p_cold_days
      end)
    )
  order by
    exists (select 1 from public.tracked_channels tc where tc.channel_id = c.id) desc,
    c.enriched_at asc nulls first
  limit p_limit;
$$;

revoke all on function public.find_due_enrichment_channel_ids(int, int, int, int)
  from public, anon, authenticated;
grant execute on function public.find_due_enrichment_channel_ids(int, int, int, int)
  to service_role;

-- Nearest existing niche to a label embedding, if it clears the cosine
-- similarity threshold (D-074: 0.85).
create or replace function public.match_niche(
  p_embedding extensions.vector,
  p_min_similarity double precision
)
returns table (niche_id uuid, similarity double precision)
language sql
stable
set search_path = ''
as $$
  select n.id, 1 - (n.embedding operator(extensions.<=>) p_embedding) as similarity
  from public.niches n
  where n.embedding is not null
    and 1 - (n.embedding operator(extensions.<=>) p_embedding) >= p_min_similarity
  order by n.embedding operator(extensions.<=>) p_embedding
  limit 1;
$$;

revoke all on function public.match_niche(extensions.vector, double precision)
  from public, anon, authenticated;
grant execute on function public.match_niche(extensions.vector, double precision)
  to service_role;

-- Raw per-niche aggregates for the Opportunity Score (spec §8). Aggregated
-- here, not in Node, because at 100k+ channels pulling rows over PostgREST
-- (1,000-row cap) doesn't work. Percentile normalisation, weights, labels
-- and chips stay in lib/discovery/scoring.ts.
create or replace function public.niche_signal_inputs(
  p_min_avg_views numeric,
  p_small_channel_subs bigint,
  p_new_channel_months int,
  p_outlier_multiple numeric
)
returns table (
  niche_id uuid,
  channel_count int,
  performing_count int,
  small_performing_count int,
  new_performing_count int,
  new_channels_30d int,
  median_views_90d numeric,
  recent_video_count int,
  outlier_video_count int,
  uploads_30d int
)
language sql
stable
set search_path = ''
as $$
  with ch as (
    select
      c.id,
      c.niche_id,
      coalesce(c.avg_views_recent, 0) >= p_min_avg_views as performing,
      c.subscriber_count < p_small_channel_subs as small,
      c.youtube_created_at >= now() - make_interval(months => p_new_channel_months) as is_new,
      coalesce(c.discovered_at, c.created_at) >= now() - interval '30 days' as added_30d
    from public.channels c
    where c.niche_id is not null
      and c.unavailable_since is null
  ),
  vids as (
    select ch.niche_id, v.view_count, v.outlier_multiple, v.published_at
    from public.videos v
    join ch on ch.id = v.channel_id
    where v.published_at >= now() - interval '90 days'
  )
  select
    ch.niche_id,
    count(*)::int,
    count(*) filter (where ch.performing)::int,
    count(*) filter (where ch.performing and ch.small)::int,
    count(*) filter (where ch.performing and ch.is_new)::int,
    count(*) filter (where ch.added_30d)::int,
    (select percentile_cont(0.5) within group (order by v.view_count)
       from vids v where v.niche_id = ch.niche_id)::numeric,
    (select count(*) from vids v where v.niche_id = ch.niche_id)::int,
    (select count(*) from vids v
       where v.niche_id = ch.niche_id and v.outlier_multiple >= p_outlier_multiple)::int,
    (select count(*) from vids v
       where v.niche_id = ch.niche_id and v.published_at >= now() - interval '30 days')::int
  from ch
  group by ch.niche_id;
$$;

revoke all on function public.niche_signal_inputs(numeric, bigint, int, numeric)
  from public, anon, authenticated;
grant execute on function public.niche_signal_inputs(numeric, bigint, int, numeric)
  to service_role;

-- D-073 retention. YouTube API policy: refresh or delete API data within
-- 30 days. Never deletes anything user data depends on: prompts cascade
-- from videos and tracked_events / overrides cascade from channels, so a
-- referenced row is kept (and, if tracked, channel-sync keeps it fresh).
create or replace function public.purge_stale_youtube_data(
  p_stale_days int,
  p_keep_videos int,
  p_snapshot_days int
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_channels int;
  v_videos int;
  v_snapshots int;
begin
  -- 1. Stale, unreferenced channels (their videos go by cascade).
  with doomed as (
    select c.id
    from public.channels c
    where c.last_synced_at < now() - make_interval(days => p_stale_days)
      and not exists (select 1 from public.tracked_channels t where t.channel_id = c.id)
      and not exists (select 1 from public.tracked_events e where e.channel_id = c.id)
      and not exists (select 1 from public.calendar_entries ce where ce.channel_id = c.id)
      and not exists (
        select 1 from public.notification_channel_overrides o where o.channel_id = c.id
      )
      and not exists (
        select 1 from public.videos v
        join public.prompts p on p.source_video_id = v.id
        where v.channel_id = c.id
      )
  )
  delete from public.channels c using doomed where c.id = doomed.id;
  get diagnostics v_channels = row_count;

  -- 2. Untracked channels keep only their latest p_keep_videos videos, and
  --    no video older than the stale window survives unless referenced.
  with ranked as (
    select
      v.id,
      v.last_synced_at,
      row_number() over (partition by v.channel_id order by v.published_at desc) as rn
    from public.videos v
    where not exists (
      select 1 from public.tracked_channels t where t.channel_id = v.channel_id
    )
  )
  delete from public.videos v
  using ranked r
  where v.id = r.id
    and (r.rn > p_keep_videos or r.last_synced_at < now() - make_interval(days => p_stale_days))
    and not exists (select 1 from public.prompts p where p.source_video_id = v.id);
  get diagnostics v_videos = row_count;

  -- 3. Daily snapshots older than the window roll up to one per ISO week
  --    (the Monday row).
  delete from public.niche_snapshots s
  where s.snapshot_date < current_date - p_snapshot_days
    and extract(isodow from s.snapshot_date) <> 1;
  get diagnostics v_snapshots = row_count;

  return jsonb_build_object(
    'channels', v_channels,
    'videos', v_videos,
    'snapshots', v_snapshots
  );
end;
$$;

revoke all on function public.purge_stale_youtube_data(int, int, int)
  from public, anon, authenticated;
grant execute on function public.purge_stale_youtube_data(int, int, int) to service_role;
