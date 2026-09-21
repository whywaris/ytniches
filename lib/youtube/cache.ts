import { getRedis } from "@/lib/cache/redis";
import type { YouTubeChannelItem, YouTubeVideoItem } from "@/lib/youtube/schemas";

// TRD.md §5.2 key conventions. TTL 6h on all three — search-result caching
// (youtube:search:{hash}) isn't in TRD.md's own key list, it's an agreed
// extension (Niche Finder plan gap #4) to avoid re-paying the 100-unit
// search.list cost for an identical filter combination within the window.
const CHANNEL_TTL_SECONDS = 6 * 60 * 60;
const CHANNEL_VIDEOS_TTL_SECONDS = 6 * 60 * 60;
const SEARCH_TTL_SECONDS = 6 * 60 * 60;
const VIDEO_TTL_SECONDS = 6 * 60 * 60;

function channelKey(youtubeChannelId: string): string {
  return `youtube:channel:${youtubeChannelId}`;
}

function channelVideosKey(youtubeChannelId: string): string {
  return `youtube:channel:${youtubeChannelId}:videos`;
}

function videoKey(youtubeVideoId: string): string {
  return `youtube:video:${youtubeVideoId}`;
}

function searchKey(hash: string): string {
  return `youtube:search:${hash}`;
}

// JSON.stringify key order follows insertion order, which isn't stable
// across call sites (or Node versions) — sorting keys first makes the hash
// depend only on the filter *values*, not how the caller happened to build
// the object. base64url avoids `/`/`+` characters landing in a Redis key.
export function hashFilters(filters: Record<string, unknown>): string {
  const sorted = Object.fromEntries(
    Object.entries(filters)
      .filter(([, value]) => value !== undefined)
      .sort(([a], [b]) => a.localeCompare(b)),
  );
  return Buffer.from(JSON.stringify(sorted)).toString("base64url");
}

export async function getCachedChannel(
  youtubeChannelId: string,
): Promise<YouTubeChannelItem | null> {
  const redis = getRedis();
  const cached = await redis.get<YouTubeChannelItem>(channelKey(youtubeChannelId));
  return cached ?? null;
}

export async function setCachedChannel(
  youtubeChannelId: string,
  channel: YouTubeChannelItem,
): Promise<void> {
  const redis = getRedis();
  await redis.set(channelKey(youtubeChannelId), channel, { ex: CHANNEL_TTL_SECONDS });
}

export async function getCachedVideo(youtubeVideoId: string): Promise<YouTubeVideoItem | null> {
  const redis = getRedis();
  const cached = await redis.get<YouTubeVideoItem>(videoKey(youtubeVideoId));
  return cached ?? null;
}

export async function setCachedVideo(
  youtubeVideoId: string,
  video: YouTubeVideoItem,
): Promise<void> {
  const redis = getRedis();
  await redis.set(videoKey(youtubeVideoId), video, { ex: VIDEO_TTL_SECONDS });
}

export async function getCachedChannelVideos(
  youtubeChannelId: string,
): Promise<YouTubeVideoItem[] | null> {
  const redis = getRedis();
  const cached = await redis.get<YouTubeVideoItem[]>(channelVideosKey(youtubeChannelId));
  return cached ?? null;
}

export async function setCachedChannelVideos(
  youtubeChannelId: string,
  videos: YouTubeVideoItem[],
): Promise<void> {
  const redis = getRedis();
  await redis.set(channelVideosKey(youtubeChannelId), videos, { ex: CHANNEL_VIDEOS_TTL_SECONDS });
}

export async function getCachedSearchResult(
  filters: Record<string, unknown>,
): Promise<string[] | null> {
  const redis = getRedis();
  const cached = await redis.get<string[]>(searchKey(hashFilters(filters)));
  return cached ?? null;
}

export async function setCachedSearchResult(
  filters: Record<string, unknown>,
  channelIds: string[],
): Promise<void> {
  const redis = getRedis();
  await redis.set(searchKey(hashFilters(filters)), channelIds, { ex: SEARCH_TTL_SECONDS });
}
