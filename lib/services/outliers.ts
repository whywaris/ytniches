import { computeRecencyWeight, OUTLIER_SCORE } from "@/lib/outliers/scoring";
import { clampLimit, decodeCursor, encodeCursor, type FeedCursor } from "@/lib/services/tracking";
import { createClient } from "@/lib/supabase/server";
import { err, ok, type Result } from "@/lib/result";
import type { RequestContext } from "@/lib/context";
import type { TrackingError } from "@/lib/services/tracking";
import type { Database } from "@/lib/supabase/database.types";

import type { SupabaseClient } from "@supabase/supabase-js";

// PRD.md §7.1 "Trending: outliers gaining momentum right now" -- there's no
// rolling view-count time series to measure actual momentum from (each
// video gets exactly one outlier_detected snapshot, ever, per Phase OA's
// fire-once rule), so Trending is approximated as "recently detected,
// ranked by current score": a tight, non-configurable window versus Grid's
// user-selectable 30/60/90. Documented here rather than in DECISIONS.md --
// this is an implementation reading of an already-approved gap (§9), not a
// new open question.
const TRENDING_WINDOW_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

const DEFAULT_TOP_LIMIT = 20;
const MAX_TOP_LIMIT = 50;
// Grid/Trending rank by a score computed in application code (join +
// recency math), not something Postgres can ORDER BY directly -- this caps
// how many detected-in-range candidates get pulled before that ranking, so
// a channel with an unusually large outlier history can't force an
// unbounded query.
const MAX_RANK_CANDIDATES = 500;

interface OutlierPayload {
  videoId: string;
  title: string;
  viewCount: number;
  baseline: number;
  outlierScore: number;
}

function parsePayload(payload: unknown): OutlierPayload | null {
  if (typeof payload !== "object" || payload === null) return null;
  const { videoId, title, baseline } = payload as Record<string, unknown>;
  if (typeof videoId !== "string" || typeof title !== "string" || typeof baseline !== "number") {
    return null;
  }
  return payload as OutlierPayload;
}

export interface OutlierItem {
  id: string;
  channelId: string;
  channelName: string;
  channelAvatarUrl: string | null;
  videoId: string;
  videoTitle: string;
  videoThumbnailUrl: string;
  viewCount: number;
  baseline: number;
  outlierScore: number;
  publishedAt: string;
  detectedAt: string;
}

type TrackedEventRow = Database["public"]["Tables"]["tracked_events"]["Row"];

// Shared by all three list functions below (and workers/digest.ts, which
// passes a service-role client instead of the session one -- both are
// SupabaseClient<Database>, so this doesn't care which): turns raw
// outlier_detected tracked_events rows into OutlierItems, joining in
// *live* view_count from videos (payload.viewCount is a detection-time
// snapshot; views keep climbing after that) and recomputing recency
// weight against now (payload carries the detection-time recency weight
// baked into its own score, which would otherwise never decay further).
// baseline itself is reused as-is from the payload -- it's the trailing
// average of the videos published before this one, a historical
// calibration point that doesn't change as more time passes.
export async function buildOutlierItems(
  supabase: SupabaseClient<Database>,
  rows: TrackedEventRow[],
): Promise<OutlierItem[]> {
  const parsedByEventId = new Map<string, OutlierPayload>();
  for (const row of rows) {
    const parsed = parsePayload(row.payload);
    if (parsed) parsedByEventId.set(row.id, parsed);
  }
  if (parsedByEventId.size === 0) return [];

  const videoIds = [...new Set([...parsedByEventId.values()].map((p) => p.videoId))];
  const channelIds = [...new Set(rows.map((row) => row.channel_id))];

  const [{ data: videos, error: videosError }, { data: channels, error: channelsError }] =
    await Promise.all([
      supabase
        .from("videos")
        .select("id, title, thumbnail_url, view_count, published_at")
        .in("id", videoIds),
      supabase.from("channels").select("id, name, avatar_url").in("id", channelIds),
    ]);

  if (videosError) {
    throw new Error(`buildOutlierItems videos query failed: ${videosError.message}`);
  }
  if (channelsError) {
    throw new Error(`buildOutlierItems channels query failed: ${channelsError.message}`);
  }

  const videoById = new Map(videos.map((video) => [video.id, video]));
  const channelById = new Map(channels.map((channel) => [channel.id, channel]));

  return rows.flatMap((row) => {
    const payload = parsedByEventId.get(row.id);
    if (!payload) return [];
    // The cached video row can be missing (e.g. purged) -- skip rather than
    // show a stale, unjoinable outlier.
    const video = videoById.get(payload.videoId);
    if (!video) return [];
    const channel = channelById.get(row.channel_id);

    const recencyWeight = computeRecencyWeight(video.published_at);
    return [
      {
        id: row.id,
        channelId: row.channel_id,
        channelName: channel?.name ?? "Unknown channel",
        channelAvatarUrl: channel?.avatar_url ?? null,
        videoId: payload.videoId,
        videoTitle: video.title,
        videoThumbnailUrl: video.thumbnail_url,
        viewCount: video.view_count,
        baseline: payload.baseline,
        outlierScore: OUTLIER_SCORE(video.view_count, payload.baseline, recencyWeight),
        publishedAt: video.published_at,
        detectedAt: row.detected_at,
      },
    ];
  });
}

async function trackedChannelIds(ctx: RequestContext): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tracked_channels")
    .select("channel_id")
    .eq("user_id", ctx.userId);

  if (error) {
    throw new Error(`trackedChannelIds query failed: ${error.message}`);
  }
  return data.map((row) => row.channel_id);
}

// PRD.md §7.1 "Outliers feed across all tracked channels" -- chronological,
// cursor-paginated, same shape as getActivityFeed/getChannelActivity.
export async function listOutlierFeed(
  ctx: RequestContext,
  options: { limit?: number; cursor?: string } = {},
): Promise<Result<{ items: OutlierItem[]; nextCursor: string | null }, TrackingError>> {
  const limit = clampLimit(options.limit);

  let cursor: FeedCursor | null = null;
  if (options.cursor) {
    cursor = decodeCursor(options.cursor);
    if (!cursor) {
      return err({ type: "invalid_cursor" });
    }
  }

  const channelIds = await trackedChannelIds(ctx);
  if (channelIds.length === 0) {
    return ok({ items: [], nextCursor: null });
  }

  const supabase = await createClient();
  let query = supabase
    .from("tracked_events")
    .select("*")
    .eq("event_type", "outlier_detected")
    .in("channel_id", channelIds)
    .order("detected_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    query = query.or(
      `detected_at.lt.${cursor.sortKey},and(detected_at.eq.${cursor.sortKey},id.lt.${cursor.id})`,
    );
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`listOutlierFeed query failed: ${error.message}`);
  }

  const hasMore = data.length > limit;
  const page = data.slice(0, limit);
  const last = page[page.length - 1];
  const nextCursor = hasMore && last ? encodeCursor(last.id, last.detected_at) : null;

  return ok({ items: await buildOutlierItems(supabase, page), nextCursor });
}

export type OutlierView = "grid" | "trending";
export type OutlierRange = 30 | 60 | 90;

// PRD.md §7.1 "Grid (top-scoring past 30/60/90 days)" and "Trending
// (outliers gaining momentum right now)" -- both rank by the *same* live
// OUTLIER_SCORE, just over a different detected_at window (grid: caller's
// choice of 30/60/90; trending: a fixed, tight TRENDING_WINDOW_DAYS). A
// ranked top-N list, not a cursor feed -- PRD frames these as bounded
// "top-scoring" views, unlike Feed's explicit infinite scroll.
export async function listTopOutliers(
  ctx: RequestContext,
  options: { view: OutlierView; range?: OutlierRange; limit?: number } = { view: "grid" },
): Promise<OutlierItem[]> {
  const limit = Math.min(Math.max(1, options.limit ?? DEFAULT_TOP_LIMIT), MAX_TOP_LIMIT);
  const windowDays = options.view === "trending" ? TRENDING_WINDOW_DAYS : (options.range ?? 30);
  const since = new Date(Date.now() - windowDays * DAY_MS).toISOString();

  const channelIds = await trackedChannelIds(ctx);
  if (channelIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tracked_events")
    .select("*")
    .eq("event_type", "outlier_detected")
    .in("channel_id", channelIds)
    .gte("detected_at", since)
    .order("detected_at", { ascending: false })
    .limit(MAX_RANK_CANDIDATES);

  if (error) {
    throw new Error(`listTopOutliers query failed: ${error.message}`);
  }

  const items = await buildOutlierItems(supabase, data);
  return items.sort((a, b) => b.outlierScore - a.outlierScore).slice(0, limit);
}

// PRD.md §7.1 "Per-channel outlier list" -- chronological, cursor-paginated,
// same RLS-scoped-not-app-scoped pattern as getChannelActivity (channel_id
// is channel-global, not user-owned; a non-tracker gets an empty page).
export async function listChannelOutliers(
  ctx: RequestContext,
  channelId: string,
  options: { limit?: number; cursor?: string } = {},
): Promise<Result<{ items: OutlierItem[]; nextCursor: string | null }, TrackingError>> {
  void ctx;
  const limit = clampLimit(options.limit);

  let cursor: FeedCursor | null = null;
  if (options.cursor) {
    cursor = decodeCursor(options.cursor);
    if (!cursor) {
      return err({ type: "invalid_cursor" });
    }
  }

  const supabase = await createClient();
  let query = supabase
    .from("tracked_events")
    .select("*")
    .eq("channel_id", channelId)
    .eq("event_type", "outlier_detected")
    .order("detected_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    query = query.or(
      `detected_at.lt.${cursor.sortKey},and(detected_at.eq.${cursor.sortKey},id.lt.${cursor.id})`,
    );
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`listChannelOutliers query failed: ${error.message}`);
  }

  const hasMore = data.length > limit;
  const page = data.slice(0, limit);
  const last = page[page.length - 1];
  const nextCursor = hasMore && last ? encodeCursor(last.id, last.detected_at) : null;

  return ok({ items: await buildOutlierItems(supabase, page), nextCursor });
}
