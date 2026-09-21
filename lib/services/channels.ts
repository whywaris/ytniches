import { Ratelimit } from "@upstash/ratelimit";

import { getRedis } from "@/lib/cache/redis";
import { consume, getBalance } from "@/lib/credits";
import { getCachedSearchResult } from "@/lib/youtube/cache";
import { getChannelsByIds, searchChannelIds, type YouTubeError } from "@/lib/youtube";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { err, ok, type Result } from "@/lib/result";
import type { RequestContext } from "@/lib/context";
import type { NicheSearchInput } from "@/lib/services/channels.schema";
import type { YouTubeChannelItem } from "@/lib/youtube/schemas";
import type { Database } from "@/lib/supabase/database.types";

const SEARCH_CREDIT_COST = 1;
// Exported for other server-side consumers. The client component can't
// import it directly (this module is server-only — service-role client,
// env vars — and any value import would pull it into the client bundle),
// so it keeps its own duplicated copy in sync by hand.
export const RESULTS_PER_PAGE = 20;

// Monetization.md §3.6 fair-use cap: 60 niche searches/hour, same for every
// tier (this is abuse protection, not a tier gate).
const SEARCH_RATE_LIMIT = Ratelimit.slidingWindow(60, "1 h");
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

// Backend-Schema.md §2.3 tiers + Monetization.md §2.5 tracked-channel caps.
// No current subscription row = trial (Monetization.md §3.2's 50-credit
// trial state, prior to any paid tier) -> same cap as Starter.
const TRACKED_CHANNELS_LIMIT: Record<string, number> = {
  free: 10,
  starter: 10,
  pro: 50,
  team: 100,
};
const DEFAULT_TRACKED_CHANNELS_LIMIT = 10;

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

  // TRD.md §5.3 "never fetch what's cached fresh": if this exact filter
  // combination was already searched by anyone within the cache TTL, the
  // user gets the result without being charged — they aren't the one who
  // caused the YouTube API cost this time.
  const cachedIds = await getCachedSearchResult(filters);
  const isCacheHit = cachedIds !== null;

  if (!isCacheHit) {
    const balance = await getBalance(ctx);
    if (balance < SEARCH_CREDIT_COST) {
      return err({ type: "insufficient_credits", balance, required: SEARCH_CREDIT_COST });
    }
  }

  const idsResult = await searchChannelIds(filters);
  if (!idsResult.ok) {
    return err(toSearchError(idsResult.error));
  }

  const channelsResult = await getChannelsByIds(idsResult.value);
  if (!channelsResult.ok) {
    return err(toSearchError(channelsResult.error));
  }

  const idByYoutubeId = await upsertChannels(channelsResult.value);
  const supabase = await createClient();
  const metrics = await computeChannelMetrics(supabase, [...idByYoutubeId.values()]);

  const allResults = await toSearchResults(channelsResult.value, idByYoutubeId, metrics);
  const filtered = applyFilters(allResults, filters);
  const sorted = sortResults(filtered, filters.sort);
  const page = sorted.slice((filters.page - 1) * RESULTS_PER_PAGE, filters.page * RESULTS_PER_PAGE);

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

export async function saveChannelToTracking(
  ctx: RequestContext,
  channelId: string,
): Promise<Result<void, SaveChannelError>> {
  const supabase = await createClient();

  const [{ data: subscription }, { count }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("tier")
      .eq("user_id", ctx.userId)
      .eq("is_current", true)
      .maybeSingle(),
    supabase
      .from("tracked_channels")
      .select("id", { count: "exact", head: true })
      .eq("user_id", ctx.userId),
  ]);

  const limit = subscription
    ? (TRACKED_CHANNELS_LIMIT[subscription.tier] ?? DEFAULT_TRACKED_CHANNELS_LIMIT)
    : DEFAULT_TRACKED_CHANNELS_LIMIT;
  const current = count ?? 0;

  if (current >= limit) {
    return err({ type: "tier_limit", limit, current });
  }

  const { error } = await supabase.from("tracked_channels").insert({
    user_id: ctx.userId,
    channel_id: channelId,
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
