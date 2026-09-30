import {
  LIKELY_MONETIZED_MIN_SUBS,
  LIKELY_MONETIZED_MIN_TOTAL_VIEWS,
  SHORTS_MAX_SECONDS,
  CONTENT_TYPE_LONG_MAX_SHARE,
  CONTENT_TYPE_SHORTS_MIN_SHARE,
  RECENT_UPLOAD_VIEWS_DAYS,
  VIDEOS_KEPT_PER_CHANNEL,
  type RefreshTier,
} from "@/lib/discovery/config";
import { channelOutlierScore, qualifies, refreshTier } from "@/lib/discovery/scoring";
import { evaluateAgainstChannel, type ChannelVideo } from "@/lib/outliers/scoring";
import { upsertChannels } from "@/lib/services/channels";
import { createServiceClient } from "@/lib/supabase/service";
import { parseIso8601Duration, upsertVideos } from "@/workers/channel-sync";
import {
  budgetStopOrThrow,
  inStep,
  isBudgetStop,
  runDirect,
  type StepRunner,
} from "@/lib/discovery/steps";
import { BATCH_SIZE } from "@/lib/youtube/client";
import { fetchChannelsFresh, fetchUploadIdsFresh, fetchVideosFresh } from "@/lib/youtube/discovery";
import type { YouTubeChannelItem, YouTubeVideoItem } from "@/lib/youtube/schemas";

// Niche-Discovery-Engine.md §6 enrichment: refresh a batch of channels and
// their latest uploads, then derive the discovery metrics (§5.1), per-video
// outlier multiples, the refresh tier (§6.1) and global outlier feed rows.

export type ContentType = "long" | "shorts" | "mixed";

export interface ChannelEnrichment {
  avgViewsRecent: number | null;
  /** Median of the same basis as the average: typical, not skewed by one hit. */
  medianViewsRecent: number | null;
  contentType: ContentType | null;
  /** Views on uploads published in the last RECENT_UPLOAD_VIEWS_DAYS. */
  viewsLast30d: number;
  outlierScore: number | null;
  hasShorts: boolean;
  likelyMonetized: boolean;
  firstUploadAt: string | null;
  qualifies: boolean;
  tier: RefreshTier;
  /** youtube_video_id -> multiple (null = no baseline yet). */
  multiples: Map<string, number | null>;
  /** youtube_video_ids at or above the feed threshold. */
  outlierVideoIds: string[];
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

// Pure: everything enrichment decides about one channel from its fetched
// data. Split out so the rules are testable without a database.
export function computeChannelEnrichment(
  channel: YouTubeChannelItem,
  videos: YouTubeVideoItem[],
  isTracked: boolean,
  now: number = Date.now(),
): ChannelEnrichment {
  const withDuration = videos.map((video) => ({
    video,
    seconds: parseIso8601Duration(video.contentDetails.duration),
  }));
  const hasShorts = withDuration.some(
    ({ seconds }) => seconds > 0 && seconds <= SHORTS_MAX_SECONDS,
  );
  // Long-form first (spec §3): Shorts views would swamp the average.
  const longForm = withDuration.filter(({ seconds }) => seconds > SHORTS_MAX_SECONDS);
  const basis = (longForm.length > 0 ? longForm : withDuration).map(({ video }) => video);

  const avgViewsRecent =
    basis.length > 0
      ? basis.reduce((sum, video) => sum + (video.statistics?.viewCount ?? 0), 0) / basis.length
      : null;
  const medianViewsRecent = median(basis.map((video) => video.statistics?.viewCount ?? 0));

  const timed = withDuration.filter(({ seconds }) => seconds > 0);
  const shortsShare =
    timed.length > 0
      ? timed.filter(({ seconds }) => seconds <= SHORTS_MAX_SECONDS).length / timed.length
      : null;
  const contentType: ContentType | null =
    shortsShare === null
      ? null
      : shortsShare >= CONTENT_TYPE_SHORTS_MIN_SHARE
        ? "shorts"
        : shortsShare <= CONTENT_TYPE_LONG_MAX_SHARE
          ? "long"
          : "mixed";

  const recentSince = now - RECENT_UPLOAD_VIEWS_DAYS * 24 * 60 * 60 * 1000;
  const viewsLast30d = videos
    .filter((video) => new Date(video.snippet.publishedAt).getTime() >= recentSince)
    .reduce((sum, video) => sum + (video.statistics?.viewCount ?? 0), 0);

  // Same rule as tracked outliers and the free Outlier Checker (D-054):
  // each video against the channel's uploads published before it.
  const channelVideos: ChannelVideo[] = basis.map((video) => ({
    id: video.id,
    viewCount: video.statistics?.viewCount ?? 0,
    publishedAt: video.snippet.publishedAt,
  }));
  const multiples = new Map<string, number | null>();
  const outlierVideoIds: string[] = [];
  const outlierPublishedAt: string[] = [];
  for (const candidate of channelVideos) {
    const evaluation = evaluateAgainstChannel(candidate, channelVideos);
    multiples.set(candidate.id, evaluation.multiplier);
    // The shared rule decides (views >= 3x baseline); the multiple is only
    // what gets stored and ranked.
    if (evaluation.isOutlier) {
      outlierVideoIds.push(candidate.id);
      outlierPublishedAt.push(candidate.publishedAt);
    }
  }

  const { subscriberCount, viewCount, videoCount } = channel.statistics;
  // We only see the latest uploads; the oldest of them is the first upload
  // only when that's all the channel has.
  const firstUploadAt =
    videos.length > 0 && videoCount <= videos.length
      ? videos.reduce((oldest, video) =>
          video.snippet.publishedAt < oldest.snippet.publishedAt ? video : oldest,
        ).snippet.publishedAt
      : null;

  const qualified = qualifies(
    {
      youtubeCreatedAt: channel.snippet.publishedAt,
      avgViewsRecent: avgViewsRecent ?? 0,
      outlierPublishedAt,
    },
    now,
  );

  return {
    avgViewsRecent,
    medianViewsRecent,
    contentType,
    viewsLast30d,
    outlierScore: channelOutlierScore(avgViewsRecent ?? 0, subscriberCount),
    hasShorts,
    likelyMonetized:
      channel.status?.madeForKids !== true &&
      subscriberCount >= LIKELY_MONETIZED_MIN_SUBS &&
      viewCount >= LIKELY_MONETIZED_MIN_TOTAL_VIEWS,
    firstUploadAt,
    qualifies: qualified,
    tier: refreshTier(
      {
        isTracked,
        youtubeCreatedAt: channel.snippet.publishedAt,
        qualifies: qualified,
        outlierPublishedAt,
      },
      now,
    ),
    multiples,
    outlierVideoIds,
  };
}

interface ChannelRow {
  id: string;
  youtube_channel_id: string;
  niche_id: string | null;
  discovered_at: string | null;
  enriched_at: string | null;
}

export interface EnrichResult {
  enriched: number;
  unavailable: number;
  dropped: number;
  outliers: number;
  stoppedForBudget: boolean;
}

async function loadChannels(channelIds: string[]): Promise<ChannelRow[]> {
  const { data, error } = await createServiceClient()
    .from("channels")
    .select("id, youtube_channel_id, niche_id, discovered_at, enriched_at")
    .in("id", channelIds);
  if (error) throw new Error(`enrich loadChannels failed: ${error.message}`);
  return data;
}

async function loadTrackedIds(channelIds: string[]): Promise<Set<string>> {
  const { data, error } = await createServiceClient()
    .from("tracked_channels")
    .select("channel_id")
    .in("channel_id", channelIds);
  if (error) throw new Error(`enrich loadTrackedIds failed: ${error.message}`);
  return new Set(data.map((row) => row.channel_id));
}

// Spec §6.2 "everything else is dropped": a channel the engine itself
// discovered that fails qualification on its very first enrichment is
// deleted, not kept as cold -- unless a user row points at it in the
// meantime: tracking, a prompt from one of its videos, a calendar entry, a
// per-channel notification setting, or a task linked to it. User-created
// rows are never removed or orphaned by a deletion here (D-073).
async function loadUserReferencedIds(channelIds: string[]): Promise<Set<string>> {
  const supabase = createServiceClient();
  const [tracked, prompted, calendar, overrides, tasks] = await Promise.all([
    loadTrackedIds(channelIds),
    supabase.from("prompts").select("videos!inner(channel_id)").in("videos.channel_id", channelIds),
    supabase.from("calendar_entries").select("channel_id").in("channel_id", channelIds),
    supabase
      .from("notification_channel_overrides")
      .select("channel_id")
      .in("channel_id", channelIds),
    supabase
      .from("tasks")
      .select("linked_id")
      .eq("linked_type", "channel")
      .in("linked_id", channelIds),
  ]);
  for (const [name, result] of [
    ["prompts", prompted],
    ["calendar_entries", calendar],
    ["notification_channel_overrides", overrides],
    ["tasks", tasks],
  ] as const) {
    if (result.error) throw new Error(`dropUnqualified ${name} failed: ${result.error.message}`);
  }
  return new Set<string>([
    ...tracked,
    ...(prompted.data ?? []).map((row) => row.videos.channel_id),
    ...(calendar.data ?? []).flatMap((row) => (row.channel_id ? [row.channel_id] : [])),
    ...(overrides.data ?? []).map((row) => row.channel_id),
    ...(tasks.data ?? []).flatMap((row) => (row.linked_id ? [row.linked_id] : [])),
  ]);
}

async function dropUnqualified(channelIds: string[]): Promise<number> {
  if (channelIds.length === 0) return 0;
  const referenced = await loadUserReferencedIds(channelIds);
  const doomed = channelIds.filter((id) => !referenced.has(id));
  if (doomed.length === 0) return 0;
  const { error } = await createServiceClient().from("channels").delete().in("id", doomed);
  if (error) throw new Error(`dropUnqualified delete failed: ${error.message}`);
  return doomed.length;
}

async function markUnavailable(rows: ChannelRow[], now: Date): Promise<number> {
  if (rows.length === 0) return 0;
  const { error } = await createServiceClient()
    .from("channels")
    .update({ unavailable_since: now.toISOString(), enriched_at: now.toISOString() })
    .in(
      "id",
      rows.map((row) => row.id),
    )
    .is("unavailable_since", null);
  if (error) throw new Error(`enrichChannels unavailable failed: ${error.message}`);
  return rows.length;
}

// D-078: each paid YouTube call is its own step (channels.list, one
// playlistItems per channel, one videos.list per 50 IDs), then one step
// stores everything. A retry resumes at the failed step.
export async function enrichChannels(
  channelIds: string[],
  now: Date = new Date(),
  run: StepRunner = runDirect,
): Promise<EnrichResult> {
  const result: EnrichResult = {
    enriched: 0,
    unavailable: 0,
    dropped: 0,
    outliers: 0,
    stoppedForBudget: false,
  };
  if (channelIds.length === 0) return result;

  const rows = await inStep(run, "load-channels", () => loadChannels(channelIds));
  const rowByYoutubeId = new Map(rows.map((row) => [row.youtube_channel_id, row]));

  const fetched = await inStep(run, "fetch-channels", async () =>
    budgetStopOrThrow(
      await fetchChannelsFresh([...rowByYoutubeId.keys()]),
      "enrichChannels channels fetch",
    ),
  );
  if (!fetched.ok) return { ...result, stoppedForBudget: true };

  result.unavailable = await inStep(run, "store-channels", async () => {
    await upsertChannels(fetched.value);
    // Requested but not returned: deleted/suspended on YouTube.
    const returned = new Set(fetched.value.map((channel) => channel.id));
    return markUnavailable(
      rows.filter((row) => !returned.has(row.youtube_channel_id)),
      now,
    );
  });

  // Uploads: one playlistItems call per channel. Stop at the budget line
  // and only finish the channels we already have uploads for.
  const uploadIds = new Map<string, string[]>();
  for (const channel of fetched.value) {
    const playlistId = channel.contentDetails?.relatedPlaylists.uploads;
    if (!playlistId) {
      uploadIds.set(channel.id, []);
      continue;
    }
    const ids = await inStep(run, `uploads-${channel.id}`, () =>
      fetchUploadIdsFresh(playlistId, VIDEOS_KEPT_PER_CHANNEL),
    );
    if (!ids.ok) {
      if (isBudgetStop(ids.error)) {
        result.stoppedForBudget = true;
        break;
      }
      // An empty/removed uploads playlist 404s; treat as no uploads.
      uploadIds.set(channel.id, []);
      continue;
    }
    uploadIds.set(channel.id, ids.value);
  }

  const allVideoIds = [...uploadIds.values()].flat();
  const videos: YouTubeVideoItem[] = [];
  for (let i = 0; i < allVideoIds.length; i += BATCH_SIZE) {
    const chunk = allVideoIds.slice(i, i + BATCH_SIZE);
    const fetchedVideos = await inStep(run, `videos-${i / BATCH_SIZE}`, async () =>
      budgetStopOrThrow(await fetchVideosFresh(chunk), "enrichChannels videos fetch"),
    );
    if (!fetchedVideos.ok) return { ...result, stoppedForBudget: true };
    videos.push(...fetchedVideos.value);
  }

  return inStep(run, "store", () =>
    storeEnrichment(rows, fetched.value, uploadIds, videos, now, result),
  );
}

async function storeEnrichment(
  rows: ChannelRow[],
  channels: YouTubeChannelItem[],
  uploadIds: Map<string, string[]>,
  videos: YouTubeVideoItem[],
  now: Date,
  counts: EnrichResult,
): Promise<EnrichResult> {
  const result = { ...counts };
  const supabase = createServiceClient();
  const rowByYoutubeId = new Map(rows.map((row) => [row.youtube_channel_id, row]));
  const videoById = new Map(videos.map((video) => [video.id, video]));

  const tracked = await loadTrackedIds(rows.map((row) => row.id));
  const toDrop: string[] = [];

  for (const channel of channels) {
    const ids = uploadIds.get(channel.id);
    const row = rowByYoutubeId.get(channel.id);
    if (!ids || !row) continue; // Not reached before the budget stop.

    const channelVideos = ids
      .map((id) => videoById.get(id))
      .filter((video): video is YouTubeVideoItem => !!video);
    const enrichment = computeChannelEnrichment(
      channel,
      channelVideos,
      tracked.has(row.id),
      now.getTime(),
    );

    if (row.discovered_at !== null && row.enriched_at === null && !enrichment.qualifies) {
      toDrop.push(row.id);
      continue;
    }

    const videoIdByYoutubeId =
      channelVideos.length > 0
        ? await upsertVideos(row.id, channelVideos, enrichment.multiples)
        : new Map<string, string>();

    const outlierRows = enrichment.outlierVideoIds
      .map((youtubeVideoId) => ({
        video_id: videoIdByYoutubeId.get(youtubeVideoId),
        channel_id: row.id,
        niche_id: row.niche_id,
        outlier_multiple: enrichment.multiples.get(youtubeVideoId) ?? 0,
      }))
      .filter((outlier): outlier is typeof outlier & { video_id: string } => !!outlier.video_id);
    if (outlierRows.length > 0) {
      // Upsert keeps the first detected_at (not in the payload) and
      // refreshes the multiple as views grow.
      const { error } = await supabase
        .from("outliers_feed")
        .upsert(outlierRows, { onConflict: "video_id" });
      if (error) throw new Error(`enrichChannels outliers failed: ${error.message}`);
      result.outliers += outlierRows.length;
    }

    const { error } = await supabase
      .from("channels")
      .update({
        avg_views_recent: enrichment.avgViewsRecent,
        median_views_recent: enrichment.medianViewsRecent,
        content_type: enrichment.contentType,
        views_last_30d: enrichment.viewsLast30d,
        outlier_score: enrichment.outlierScore,
        has_shorts: enrichment.hasShorts,
        likely_monetized: enrichment.likelyMonetized,
        refresh_tier: enrichment.tier,
        enriched_at: now.toISOString(),
        unavailable_since: null,
        ...(enrichment.firstUploadAt ? { first_upload_at: enrichment.firstUploadAt } : {}),
      })
      .eq("id", row.id);
    if (error) throw new Error(`enrichChannels update failed: ${error.message}`);
    result.enriched += 1;
  }

  result.dropped = await dropUnqualified(toDrop);
  return result;
}
