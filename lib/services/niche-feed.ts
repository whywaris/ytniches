import { getRedis } from "@/lib/cache/redis";
import { getEffectivePlan } from "@/lib/billing/effective-plan";
import {
  CAPPED_PLAN_NICHE_LIMIT,
  DAY_MS,
  FEED_PAGE_SIZE,
  OUTLIER_FEED_MIN_MULTIPLE,
} from "@/lib/discovery/config";
import { competitionLabel, type CompetitionLabel, type NicheStatus } from "@/lib/discovery/scoring";
import {
  FEED_VERSION_KEY,
  FRESHNESS_KEY,
  type FeedFreshness,
} from "@/lib/services/discovery/snapshot";
import { createClient } from "@/lib/supabase/server";
import { err, ok, type Result } from "@/lib/result";
import type { OutlierItem } from "@/lib/services/outliers";
import type { RequestContext } from "@/lib/context";

// Niche-Discovery-Engine.md §9-§10 (D-072). The browse feeds read only our
// own tables (user client, anyone_read RLS) and the Upstash cache: nothing
// here may import lib/youtube -- browsing costs zero quota and zero credits.

const FEED_CACHE_TTL_SECONDS = 60 * 60;

export type FeedError = { type: "not_found" } | { type: "locked" };

// --- Plan cap (D-072) ------------------------------------------------------

// Starter and Trial see the top 50 niches; Pro and Team (incl. inherited
// Team, D-059) see all. No subscription at all counts as capped.
export async function isNicheBrowseCapped(ctx: RequestContext): Promise<boolean> {
  const plan = await getEffectivePlan(ctx.userId);
  if (plan.tier === null || plan.tier === "starter") return true;
  return plan.status === "trialing";
}

// --- Cache -----------------------------------------------------------------

async function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const redis = getRedis();
  try {
    const version = (await redis.get<string>(FEED_VERSION_KEY)) ?? "0";
    const fullKey = `discovery:feed:${version}:${key}`;
    const hit = await redis.get<T>(fullKey);
    if (hit !== null && hit !== undefined) return hit;
    const value = await load();
    await redis.set(fullKey, value, { ex: FEED_CACHE_TTL_SECONDS });
    return value;
  } catch (cause) {
    // Cache is an optimisation; a Redis blip must not break browsing.
    console.error("niche feed cache failed", cause);
    return load();
  }
}

export async function getFeedFreshness(): Promise<FeedFreshness> {
  try {
    const hit = await getRedis().get<FeedFreshness>(FRESHNESS_KEY);
    if (hit) return hit;
  } catch (cause) {
    console.error("getFeedFreshness cache failed", cause);
  }
  // Before the first snapshot run there's nothing to show; the UI renders
  // its empty state rather than a misleading "updated" line.
  return { updatedAt: null, newChannelsThisWeek: 0 };
}

// --- Niches ----------------------------------------------------------------

export type NicheSort = "score" | "trend" | "newest";

export interface NicheFeedFilters {
  minScore?: number;
  maxScore?: number;
  status?: NicheStatus;
  sort: NicheSort;
  page: number;
}

export interface NicheThumbnail {
  youtubeVideoId: string;
  title: string;
  thumbnailUrl: string;
}

export interface NicheFeedItem {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  status: NicheStatus;
  score: number;
  label: CompetitionLabel;
  trend: number | null;
  whyChips: string[];
  channelCount: number;
  newChannels30d: number;
  medianViews: number | null;
  thumbnails: NicheThumbnail[];
}

export interface NicheFeedPage {
  items: NicheFeedItem[];
  total: number;
  page: number;
  pageSize: number;
  snapshotDate: string | null;
  /** Niches hidden by the plan cap (0 when uncapped). */
  lockedCount: number;
}

type Supabase = Awaited<ReturnType<typeof createClient>>;

async function latestSnapshotDate(supabase: Supabase): Promise<string | null> {
  const { data, error } = await supabase
    .from("niche_snapshots")
    .select("snapshot_date")
    .order("snapshot_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`latestSnapshotDate failed: ${error.message}`);
  return data?.snapshot_date ?? null;
}

async function topNicheIds(supabase: Supabase, date: string, limit: number): Promise<string[]> {
  const { data, error } = await supabase
    .from("niche_snapshots")
    .select("niche_id")
    .eq("snapshot_date", date)
    .order("opportunity_score", { ascending: false })
    .order("niche_id", { ascending: true })
    .limit(limit);
  if (error) throw new Error(`topNicheIds failed: ${error.message}`);
  return data.map((row) => row.niche_id);
}

async function thumbnailsFor(
  supabase: Supabase,
  nicheIds: string[],
  perNiche: number,
): Promise<Map<string, NicheThumbnail[]>> {
  const result = new Map<string, NicheThumbnail[]>();
  if (nicheIds.length === 0) return result;
  const { data, error } = await supabase
    .from("outliers_feed")
    .select("niche_id, outlier_multiple, videos!inner(youtube_video_id, title, thumbnail_url)")
    .in("niche_id", nicheIds)
    .order("outlier_multiple", { ascending: false })
    .limit(nicheIds.length * 10);
  if (error) throw new Error(`thumbnailsFor failed: ${error.message}`);
  for (const row of data) {
    if (!row.niche_id) continue;
    const list = result.get(row.niche_id) ?? [];
    if (list.length >= perNiche) continue;
    list.push({
      youtubeVideoId: row.videos.youtube_video_id,
      title: row.videos.title,
      thumbnailUrl: row.videos.thumbnail_url,
    });
    result.set(row.niche_id, list);
  }
  return result;
}

async function loadNichePage(
  filters: NicheFeedFilters,
  allowedIds: string[] | null,
): Promise<NicheFeedPage> {
  const supabase = await createClient();
  const date = await latestSnapshotDate(supabase);
  const empty: NicheFeedPage = {
    items: [],
    total: 0,
    page: filters.page,
    pageSize: FEED_PAGE_SIZE,
    snapshotDate: date,
    lockedCount: 0,
  };
  if (!date) return empty;

  let query = supabase
    .from("niche_snapshots")
    .select(
      "niche_id, opportunity_score, trend, why_chips, channel_count, new_channels_30d, median_views, niches!inner(id, slug, name, description, status, created_at)",
      { count: "exact" },
    )
    .eq("snapshot_date", date);
  if (filters.minScore !== undefined) query = query.gte("opportunity_score", filters.minScore);
  if (filters.maxScore !== undefined) query = query.lte("opportunity_score", filters.maxScore);
  if (filters.status) query = query.eq("niches.status", filters.status);
  if (allowedIds) query = query.in("niche_id", allowedIds);

  if (filters.sort === "trend") {
    query = query.order("trend", { ascending: false, nullsFirst: false });
  } else if (filters.sort === "newest") {
    query = query.order("created_at", { ascending: false, referencedTable: "niches" });
  }
  query = query
    .order("opportunity_score", { ascending: false })
    .order("niche_id", { ascending: true });

  const from = (filters.page - 1) * FEED_PAGE_SIZE;
  const { data, error, count } = await query.range(from, from + FEED_PAGE_SIZE - 1);
  if (error) throw new Error(`listNiches failed: ${error.message}`);

  const thumbnails = await thumbnailsFor(
    supabase,
    data.map((row) => row.niche_id),
    3,
  );
  return {
    ...empty,
    total: count ?? data.length,
    items: data.map((row) => ({
      id: row.niches.id,
      slug: row.niches.slug,
      name: row.niches.name,
      description: row.niches.description,
      status: row.niches.status as NicheStatus,
      score: row.opportunity_score,
      label: competitionLabel(row.opportunity_score),
      trend: row.trend,
      whyChips: row.why_chips,
      channelCount: row.channel_count,
      newChannels30d: row.new_channels_30d,
      medianViews: row.median_views,
      thumbnails: thumbnails.get(row.niche_id) ?? [],
    })),
  };
}

export async function listNiches(
  ctx: RequestContext,
  filters: NicheFeedFilters,
): Promise<NicheFeedPage> {
  const capped = await isNicheBrowseCapped(ctx);
  if (!capped) {
    return cached(`niches:all:${JSON.stringify(filters)}`, () => loadNichePage(filters, null));
  }

  return cached(`niches:capped:${JSON.stringify(filters)}`, async () => {
    const supabase = await createClient();
    const date = await latestSnapshotDate(supabase);
    if (!date) return loadNichePage(filters, null);
    const [allowed, all] = await Promise.all([
      topNicheIds(supabase, date, CAPPED_PLAN_NICHE_LIMIT),
      supabase
        .from("niche_snapshots")
        .select("niche_id", { count: "exact", head: true })
        .eq("snapshot_date", date),
    ]);
    if (all.error) throw new Error(`listNiches count failed: ${all.error.message}`);
    const page = await loadNichePage(filters, allowed);
    return { ...page, lockedCount: Math.max(0, (all.count ?? 0) - allowed.length) };
  });
}

// --- Channels --------------------------------------------------------------

export type ChannelFeedSort = "outlier_score" | "avg_views" | "newest" | "subscribers";

export interface ChannelFeedFilters {
  niche?: string; // slug
  createdAfter?: string; // YYYY-MM-DD
  createdBefore?: string;
  minSubs?: number;
  maxSubs?: number;
  minAvgViews?: number;
  maxAvgViews?: number;
  minOutlierScore?: number;
  faceless?: boolean;
  excludeKids?: boolean;
  hasShorts?: boolean;
  likelyMonetized?: boolean;
  language?: string;
  sort: ChannelFeedSort;
  page: number;
}

export interface PopularVideo {
  youtubeVideoId: string;
  title: string;
  thumbnailUrl: string;
  viewCount: number;
  publishedAt: string;
}

export interface FeedChannel {
  id: string;
  youtubeChannelId: string;
  name: string;
  avatarUrl: string | null;
  subscriberCount: number;
  videoCount: number;
  avgViewsRecent: number | null;
  outlierScore: number | null;
  youtubeCreatedAt: string;
  daysSinceStart: number;
  isFaceless: boolean | null;
  likelyMonetized: boolean | null;
  hasShorts: boolean | null;
  language: string | null;
  niche: { slug: string; name: string } | null;
  popularVideos: PopularVideo[];
}

export interface ChannelFeedPage {
  items: FeedChannel[];
  total: number;
  page: number;
  pageSize: number;
}

const CHANNEL_SORT_COLUMN: Record<ChannelFeedSort, string> = {
  outlier_score: "outlier_score",
  avg_views: "avg_views_recent",
  newest: "youtube_created_at",
  subscribers: "subscriber_count",
};

async function popularVideosFor(
  supabase: Supabase,
  channelIds: string[],
  perChannel: number,
): Promise<Map<string, PopularVideo[]>> {
  const result = new Map<string, PopularVideo[]>();
  if (channelIds.length === 0) return result;
  const { data, error } = await supabase
    .from("videos")
    .select("channel_id, youtube_video_id, title, thumbnail_url, view_count, published_at")
    .in("channel_id", channelIds)
    .order("view_count", { ascending: false })
    .limit(1000);
  if (error) throw new Error(`popularVideosFor failed: ${error.message}`);
  for (const row of data) {
    const list = result.get(row.channel_id) ?? [];
    if (list.length >= perChannel) continue;
    list.push({
      youtubeVideoId: row.youtube_video_id,
      title: row.title,
      thumbnailUrl: row.thumbnail_url,
      viewCount: row.view_count,
      publishedAt: row.published_at,
    });
    result.set(row.channel_id, list);
  }
  return result;
}

async function nicheIdForSlug(supabase: Supabase, slug: string): Promise<string | null> {
  const { data, error } = await supabase.from("niches").select("id").eq("slug", slug).maybeSingle();
  if (error) throw new Error(`nicheIdForSlug failed: ${error.message}`);
  return data?.id ?? null;
}

async function loadChannelPage(
  filters: ChannelFeedFilters,
  now: number,
  nicheIds?: string[],
  limitOverride?: number,
): Promise<ChannelFeedPage> {
  const supabase = await createClient();
  const pageSize = limitOverride ?? FEED_PAGE_SIZE;
  const empty = { items: [], total: 0, page: filters.page, pageSize };

  let nicheFilter = nicheIds;
  if (filters.niche) {
    const id = await nicheIdForSlug(supabase, filters.niche);
    if (!id) return empty;
    nicheFilter = [id];
  }

  // Only enriched, still-qualifying channels (hot/warm) belong in the feed;
  // cold ones no longer pass §6.2.
  let query = supabase
    .from("channels")
    .select(
      "id, youtube_channel_id, name, avatar_url, subscriber_count, video_count, avg_views_recent, outlier_score, youtube_created_at, is_faceless, likely_monetized, has_shorts, language, niches(slug, name)",
      { count: "exact" },
    )
    .not("enriched_at", "is", null)
    .not("avg_views_recent", "is", null)
    .in("refresh_tier", ["hot", "warm"])
    .is("unavailable_since", null);

  if (nicheFilter) query = query.in("niche_id", nicheFilter);
  if (filters.createdAfter) query = query.gte("youtube_created_at", filters.createdAfter);
  if (filters.createdBefore) query = query.lte("youtube_created_at", filters.createdBefore);
  if (filters.minSubs !== undefined) query = query.gte("subscriber_count", filters.minSubs);
  if (filters.maxSubs !== undefined) query = query.lte("subscriber_count", filters.maxSubs);
  if (filters.minAvgViews !== undefined) query = query.gte("avg_views_recent", filters.minAvgViews);
  if (filters.maxAvgViews !== undefined) query = query.lte("avg_views_recent", filters.maxAvgViews);
  if (filters.minOutlierScore !== undefined)
    query = query.gte("outlier_score", filters.minOutlierScore);
  if (filters.faceless) query = query.eq("is_faceless", true);
  if (filters.excludeKids) query = query.or("made_for_kids.is.null,made_for_kids.eq.false");
  if (filters.hasShorts) query = query.eq("has_shorts", true);
  if (filters.likelyMonetized) query = query.eq("likely_monetized", true);
  if (filters.language) query = query.eq("language", filters.language);

  query = query
    .order(CHANNEL_SORT_COLUMN[filters.sort], { ascending: false, nullsFirst: false })
    .order("id", { ascending: true });

  const from = (filters.page - 1) * pageSize;
  const { data, error, count } = await query.range(from, from + pageSize - 1);
  if (error) throw new Error(`listFeedChannels failed: ${error.message}`);

  const videos = await popularVideosFor(
    supabase,
    data.map((row) => row.id),
    4,
  );
  return {
    ...empty,
    total: count ?? data.length,
    items: data.map((row) => ({
      id: row.id,
      youtubeChannelId: row.youtube_channel_id,
      name: row.name,
      avatarUrl: row.avatar_url,
      subscriberCount: row.subscriber_count,
      videoCount: row.video_count,
      avgViewsRecent: row.avg_views_recent,
      outlierScore: row.outlier_score,
      youtubeCreatedAt: row.youtube_created_at,
      daysSinceStart: Math.max(
        0,
        Math.floor((now - new Date(row.youtube_created_at).getTime()) / DAY_MS),
      ),
      isFaceless: row.is_faceless,
      likelyMonetized: row.likely_monetized,
      hasShorts: row.has_shorts,
      language: row.language,
      niche: row.niches ? { slug: row.niches.slug, name: row.niches.name } : null,
      popularVideos: videos.get(row.id) ?? [],
    })),
  };
}

export async function listFeedChannels(filters: ChannelFeedFilters): Promise<ChannelFeedPage> {
  // Day-granular key: daysSinceStart is computed at load time.
  const day = new Date().toISOString().slice(0, 10);
  return cached(`channels:${day}:${JSON.stringify(filters)}`, () =>
    loadChannelPage(filters, Date.now()),
  );
}

// --- Outliers ----------------------------------------------------------------

export interface OutlierFeedFilters {
  niche?: string;
  minMultiple?: number;
  withinDays: 7 | 30 | 90;
  page: number;
}

export interface GlobalOutlierItem extends OutlierItem {
  youtubeVideoId: string;
  niche: { slug: string; name: string } | null;
}

export interface OutlierFeedPage {
  items: GlobalOutlierItem[];
  total: number;
  page: number;
  pageSize: number;
}

async function loadOutlierPage(
  filters: OutlierFeedFilters,
  now: number,
  pageSizeOverride?: number,
): Promise<OutlierFeedPage> {
  const supabase = await createClient();
  const pageSize = pageSizeOverride ?? FEED_PAGE_SIZE;
  const empty = { items: [], total: 0, page: filters.page, pageSize };

  let query = supabase
    .from("outliers_feed")
    .select(
      "video_id, outlier_multiple, detected_at, videos!inner(id, youtube_video_id, title, thumbnail_url, view_count, published_at), channels!inner(id, name, avatar_url), niches(slug, name)",
      { count: "exact" },
    )
    .gte("outlier_multiple", filters.minMultiple ?? OUTLIER_FEED_MIN_MULTIPLE)
    .gte("videos.published_at", new Date(now - filters.withinDays * DAY_MS).toISOString());
  if (filters.niche) {
    const id = await nicheIdForSlug(supabase, filters.niche);
    if (!id) return empty;
    query = query.eq("niche_id", id);
  }

  const from = (filters.page - 1) * pageSize;
  const { data, error, count } = await query
    .order("outlier_multiple", { ascending: false })
    .order("video_id", { ascending: true })
    .range(from, from + pageSize - 1);
  if (error) throw new Error(`listGlobalOutliers failed: ${error.message}`);

  return {
    ...empty,
    total: count ?? data.length,
    items: data.map((row) => ({
      id: row.video_id,
      channelId: row.channels.id,
      channelName: row.channels.name,
      channelAvatarUrl: row.channels.avatar_url,
      videoId: row.videos.id,
      youtubeVideoId: row.videos.youtube_video_id,
      videoTitle: row.videos.title,
      videoThumbnailUrl: row.videos.thumbnail_url,
      viewCount: row.videos.view_count,
      baseline: row.outlier_multiple > 0 ? row.videos.view_count / row.outlier_multiple : 0,
      outlierScore: row.outlier_multiple,
      publishedAt: row.videos.published_at,
      detectedAt: row.detected_at,
      niche: row.niches ? { slug: row.niches.slug, name: row.niches.name } : null,
    })),
  };
}

export async function listGlobalOutliers(filters: OutlierFeedFilters): Promise<OutlierFeedPage> {
  const day = new Date().toISOString().slice(0, 10);
  return cached(`outliers:${day}:${JSON.stringify(filters)}`, () =>
    loadOutlierPage(filters, Date.now()),
  );
}

// --- Niche detail ------------------------------------------------------------

export interface NicheHistoryPoint {
  date: string;
  score: number;
}

export interface NicheDetail extends NicheFeedItem {
  signals: {
    accessibility: number | null;
    demand: number | null;
    momentum: number | null;
    outlierDensity: number | null;
    supply: number | null;
  };
  history: NicheHistoryPoint[];
  topChannels: FeedChannel[];
  topOutliers: GlobalOutlierItem[];
}

const HISTORY_DAYS = 90;

export async function getNicheBySlug(
  ctx: RequestContext,
  slug: string,
): Promise<Result<NicheDetail, FeedError>> {
  const supabase = await createClient();
  const { data: niche, error } = await supabase
    .from("niches")
    .select("id, slug, name, description, status")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`getNicheBySlug failed: ${error.message}`);
  if (!niche) return err({ type: "not_found" });

  const date = await latestSnapshotDate(supabase);
  if (!date) return err({ type: "not_found" });

  if (await isNicheBrowseCapped(ctx)) {
    const allowed = await topNicheIds(supabase, date, CAPPED_PLAN_NICHE_LIMIT);
    if (!allowed.includes(niche.id)) return err({ type: "locked" });
  }

  const since = new Date(Date.now() - HISTORY_DAYS * DAY_MS).toISOString().slice(0, 10);
  const { data: snapshots, error: snapshotError } = await supabase
    .from("niche_snapshots")
    .select("*")
    .eq("niche_id", niche.id)
    .gte("snapshot_date", since)
    .order("snapshot_date", { ascending: true });
  if (snapshotError) throw new Error(`getNicheBySlug history failed: ${snapshotError.message}`);
  const latest = snapshots.at(-1);
  // A niche that dropped below the minimum sample has no current score.
  if (!latest || latest.snapshot_date !== date) return err({ type: "not_found" });

  const now = Date.now();
  const [channels, outliers, thumbnails] = await Promise.all([
    loadChannelPage({ sort: "outlier_score", page: 1 }, now, [niche.id], 12),
    loadOutlierPage({ niche: slug, withinDays: 90, page: 1 }, now, 8),
    thumbnailsFor(supabase, [niche.id], 3),
  ]);

  return ok({
    id: niche.id,
    slug: niche.slug,
    name: niche.name,
    description: niche.description,
    status: niche.status as NicheStatus,
    score: latest.opportunity_score,
    label: competitionLabel(latest.opportunity_score),
    trend: latest.trend,
    whyChips: latest.why_chips,
    channelCount: latest.channel_count,
    newChannels30d: latest.new_channels_30d,
    medianViews: latest.median_views,
    thumbnails: thumbnails.get(niche.id) ?? [],
    signals: {
      accessibility: latest.accessibility,
      demand: latest.demand,
      momentum: latest.momentum,
      outlierDensity: latest.outlier_density,
      supply: latest.supply,
    },
    history: snapshots.map((row) => ({ date: row.snapshot_date, score: row.opportunity_score })),
    topChannels: channels.items,
    topOutliers: outliers.items,
  });
}

// For the niche filter <select>: every niche with a current score.
export async function listNicheOptions(): Promise<{ slug: string; name: string }[]> {
  return cached("niche-options", async () => {
    const supabase = await createClient();
    const date = await latestSnapshotDate(supabase);
    if (!date) return [];
    const { data, error } = await supabase
      .from("niche_snapshots")
      .select("niches!inner(slug, name)")
      .eq("snapshot_date", date)
      .limit(1000);
    if (error) throw new Error(`listNicheOptions failed: ${error.message}`);
    return data
      .map((row) => ({ slug: row.niches.slug, name: row.niches.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });
}
