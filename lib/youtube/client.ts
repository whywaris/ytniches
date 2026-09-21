import { err, ok, type Result } from "@/lib/result";
import {
  YouTubeChannelResponseSchema,
  YouTubePlaylistItemsResponseSchema,
  YouTubeSearchResponseSchema,
  YouTubeVideoResponseSchema,
  type YouTubeChannelItem,
  type YouTubeVideoItem,
} from "@/lib/youtube/schemas";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

// YouTube's max IDs per channels.list/videos.list call (TRD.md §5.3: 1 unit
// total for up to 50 IDs, vs 1 unit per call if fetched one at a time).
// Exported so index.ts can pre-compute exact quota cost for a batch of IDs
// before calling fetchChannelsByIds, rather than under-counting quota when
// a single logical lookup fans out into multiple real API calls.
export const BATCH_SIZE = 50;

export type YouTubeClientError =
  | { type: "quota_exceeded" }
  | { type: "invalid_request"; message: string }
  | { type: "network_error"; message: string }
  | { type: "api_error"; status: number; message: string }
  | { type: "invalid_response"; message: string };

function chunk<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
}

// Raw fetch + HTTP-status-to-typed-error boundary. Callers validate the
// returned JSON against the schema for the endpoint they called.
async function fetchYouTube(
  path: string,
  params: Record<string, string>,
): Promise<Result<unknown, YouTubeClientError>> {
  const url = new URL(`${YOUTUBE_API_BASE}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("key", process.env.YOUTUBE_API_KEY!);

  let response: Response;
  try {
    response = await fetch(url.toString());
  } catch (cause) {
    return err({
      type: "network_error",
      message: cause instanceof Error ? cause.message : "fetch failed",
    });
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    // YouTube Data API returns 403 (not 429) when the daily quota is
    // exhausted or the request is otherwise forbidden.
    if (response.status === 403) {
      return err({ type: "quota_exceeded" });
    }
    if (response.status === 400) {
      return err({ type: "invalid_request", message: body || response.statusText });
    }
    return err({
      type: "api_error",
      status: response.status,
      message: body || response.statusText,
    });
  }

  return ok(await response.json());
}

export async function searchChannels(query: string): Promise<Result<string[], YouTubeClientError>> {
  const result = await fetchYouTube("search", {
    part: "id",
    type: "channel",
    q: query,
    maxResults: "50",
  });
  if (!result.ok) return result;

  const parsed = YouTubeSearchResponseSchema.safeParse(result.value);
  if (!parsed.success) {
    return err({ type: "invalid_response", message: parsed.error.message });
  }

  return ok(parsed.data.items.map((item) => item.id.channelId));
}

async function fetchChannelsBatch(
  ids: string[],
): Promise<Result<YouTubeChannelItem[], YouTubeClientError>> {
  const result = await fetchYouTube("channels", {
    part: "snippet,statistics,brandingSettings,contentDetails",
    id: ids.join(","),
  });
  if (!result.ok) return result;

  const parsed = YouTubeChannelResponseSchema.safeParse(result.value);
  if (!parsed.success) {
    return err({ type: "invalid_response", message: parsed.error.message });
  }

  return ok(parsed.data.items);
}

export async function fetchChannelsByIds(
  ids: string[],
): Promise<Result<YouTubeChannelItem[], YouTubeClientError>> {
  const results = await Promise.all(chunk(ids, BATCH_SIZE).map(fetchChannelsBatch));

  const items: YouTubeChannelItem[] = [];
  for (const result of results) {
    if (!result.ok) return result;
    items.push(...result.value);
  }
  return ok(items);
}

// channels.list?forHandle= — 1 unit, same resource/shape as
// fetchChannelsByIds's id= lookup, just a different query param. `handle`
// must already have any leading "@" stripped by the caller.
export async function fetchChannelByHandle(
  handle: string,
): Promise<Result<YouTubeChannelItem | null, YouTubeClientError>> {
  const result = await fetchYouTube("channels", {
    part: "snippet,statistics,brandingSettings,contentDetails",
    forHandle: handle,
  });
  if (!result.ok) return result;

  const parsed = YouTubeChannelResponseSchema.safeParse(result.value);
  if (!parsed.success) {
    return err({ type: "invalid_response", message: parsed.error.message });
  }

  return ok(parsed.data.items[0] ?? null);
}

async function fetchVideosBatch(
  ids: string[],
): Promise<Result<YouTubeVideoItem[], YouTubeClientError>> {
  const result = await fetchYouTube("videos", {
    part: "snippet,statistics,contentDetails",
    id: ids.join(","),
  });
  if (!result.ok) return result;

  const parsed = YouTubeVideoResponseSchema.safeParse(result.value);
  if (!parsed.success) {
    return err({ type: "invalid_response", message: parsed.error.message });
  }

  return ok(parsed.data.items);
}

export async function fetchVideosByIds(
  ids: string[],
): Promise<Result<YouTubeVideoItem[], YouTubeClientError>> {
  const results = await Promise.all(chunk(ids, BATCH_SIZE).map(fetchVideosBatch));

  const items: YouTubeVideoItem[] = [];
  for (const result of results) {
    if (!result.ok) return result;
    items.push(...result.value);
  }
  return ok(items);
}

// 1 unit, cheap channel-video enumeration via the channel's uploads
// playlist (vs. search.list?type=video at 100 units). maxResults capped at
// 50 (YouTube's own per-call max for this endpoint).
export async function fetchPlaylistItemVideoIds(
  playlistId: string,
): Promise<Result<string[], YouTubeClientError>> {
  const result = await fetchYouTube("playlistItems", {
    part: "contentDetails",
    playlistId,
    maxResults: "50",
  });
  if (!result.ok) return result;

  const parsed = YouTubePlaylistItemsResponseSchema.safeParse(result.value);
  if (!parsed.success) {
    return err({ type: "invalid_response", message: parsed.error.message });
  }

  return ok(parsed.data.items.map((item) => item.contentDetails.videoId));
}
