import {
  getCachedChannel,
  getCachedChannelVideos,
  getCachedSearchResult,
  setCachedChannel,
  setCachedChannelVideos,
  setCachedSearchResult,
} from "@/lib/youtube/cache";
import {
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
