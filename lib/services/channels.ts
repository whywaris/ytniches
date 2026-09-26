import { Ratelimit } from "@upstash/ratelimit";

import { getEffectivePlan } from "@/lib/billing/effective-plan";
import { refreshCadenceHoursFor, TIER_INFO, trackedChannelsLimitFor } from "@/lib/billing/plans";
import { getRedis } from "@/lib/cache/redis";
import { CREDIT_COSTS, FAIR_USE } from "@/lib/credits/costs";
import { consume, getBalance } from "@/lib/credits";
import { getCachedSearchChannels, setCachedSearchChannels } from "@/lib/youtube/cache";
import { getChannelsByIds, searchChannelIds, type YouTubeError } from "@/lib/youtube";
import { withQuotaSource } from "@/lib/youtube/quota";
import { addUserSearchSeed } from "@/lib/services/discovery/seeds";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { err, ok, type Result } from "@/lib/result";
import type { RequestContext } from "@/lib/context";
import type { NicheSearchInput } from "@/lib/services/channels.schema";
import type { YouTubeChannelItem } from "@/lib/youtube/schemas";
import type { Database } from "@/lib/supabase/database.types";

const SEARCH_CREDIT_COST = CREDIT_COSTS.nicheSearch;
// Exported for other server-side consumers. The client component can't
// import it directly (this module is server-only — service-role client,
// env vars — and any value import would pull it into the client bundle),
// so it keeps its own duplicated copy in sync by hand.
export const RESULTS_PER_PAGE = 20;

// Monetization.md §3.6 fair-use cap: 60 niche searches/hour, same for every
// tier (this is abuse protection, not a tier gate).
const SEARCH_RATE_LIMIT = Ratelimit.slidingWindow(FAIR_USE.nicheSearchesPerHour, "1 h");
let rateLimiter: Ratelimit | undefined;
function getSearchRateLimiter(): Ratelimit {
  if (!rateLimiter) {
    rateLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: SEARCH_RATE_LIMIT,
      prefix: "ratelimit:niche_search",
    });
  }
  return rateLimiter;
}

// Tracked-channel caps and sync cadence come from lib/billing/plans.ts,
// the same numbers the pricing cards show. No current subscription row ->
// the Starter cap and cadence.

export interface ChannelSearchResult {
  id: string;
  youtubeChannelId: string;
  name: string;
  avatarUrl: string | null;
  subscriberCount: number;
  videoCount: number;
  avgViewsLast30Days: number;
  avgViewsLifetime: number;
  uploadFrequencyPerWeek: number;
  isMonetized: boolean | null;
  language: string | null;
  country: string | null;
  youtubeCreatedAt: string;
  // View counts of whatever videos we already have cached for this channel,
  // sorted oldest -> newest. Empty for a cold-cache channel (UI renders no
  // sparkline rather than a fake one) — computed alongside the aggregates
  // below, same fetched rows, no extra query.
  viewTrend: number[];
}

export interface ChannelDetail extends ChannelSearchResult {
  description: string | null;
  bannerUrl: string | null;
  youtubeUrl: string;
}

export type SearchError =
  | { type: "insufficient_credits"; balance: number; required: number }
  | { type: "rate_limited"; retryAfterSeconds: number }
  | { type: "quota_exhausted" }
  | { type: "youtube_error"; message: string };

export type NotFoundError = { type: "not_found" };

export type SaveChannelError = { type: "tier_limit"; limit: number; current: number };

function toSearchError(youtubeError: YouTubeError): SearchError {
  if (youtubeError.type === "quota_exceeded") {
    return { type: "quota_exhausted" };
  }
  if (youtubeError.type === "network_error" || youtubeError.type === "api_error") {
    return { type: "youtube_error", message: youtubeError.message };
  }
  if (youtubeError.type === "invalid_request" || youtubeError.type === "invalid_response") {
    return { type: "youtube_error", message: youtubeError.message };
  }
  return { type: "youtube_error", message: "unknown YouTube client error" };
}

function toChannelRow(
  channel: YouTubeChannelItem,
): Database["public"]["Tables"]["channels"]["Insert"] {
  const avatarUrl =
    channel.snippet.thumbnails?.high?.url ??
    channel.snippet.thumbnails?.medium?.url ??
    channel.snippet.thumbnails?.default?.url ??
    null;

  return {
    youtube_channel_id: channel.id,
    handle: channel.snippet.customUrl ?? null,
    name: channel.snippet.title,
    description: channel.snippet.description,
    avatar_url: avatarUrl,
    banner_url: channel.brandingSettings?.image?.bannerExternalUrl ?? null,
    subscriber_count: channel.statistics.subscriberCount,
    video_count: channel.statistics.videoCount,
    total_view_count: channel.statistics.viewCount,
    country: channel.snippet.country ?? null,
    language: channel.snippet.defaultLanguage ?? null,
    // Never set here — Backend-Schema.md's own note says this is "inferred
    // from ads on recent videos," a detection heuristic that doesn't exist
    // anywhere yet. Stays null until that's built (tracked separately, not
    // Phase 1C scope).
    is_monetized: null,
    youtube_created_at: channel.snippet.publishedAt,
    uploads_playlist_id: channel.contentDetails?.relatedPlaylists.uploads ?? null,
    made_for_kids: channel.status?.madeForKids ?? null,
    last_synced_at: new Date().toISOString(),
  };
}

// Upserts fetched channels into the shared cache table (service-role write
// — Backend-Schema.md §6.1: no per-user ownership to scope an authenticated
// RLS policy to, unlike credit_events/tracked_channels) and returns the
// internal channels.id for each, keyed by youtube_channel_id. Exported —
// workers/channel-sync.ts reuses this exact mapping rather than
// duplicating the YouTubeChannelItem -> DB row logic.
export async function upsertChannels(channels: YouTubeChannelItem[]): Promise<Map<string, string>> {
  if (channels.length === 0) {
    return new Map();
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("channels")
    .upsert(channels.map(toChannelRow), { onConflict: "youtube_channel_id" })
    .select("id, youtube_channel_id");

  if (error) {
    throw new Error(`upsertChannels failed: ${error.message}`);
  }

  return new Map(data.map((row) => [row.youtube_channel_id, row.id]));
}

interface ChannelMetrics {
  avgViewsLast30Days: number;
  avgViewsLifetime: number;
  uploadFrequencyPerWeek: number;
  viewTrend: number[];
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const FOUR_WEEKS_MS = 28 * 24 * 60 * 60 * 1000;

// Computed from whatever videos.list rows already exist for these channels
// from prior syncs (channel detail views, tracking) — this search flow
// never fetches videos itself (would double+ the quota cost of a search).
// A channel with zero cached video rows scores 0 on both — same
// cold-cache-under-return behavior already agreed for Niche Finder overall.
async function computeChannelMetrics(
  supabase: Awaited<ReturnType<typeof createClient>>,
  channelIds: string[],
): Promise<Map<string, ChannelMetrics>> {
  const metrics = new Map<string, ChannelMetrics>();
  if (channelIds.length === 0) {
    return metrics;
  }

  const { data, error } = await supabase
    .from("videos")
    .select("channel_id, view_count, published_at")
    .in("channel_id", channelIds);

  if (error) {
    throw new Error(`computeChannelMetrics query failed: ${error.message}`);
  }

  const now = Date.now();
  const byChannel = new Map<
    string,
    {
      views: { count: number; publishedAt: number }[];
      recentViews: number[];
      recentUploads: number;
    }
  >();

  for (const video of data) {
    const bucket = byChannel.get(video.channel_id) ?? {
      views: [],
      recentViews: [],
      recentUploads: 0,
    };
    const publishedAt = new Date(video.published_at).getTime();
    bucket.views.push({ count: video.view_count, publishedAt });

    if (now - publishedAt <= THIRTY_DAYS_MS) {
      bucket.recentViews.push(video.view_count);
    }
    if (now - publishedAt <= FOUR_WEEKS_MS) {
      bucket.recentUploads += 1;
    }

    byChannel.set(video.channel_id, bucket);
  }

  for (const channelId of channelIds) {
    const bucket = byChannel.get(channelId);
    if (!bucket) {
      metrics.set(channelId, {
        avgViewsLast30Days: 0,
        avgViewsLifetime: 0,
        uploadFrequencyPerWeek: 0,
        viewTrend: [],
      });
      continue;
    }
    const sortedByDate = [...bucket.views].sort((a, b) => a.publishedAt - b.publishedAt);
    metrics.set(channelId, {
      avgViewsLast30Days: average(bucket.recentViews),
      avgViewsLifetime: average(bucket.views.map((video) => video.count)),
      uploadFrequencyPerWeek: bucket.recentUploads / 4,
      viewTrend: sortedByDate.map((video) => video.count),
    });
  }

  return metrics;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

// UI-UX-Flow.md §5.1 only names the bucket labels ("any / weekly / 2-4 per
// week / daily+"), not numeric boundaries — these thresholds are a
// reasonable reading of the labels, not a spec quote. Worth confirming with
// product; easy to adjust in one place if the buckets feel wrong in
// practice.
function matchesUploadFrequency(
  perWeek: number,
  bucket: NicheSearchInput["uploadFrequency"],
): boolean {
  switch (bucket) {
    case "any":
      return true;
    case "weekly":
      return perWeek < 1.5;
    case "2-4-week":
      return perWeek >= 1.5 && perWeek < 4.5;
    case "daily-plus":
      return perWeek >= 4.5;
  }
}

function applyFilters(
  results: ChannelSearchResult[],
  filters: NicheSearchInput,
): ChannelSearchResult[] {
  return results.filter((result) => {
    if (filters.subscribersMin !== undefined && result.subscriberCount < filters.subscribersMin) {
      return false;
    }
    if (filters.subscribersMax !== undefined && result.subscriberCount > filters.subscribersMax) {
      return false;
    }
    if (filters.avgViewsMin !== undefined && result.avgViewsLast30Days < filters.avgViewsMin) {
      return false;
    }
    if (filters.avgViewsMax !== undefined && result.avgViewsLast30Days > filters.avgViewsMax) {
      return false;
    }
    if (!matchesUploadFrequency(result.uploadFrequencyPerWeek, filters.uploadFrequency)) {
      return false;
    }
    // monetized: intentionally not filtered on — is_monetized has no
    // detection heuristic behind it yet (see toChannelRow), so filtering on
    // it would silently return zero results for "yes"/"no" forever.
    if (filters.languages && filters.languages.length > 0) {
      if (!result.language || !filters.languages.includes(result.language)) {
        return false;
      }
    }
    if (filters.countries && filters.countries.length > 0) {
      if (!result.country || !filters.countries.includes(result.country)) {
        return false;
      }
    }
    if (filters.createdAfter && result.youtubeCreatedAt < filters.createdAfter) {
      return false;
    }
    return true;
  });
}

function sortResults(
  results: ChannelSearchResult[],
  sort: NicheSearchInput["sort"],
): ChannelSearchResult[] {
  const sorted = [...results];
  switch (sort) {
    case "subscribers":
      return sorted.sort((a, b) => b.subscriberCount - a.subscriberCount);
    case "avg_views":
      return sorted.sort((a, b) => b.avgViewsLast30Days - a.avgViewsLast30Days);
    case "upload_freq":
      return sorted.sort((a, b) => b.uploadFrequencyPerWeek - a.uploadFrequencyPerWeek);
    case "relevance":
      return sorted;
  }
}

async function toSearchResults(
  channels: YouTubeChannelItem[],
  idByYoutubeId: Map<string, string>,
  metrics: Map<string, ChannelMetrics>,
): Promise<ChannelSearchResult[]> {
  return channels.flatMap((channel) => {
    const id = idByYoutubeId.get(channel.id);
    if (!id) return [];
    const channelMetrics = metrics.get(id) ?? {
      avgViewsLast30Days: 0,
      avgViewsLifetime: 0,
      uploadFrequencyPerWeek: 0,
      viewTrend: [],
    };
    return [
      {
        id,
        youtubeChannelId: channel.id,
        name: channel.snippet.title,
        avatarUrl:
          channel.snippet.thumbnails?.high?.url ?? channel.snippet.thumbnails?.medium?.url ?? null,
        subscriberCount: channel.statistics.subscriberCount,
        videoCount: channel.statistics.videoCount,
        ...channelMetrics,
        isMonetized: null,
        language: channel.snippet.defaultLanguage ?? null,
        country: channel.snippet.country ?? null,
        youtubeCreatedAt: channel.snippet.publishedAt,
      },
    ];
  });
}

export async function searchNiches(
  ctx: RequestContext,
  filters: NicheSearchInput,
  idempotencyKey: string,
): Promise<Result<ChannelSearchResult[], SearchError>> {
  const rateLimitResult = await getSearchRateLimiter().limit(ctx.userId);
  if (!rateLimitResult.success) {
    const retryAfterSeconds = Math.max(0, Math.ceil((rateLimitResult.reset - Date.now()) / 1000));
    return err({ type: "rate_limited", retryAfterSeconds });
  }

  // TRD.md §5.3 "never fetch what's cached fresh", D-065: results are
  // cached per filter set *without* page and sort, so paging and re-sorting
  // are cache hits. A hit is free for anyone within the window -- they
  // didn't cause the YouTube cost this time.
  const { page: pageNumber, sort, ...searchFilters } = filters;
  let channels = await getCachedSearchChannels(searchFilters);
  const isCacheHit = channels !== null;

  if (channels === null) {
    const balance = await getBalance(ctx);
    if (balance < SEARCH_CREDIT_COST) {
      return err({ type: "insufficient_credits", balance, required: SEARCH_CREDIT_COST });
    }

    const idsResult = await withQuotaSource("search", () => searchChannelIds(searchFilters));
    if (!idsResult.ok) {
      return err(toSearchError(idsResult.error));
    }
    const channelsResult = await withQuotaSource("search", () => getChannelsByIds(idsResult.value));
    if (!channelsResult.ok) {
      return err(toSearchError(channelsResult.error));
    }
    channels = channelsResult.value;
    await setCachedSearchChannels(searchFilters, channels);
    // Niche-Discovery-Engine.md §6.3: every real search feeds the crawler.
    if (searchFilters.keyword) await addUserSearchSeed(searchFilters.keyword);
  }

  const idByYoutubeId = await upsertChannels(channels);
  const supabase = await createClient();
  const metrics = await computeChannelMetrics(supabase, [...idByYoutubeId.values()]);

  const allResults = await toSearchResults(channels, idByYoutubeId, metrics);
  const filtered = applyFilters(allResults, filters);
  const sorted = sortResults(filtered, sort);
  const page = sorted.slice((pageNumber - 1) * RESULTS_PER_PAGE, pageNumber * RESULTS_PER_PAGE);

  if (!isCacheHit) {
    const consumeResult = await consume(ctx, SEARCH_CREDIT_COST, "Niche search", idempotencyKey);
    if (!consumeResult.ok) {
      return err(consumeResult.error);
    }
  }

  return ok(page);
}

export async function getChannelDetail(
  ctx: RequestContext,
  channelId: string,
): Promise<Result<ChannelDetail, NotFoundError>> {
  void ctx; // no user-scoping needed — channels are public cache data
  const supabase = await createClient();
  const { data: channel, error } = await supabase
    .from("channels")
    .select("*")
    .eq("id", channelId)
    .maybeSingle();

  if (error) {
    throw new Error(`getChannelDetail query failed: ${error.message}`);
  }
  if (!channel) {
    return err({ type: "not_found" });
  }

  const metrics = await computeChannelMetrics(supabase, [channelId]);
  const channelMetrics = metrics.get(channelId) ?? {
    avgViewsLast30Days: 0,
    avgViewsLifetime: 0,
    uploadFrequencyPerWeek: 0,
    viewTrend: [],
  };

  return ok({
    id: channel.id,
    youtubeChannelId: channel.youtube_channel_id,
    name: channel.name,
    avatarUrl: channel.avatar_url,
    subscriberCount: channel.subscriber_count,
    videoCount: channel.video_count,
    ...channelMetrics,
    isMonetized: channel.is_monetized,
    language: channel.language,
    country: channel.country,
    youtubeCreatedAt: channel.youtube_created_at,
    description: channel.description,
    bannerUrl: channel.banner_url,
    youtubeUrl: channel.handle
      ? `https://www.youtube.com/${channel.handle}`
      : `https://www.youtube.com/channel/${channel.youtube_channel_id}`,
  });
}

export interface VideoSummary {
  id: string;
  title: string;
  thumbnailUrl: string;
  viewCount: number;
  publishedAt: string;
  durationSeconds: number;
}

// UI-UX-Flow.md §6.2's Videos tab -- straight from the cached videos table
// (already populated by workers/channel-sync.ts), never lib/youtube/: no
// reason to spend API quota re-fetching what a background job already
// wrote to Postgres.
export async function listVideosForChannel(
  channelId: string,
  options: { sortBy?: "views" | "published"; limit?: number } = {},
): Promise<VideoSummary[]> {
  const supabase = await createClient();
  let query = supabase
    .from("videos")
    .select("id, title, thumbnail_url, view_count, published_at, duration_seconds")
    .eq("channel_id", channelId)
    .order(options.sortBy === "views" ? "view_count" : "published_at", { ascending: false });

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`listVideosForChannel query failed: ${error.message}`);
  }

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    thumbnailUrl: row.thumbnail_url,
    viewCount: row.view_count,
    publishedAt: row.published_at,
    durationSeconds: row.duration_seconds,
  }));
}

async function countOwnTracked(userId: string): Promise<number> {
  const { count, error } = await (
    await createClient()
  )
    .from("tracked_channels")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (error) throw new Error(`countOwnTracked failed: ${error.message}`);
  return count ?? 0;
}

// Service client: members can't read each other's tracked_channels rows.
async function countWorkspacePool(workspaceId: string): Promise<number> {
  const service = createServiceClient();
  const { data: members, error: membersError } = await service
    .from("workspace_members")
    .select("user_id")
    .eq("workspace_id", workspaceId);
  if (membersError) throw new Error(`countWorkspacePool members failed: ${membersError.message}`);
  const { count, error } = await service
    .from("tracked_channels")
    .select("id", { count: "exact", head: true })
    .in(
      "user_id",
      (members ?? []).map((member) => member.user_id),
    );
  if (error) throw new Error(`countWorkspacePool failed: ${error.message}`);
  return count ?? 0;
}

export async function saveChannelToTracking(
  ctx: RequestContext,
  channelId: string,
): Promise<Result<void, SaveChannelError>> {
  const supabase = await createClient();
  const plan = await getEffectivePlan(ctx.userId);

  // D-059: in a live Team workspace, everyone's tracked channels share one
  // pool of Team's cap; otherwise the user's own plan cap applies.
  const { limit, current } = plan.teamWorkspaceId
    ? {
        limit: TIER_INFO.team.trackedChannels,
        current: await countWorkspacePool(plan.teamWorkspaceId),
      }
    : {
        limit: trackedChannelsLimitFor(plan.tier),
        current: await countOwnTracked(ctx.userId),
      };

  if (current >= limit) {
    return err({ type: "tier_limit", limit, current });
  }

  const { error } = await supabase.from("tracked_channels").insert({
    user_id: ctx.userId,
    channel_id: channelId,
    // The plan's sync cadence (Pro 6h, Team 1h, otherwise 24h). Kept in
    // step with plan changes by applyRefreshCadence in lib/services/billing.ts.
    refresh_cadence_hours: refreshCadenceHoursFor(
      plan.tier && plan.status ? { tier: plan.tier, status: plan.status } : null,
    ),
  });

  if (error) {
    // Application-Flow.md §5.8: "Duplicate save — idempotent: saving an
    // already-saved channel returns success silently, no duplicate row."
    // The unique (user_id, channel_id) index is what makes this safe.
    if (error.code === "23505") {
      return ok(undefined);
    }
    throw new Error(`saveChannelToTracking insert failed: ${error.message}`);
  }

  return ok(undefined);
}
