import {
  getCachedChannel,
  getCachedChannelVideos,
  getCachedHandle,
  getCachedSearchResult,
  getCachedVideo,
  setCachedChannel,
  setCachedChannelVideos,
  setCachedHandle,
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
import { parseChannelInput, parseVideoInput } from "@/lib/youtube/urls";
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
// validating state. Parsing lives in lib/youtube/urls.ts (shared with the
// free tools). A channel ID is trusted as-is (no API call, no cost); a
// handle needs channels.list?forHandle= (1 unit) on a handle-cache miss,
// since the handle -> ID mapping only YouTube knows.
export async function resolveChannelUrl(url: string): Promise<Result<string, YouTubeResolveError>> {
  const input = parseChannelInput(url);
  if (!input) return err({ type: "invalid_url" });
  if (input.kind === "id") return ok(input.id);

  const cachedId = await getCachedHandle(input.handle);
  if (cachedId) return ok(cachedId);

  const quota = await checkAndIncrement(LOOKUP_COST);
  if (!quota.allowed) {
    return err({ type: "quota_exceeded" });
  }

  const result = await fetchChannelByHandle(input.handle);
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
  await setCachedHandle(input.handle, result.value.id);
  return ok(result.value.id);
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
// entry path). The ID comes straight from lib/youtube/urls.ts -- no API
// call, no quota cost. The actual fetch happens separately via getVideoById.
export function resolveVideoUrl(url: string): Result<string, { type: "invalid_url" }> {
  const video = parseVideoInput(url);
  return video ? ok(video.id) : err({ type: "invalid_url" });
}
