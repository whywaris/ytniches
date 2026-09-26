import { setCachedChannel } from "@/lib/youtube/cache";
import {
  BATCH_SIZE,
  fetchChannelsByIds,
  fetchPlaylistItemVideoIds,
  fetchVideosByIds,
  searchRecentVideos,
  type YouTubeClientError,
} from "@/lib/youtube/client";
import { checkAndIncrement, hasJobBudget } from "@/lib/youtube/quota";
import { err, ok, type Result } from "@/lib/result";
import type { YouTubeChannelItem, YouTubeVideoItem } from "@/lib/youtube/schemas";

// Background-job entry points into the YouTube API (Niche-Discovery-Engine
// §6). Unlike lib/youtube/index.ts these deliberately skip the read cache:
// a job exists to refresh data, so a 6h-old cached copy is exactly what it
// must not reuse. They still write through, so user-facing lookups benefit.
// Every call is gated by the job budget first (§6.4), so a job stops
// cleanly with `budget_exhausted` instead of eating the live-search buffer.

const SEARCH_COST = 100;
const LOOKUP_COST = 1;

export type DiscoveryYouTubeError = { type: "budget_exhausted" } | YouTubeClientError;

async function spend(cost: number): Promise<DiscoveryYouTubeError | null> {
  if (!(await hasJobBudget(cost))) return { type: "budget_exhausted" };
  const quota = await checkAndIncrement(cost);
  return quota.allowed ? null : { type: "quota_exceeded" };
}

export async function discoverChannelIdsForKeyword(
  keyword: string,
  publishedAfter: string,
): Promise<Result<string[], DiscoveryYouTubeError>> {
  const denied = await spend(SEARCH_COST);
  if (denied) return err(denied);

  const result = await searchRecentVideos(keyword, publishedAfter);
  if (!result.ok) return result;
  return ok([...new Set(result.value.map((item) => item.channelId))]);
}

export async function fetchChannelsFresh(
  youtubeChannelIds: string[],
): Promise<Result<YouTubeChannelItem[], DiscoveryYouTubeError>> {
  if (youtubeChannelIds.length === 0) return ok([]);

  const denied = await spend(LOOKUP_COST * Math.ceil(youtubeChannelIds.length / BATCH_SIZE));
  if (denied) return err(denied);

  const result = await fetchChannelsByIds(youtubeChannelIds);
  if (!result.ok) return result;
  await Promise.all(result.value.map((channel) => setCachedChannel(channel.id, channel)));
  return result;
}

export async function fetchUploadIdsFresh(
  uploadsPlaylistId: string,
  maxResults: number,
): Promise<Result<string[], DiscoveryYouTubeError>> {
  const denied = await spend(LOOKUP_COST);
  if (denied) return err(denied);
  return fetchPlaylistItemVideoIds(uploadsPlaylistId, maxResults);
}

export async function fetchVideosFresh(
  youtubeVideoIds: string[],
): Promise<Result<YouTubeVideoItem[], DiscoveryYouTubeError>> {
  if (youtubeVideoIds.length === 0) return ok([]);

  const denied = await spend(LOOKUP_COST * Math.ceil(youtubeVideoIds.length / BATCH_SIZE));
  if (denied) return err(denied);
  return fetchVideosByIds(youtubeVideoIds);
}
