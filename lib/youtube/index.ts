import {
  getCachedChannel,
  getCachedChannelVideos,
  getCachedSearchResult,
  getCachedVideo,
  setCachedChannel,
  setCachedChannelVideos,
  setCachedSearchResult,
  setCachedVideo,
} from "@/lib/youtube/cache";
import {
  BATCH_SIZE,
  fetchChannelByHandle,
  fetchChannelsByIds,
  fetchPlaylistItemVideoIds,
  fetchVideosByIds,
  searchChannels,
  type YouTubeClientError,
} from "@/lib/youtube/client";
import { checkAndIncrement } from "@/lib/youtube/quota";
import { err, ok, type Result } from "@/lib/result";
import type { YouTubeChannelItem, YouTubeVideoItem } from "@/lib/youtube/schemas";

// TRD.md §5.3 costs: search.list = 100, channels.list/videos.list/
// playlistItems.list = 1 each (batched where possible in client.ts).
const SEARCH_COST = 100;
const LOOKUP_COST = 1;

export type YouTubeError = YouTubeClientError;

export type YouTubeResolveError = { type: "invalid_url" } | { type: "not_found" } | YouTubeError;

// "Never fetch what's cached fresh" (TRD.md §5.3): every export here checks
// Redis first, only spends quota on a miss, and writes through on success.
export async function searchChannelIds(
  filters: Record<string, unknown>,
): Promise<Result<string[], YouTubeError>> {
  const cached = await getCachedSearchResult(filters);
  if (cached) {
    return ok(cached);
  }

  const quota = await checkAndIncrement(SEARCH_COST);
  if (!quota.allowed) {
    return err({ type: "quota_exceeded" });
  }

  const query = typeof filters.keyword === "string" ? filters.keyword : "";
  const result = await searchChannels(query);
  if (!result.ok) {
    return result;
  }

  await setCachedSearchResult(filters, result.value);
  return result;
}

export async function getChannelById(
  youtubeChannelId: string,
): Promise<Result<YouTubeChannelItem, YouTubeError>> {
  const cached = await getCachedChannel(youtubeChannelId);
  if (cached) {
    return ok(cached);
  }

  const quota = await checkAndIncrement(LOOKUP_COST);
  if (!quota.allowed) {
    return err({ type: "quota_exceeded" });
  }

  const result = await fetchChannelsByIds([youtubeChannelId]);
  if (!result.ok) {
    return result;
  }

  const channel = result.value[0];
  if (!channel) {
    return err({
      type: "api_error",
      status: 404,
      message: `channel ${youtubeChannelId} not found`,
    });
  }

  await setCachedChannel(youtubeChannelId, channel);
  return ok(channel);
}

// Batches the *cache-check* layer, not just the API call: checks Redis for
// every ID individually, then does exactly ceil(misses / BATCH_SIZE)
// channels.list calls for everything that missed — not one call per miss.
// Preserves the input order in the returned array regardless of which
// entries came from cache vs. a fresh fetch.
export async function getChannelsByIds(
  youtubeChannelIds: string[],
): Promise<Result<YouTubeChannelItem[], YouTubeError>> {
  if (youtubeChannelIds.length === 0) {
    return ok([]);
  }

  const cachedById = await Promise.all(
    youtubeChannelIds.map(async (id) => [id, await getCachedChannel(id)] as const),
  );
  const cacheMap = new Map(cachedById);
  const missingIds = youtubeChannelIds.filter((id) => !cacheMap.get(id));

  const fetchedById = new Map<string, YouTubeChannelItem>();
  if (missingIds.length > 0) {
    const batchCount = Math.ceil(missingIds.length / BATCH_SIZE);
    const quota = await checkAndIncrement(LOOKUP_COST * batchCount);
    if (!quota.allowed) {
      return err({ type: "quota_exceeded" });
    }

    const result = await fetchChannelsByIds(missingIds);
    if (!result.ok) {
      return result;
    }

    await Promise.all(
      result.value.map((channel) => {
        fetchedById.set(channel.id, channel);
        return setCachedChannel(channel.id, channel);
      }),
    );
  }

  // A requested ID that doesn't come back from either cache or the API
  // (deleted/suspended channel) is silently omitted rather than failing the
  // whole batch — matches Application-Flow.md §5.6's soft-delete handling.
  const items: YouTubeChannelItem[] = [];
  for (const id of youtubeChannelIds) {
    const channel = cacheMap.get(id) ?? fetchedById.get(id);
    if (channel) {
      items.push(channel);
    }
  }

  return ok(items);
}

export async function getChannelVideos(
  youtubeChannelId: string,
): Promise<Result<YouTubeVideoItem[], YouTubeError>> {
  const cached = await getCachedChannelVideos(youtubeChannelId);
  if (cached) {
    return ok(cached);
  }

  const channelResult = await getChannelById(youtubeChannelId);
  if (!channelResult.ok) {
    return channelResult;
  }

  const uploadsPlaylistId = channelResult.value.contentDetails?.relatedPlaylists.uploads;
  if (!uploadsPlaylistId) {
    return err({
      type: "api_error",
      status: 404,
      message: `channel ${youtubeChannelId} has no uploads playlist`,
    });
  }

  const playlistQuota = await checkAndIncrement(LOOKUP_COST);
  if (!playlistQuota.allowed) {
    return err({ type: "quota_exceeded" });
  }

  const videoIdsResult = await fetchPlaylistItemVideoIds(uploadsPlaylistId);
  if (!videoIdsResult.ok) {
    return videoIdsResult;
  }

  if (videoIdsResult.value.length === 0) {
    await setCachedChannelVideos(youtubeChannelId, []);
    return ok([]);
  }

  const videosQuota = await checkAndIncrement(LOOKUP_COST);
  if (!videosQuota.allowed) {
    return err({ type: "quota_exceeded" });
  }

  const videosResult = await fetchVideosByIds(videoIdsResult.value);
  if (!videosResult.ok) {
    return videosResult;
  }

  await setCachedChannelVideos(youtubeChannelId, videosResult.value);
  return ok(videosResult.value);
}

// PRD.md §6.2 "paste channel URL directly" / Application-Flow.md §4.2's
// validating state. Only two URL shapes are recognized -- anything else is
// invalid_url without spending quota. A /channel/<id> URL's ID is trusted
// as-is (no API call, no cost); a /@handle URL requires an actual
// channels.list?forHandle= lookup (1 unit) since the handle -> ID mapping
// only YouTube knows.
const CHANNEL_ID_URL_PATTERN = /^youtube\.com\/channel\/([^/]+)$/i;
const HANDLE_URL_PATTERN = /^youtube\.com\/@([^/]+)$/i;

function normalizeYoutubeUrl(url: string): string {
  return url
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "");
}

export async function resolveChannelUrl(url: string): Promise<Result<string, YouTubeResolveError>> {
  const normalized = normalizeYoutubeUrl(url);

  const channelIdMatch = CHANNEL_ID_URL_PATTERN.exec(normalized);
  if (channelIdMatch) {
    return ok(channelIdMatch[1]);
  }

  const handleMatch = HANDLE_URL_PATTERN.exec(normalized);
  if (handleMatch) {
    const quota = await checkAndIncrement(LOOKUP_COST);
    if (!quota.allowed) {
      return err({ type: "quota_exceeded" });
    }

    const result = await fetchChannelByHandle(handleMatch[1]);
    if (!result.ok) {
      return result;
    }
    if (!result.value) {
      return err({ type: "not_found" });
    }

    // Free win: we already have the full channel item, so a subsequent
    // getChannelById(id) for this same channel hits cache instead of
    // spending another unit.
    await setCachedChannel(result.value.id, result.value);
    return ok(result.value.id);
  }

  return err({ type: "invalid_url" });
}

export async function getVideoById(
  youtubeVideoId: string,
): Promise<Result<YouTubeVideoItem, YouTubeError>> {
  const cached = await getCachedVideo(youtubeVideoId);
  if (cached) {
    return ok(cached);
  }

  const quota = await checkAndIncrement(LOOKUP_COST);
  if (!quota.allowed) {
    return err({ type: "quota_exceeded" });
  }

  const result = await fetchVideosByIds([youtubeVideoId]);
  if (!result.ok) {
    return result;
  }

  const video = result.value[0];
  if (!video) {
    return err({
      type: "api_error",
      status: 404,
      message: `video ${youtubeVideoId} not found`,
    });
  }

  await setCachedVideo(youtubeVideoId, video);
  return ok(video);
}

// PRD.md §6.3 "Video URL ... pasted from YouTube" (AI Prompts' "From URL"
// entry path). Three URL shapes, ID extracted directly -- no API call, no
// quota cost, mirroring resolveChannelUrl's /channel/<id> branch. The
// actual video fetch (and its quota cost) happens separately via
// getVideoById once the caller has this ID.
const YOUTU_BE_PATTERN = /^youtu\.be\/([^/?]+)/i;
const SHORTS_URL_PATTERN = /^youtube\.com\/shorts\/([^/?]+)/i;
const WATCH_URL_PATTERN = /^youtube\.com\/watch\?(.*)$/i;

function extractVideoId(normalized: string): string | null {
  const shortMatch = YOUTU_BE_PATTERN.exec(normalized);
  if (shortMatch) return shortMatch[1];

  const shortsMatch = SHORTS_URL_PATTERN.exec(normalized);
  if (shortsMatch) return shortsMatch[1];

  const watchMatch = WATCH_URL_PATTERN.exec(normalized);
  if (watchMatch) {
    const videoId = new URLSearchParams(watchMatch[1]).get("v");
    if (videoId) return videoId;
  }

  return null;
}

export function resolveVideoUrl(url: string): Result<string, { type: "invalid_url" }> {
  const videoId = extractVideoId(normalizeYoutubeUrl(url));
  return videoId ? ok(videoId) : err({ type: "invalid_url" });
}
