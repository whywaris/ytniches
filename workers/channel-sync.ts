import { z } from "zod";

import { getChannelById, getChannelVideos } from "@/lib/youtube";
import { upsertChannels } from "@/lib/services/channels";
import { createServiceClient } from "@/lib/supabase/service";
import { inngest } from "@/lib/inngest/client";
import {
  computeBaseline,
  computeRecencyWeight,
  OUTLIER_SCORE,
  OUTLIER_THRESHOLD_MULTIPLIER,
  type BaselineVideo,
} from "@/lib/outliers/scoring";
import {
  sendCadenceChangeEmail,
  sendNewVideoEmail,
  sendOutlierEmail,
  sendViewSpikeEmail,
} from "@/lib/email/notifications";
import { isInQuietHours } from "@/lib/notifications/quiet-hours";
import { isEmailEligibleTier } from "@/lib/billing";
import type { YouTubeVideoItem } from "@/lib/youtube/schemas";
import type { Database } from "@/lib/supabase/database.types";

// PRD.md §6.2/§7.1 / Backend-Schema.md §4.2. subscriber_milestone is
// enum-ready but still out of scope (wasn't in any task's list yet).
type ImplementedEventType = "new_video" | "view_spike" | "cadence_change" | "outlier_detected";

export interface DetectedEvent {
  channelId: string;
  channelName: string;
  eventType: ImplementedEventType;
  payload: Record<string, string | number>;
}

// UI-UX-Flow.md §6.1's "crossed 100k views" badge — fixed milestones, not
// the statistical baseline-vs-outlier comparison (that's outlier_detected,
// Phase 2). Only the *highest* newly-crossed milestone fires per video per
// sync, not one event per milestone, so a video that jumps from 500 to 2M
// views in one sync gets a single "crossed 1M" event, not four.
const VIEW_MILESTONES = [1_000, 10_000, 100_000, 1_000_000, 10_000_000];

function highestCrossedMilestone(oldViews: number, newViews: number): number | null {
  let crossed: number | null = null;
  for (const milestone of VIEW_MILESTONES) {
    if (oldViews < milestone && newViews >= milestone) {
      crossed = milestone;
    }
  }
  return crossed;
}

const FOUR_WEEKS_MS = 28 * 24 * 60 * 60 * 1000;
// Minimum delta to treat as a real cadence change, not sync-to-sync noise
// (e.g. 2.0 -> 2.25 videos/week from one extra upload isn't a "change").
const CADENCE_CHANGE_THRESHOLD_PER_WEEK = 1;

function computeCadence(publishedAtList: string[], now: number): number {
  const recentCount = publishedAtList.filter(
    (iso) => now - new Date(iso).getTime() <= FOUR_WEEKS_MS,
  ).length;
  return recentCount / 4;
}

function parseIso8601Duration(duration: string): number {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(duration);
  if (!match) return 0;
  const [, hours, minutes, seconds] = match;
  return Number(hours ?? 0) * 3600 + Number(minutes ?? 0) * 60 + Number(seconds ?? 0);
}

function toVideoRow(
  video: YouTubeVideoItem,
  channelId: string,
): Database["public"]["Tables"]["videos"]["Insert"] {
  return {
    youtube_video_id: video.id,
    channel_id: channelId,
    title: video.snippet.title,
    description: video.snippet.description,
    thumbnail_url:
      video.snippet.thumbnails?.high?.url ??
      video.snippet.thumbnails?.medium?.url ??
      video.snippet.thumbnails?.default?.url ??
      "",
    duration_seconds: parseIso8601Duration(video.contentDetails.duration),
    view_count: video.statistics?.viewCount ?? 0,
    like_count: video.statistics?.likeCount ?? null,
    comment_count: video.statistics?.commentCount ?? null,
    published_at: video.snippet.publishedAt,
    tags: video.snippet.tags,
    language: video.snippet.defaultLanguage ?? null,
    // No captions-availability check happens here — Task 3 (AI Prompts)
    // concern when it actually needs a transcript, not sync time.
    has_transcript: false,
    last_synced_at: new Date().toISOString(),
  };
}

// Exported -- lib/services/prompts.ts (Phase 1 Task 3) reuses this exact
// mapping for the "From URL" entry path, same reasoning as
// lib/services/channels.ts's upsertChannels export.
export async function upsertVideos(
  channelId: string,
  videos: YouTubeVideoItem[],
): Promise<Map<string, string>> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("videos")
    .upsert(
      videos.map((video) => toVideoRow(video, channelId)),
      { onConflict: "youtube_video_id" },
    )
    .select("id, youtube_video_id");

  if (error) {
    throw new Error(`upsertVideos failed: ${error.message}`);
  }

  return new Map(data.map((row) => [row.youtube_video_id, row.id]));
}

// The testable core: fetch fresh channel/video data, diff against what we
// already had, upsert the cache tables, write tracked_events for whatever
// was detected, and return those events for the (separate) fan-out step.
// Uses the service role throughout -- this is a system job with no user
// session, operating on shared channel/video data (Backend-Schema.md §6.1).
export async function syncChannelData(channelId: string): Promise<DetectedEvent[]> {
  const supabase = createServiceClient();

  const { data: channelRow, error: channelError } = await supabase
    .from("channels")
    .select("id, youtube_channel_id, name")
    .eq("id", channelId)
    .maybeSingle();

  if (channelError) {
    throw new Error(`syncChannelData channel lookup failed: ${channelError.message}`);
  }
  if (!channelRow) {
    // Channel row gone (deleted?) -- nothing to sync, not a retryable failure.
    return [];
  }

  const { data: oldVideoRows, error: oldVideosError } = await supabase
    .from("videos")
    .select("youtube_video_id, view_count, published_at")
    .eq("channel_id", channelId);

  if (oldVideosError) {
    throw new Error(`syncChannelData old videos query failed: ${oldVideosError.message}`);
  }

  const channelResult = await getChannelById(channelRow.youtube_channel_id);
  if (!channelResult.ok) {
    // Thrown, not returned as a typed error: TRD.md §4.3 wants at-least-once
    // delivery with idempotent handlers, so a transient YouTube/quota
    // failure should let Inngest's automatic retry (3x) handle it.
    throw new Error(`syncChannelData channel fetch failed: ${JSON.stringify(channelResult.error)}`);
  }

  const videosResult = await getChannelVideos(channelRow.youtube_channel_id);
  if (!videosResult.ok) {
    throw new Error(`syncChannelData videos fetch failed: ${JSON.stringify(videosResult.error)}`);
  }

  // Refreshes channels row (subscriber_count, last_synced_at, etc.) --
  // lib/youtube's own cache-first design (Task 1) means this can still
  // serve a Redis-cached value if the channel was recently viewed
  // elsewhere. Not an active bug today (every tracked_channels row
  // defaults to a 24h cadence, longer than Redis's 6h channel TTL, so the
  // cache is always naturally expired by the time this job runs) --
  // becomes one once a faster-than-6h tier exists (Task 5). Revisit then
  // with a cache-bypassing fetch for this specific call site.
  await upsertChannels([channelResult.value]);

  const freshVideos = videosResult.value;
  const videoIdByYoutubeId =
    freshVideos.length > 0 ? await upsertVideos(channelId, freshVideos) : new Map<string, string>();

  const oldByYoutubeId = new Map(
    (oldVideoRows ?? []).map((video) => [video.youtube_video_id, video]),
  );
  const events: DetectedEvent[] = [];

  for (const video of freshVideos) {
    if (!oldByYoutubeId.has(video.id)) {
      events.push({
        channelId,
        channelName: channelRow.name,
        eventType: "new_video",
        payload: {
          videoId: videoIdByYoutubeId.get(video.id) ?? video.id,
          title: video.snippet.title,
        },
      });
    }
  }

  for (const video of freshVideos) {
    const old = oldByYoutubeId.get(video.id);
    if (!old) continue;
    const newViews = video.statistics?.viewCount ?? old.view_count;
    const crossed = highestCrossedMilestone(old.view_count, newViews);
    if (crossed !== null) {
      events.push({
        channelId,
        channelName: channelRow.name,
        eventType: "view_spike",
        payload: {
          videoId: videoIdByYoutubeId.get(video.id) ?? video.id,
          title: video.snippet.title,
          crossedThreshold: crossed,
          viewCount: newViews,
        },
      });
    }
  }

  // Skip on a channel's first-ever sync: with no pre-existing videos to
  // compare against, "previous cadence" would be a meaningless 0, and
  // every newly-tracked channel would falsely report "cadence changed."
  if ((oldVideoRows?.length ?? 0) > 0) {
    const now = Date.now();
    const previousCadence = computeCadence(
      (oldVideoRows ?? []).map((video) => video.published_at),
      now,
    );
    const currentCadence = computeCadence(
      freshVideos.map((video) => video.snippet.publishedAt),
      now,
    );
    if (Math.abs(currentCadence - previousCadence) >= CADENCE_CHANGE_THRESHOLD_PER_WEEK) {
      events.push({
        channelId,
        channelName: channelRow.name,
        eventType: "cadence_change",
        payload: { previousPerWeek: previousCadence, currentPerWeek: currentCadence },
      });
    }
  }

  // PRD.md §7.1's outlier detection (Phase 2 Task 1 plan). Evaluated over
  // every video this sync fetched (up to the last 50, lib/youtube's own
  // cap), not just this sync's new_video diff -- an older video's view
  // count can cross the threshold well after it was published (PRD's
  // "Trending: outliers gaining momentum right now"). computeBaseline
  // returns null below BASELINE_MIN_VIDEOS, so a channel's early videos
  // naturally produce no candidates yet (cold start).
  //
  // Fire-once dedup: an outlier_detected event should never re-fire for a
  // video that already has one (same reasoning as highestCrossedMilestone
  // above) -- a still-climbing video would otherwise spam a new event
  // every sync. One batched lookup for the whole channel, not one query
  // per candidate video.
  if (freshVideos.length > 0) {
    const { data: existingOutlierEvents, error: outlierEventsError } = await supabase
      .from("tracked_events")
      .select("payload")
      .eq("channel_id", channelId)
      .eq("event_type", "outlier_detected");
    if (outlierEventsError) {
      throw new Error(`syncChannelData outlier events query failed: ${outlierEventsError.message}`);
    }
    const alreadyFlaggedVideoIds = new Set(
      (existingOutlierEvents ?? [])
        .map((row) => (row.payload as { videoId?: unknown }).videoId)
        .filter((id): id is string => typeof id === "string"),
    );

    for (const video of freshVideos) {
      const internalVideoId = videoIdByYoutubeId.get(video.id) ?? video.id;
      if (alreadyFlaggedVideoIds.has(internalVideoId)) continue;

      const candidatePublishedAtMs = new Date(video.snippet.publishedAt).getTime();
      const priorVideos: BaselineVideo[] = freshVideos
        .filter(
          (other) =>
            other.id !== video.id &&
            new Date(other.snippet.publishedAt).getTime() < candidatePublishedAtMs,
        )
        .map((other) => ({
          viewCount: other.statistics?.viewCount ?? 0,
          publishedAt: other.snippet.publishedAt,
        }));

      const baseline = computeBaseline(priorVideos);
      if (baseline === null) continue;

      const viewCount = video.statistics?.viewCount ?? 0;
      if (viewCount < baseline * OUTLIER_THRESHOLD_MULTIPLIER) continue;

      const recencyWeight = computeRecencyWeight(video.snippet.publishedAt);
      events.push({
        channelId,
        channelName: channelRow.name,
        eventType: "outlier_detected",
        payload: {
          videoId: internalVideoId,
          title: video.snippet.title,
          viewCount,
          baseline,
          outlierScore: OUTLIER_SCORE(viewCount, baseline, recencyWeight),
        },
      });
    }
  }

  if (events.length > 0) {
    const { error: insertError } = await supabase.from("tracked_events").insert(
      events.map((event) => ({
        channel_id: event.channelId,
        event_type: event.eventType,
        payload: event.payload,
      })),
    );
    if (insertError) {
      throw new Error(`syncChannelData tracked_events insert failed: ${insertError.message}`);
    }
  }

  return events;
}

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function composeNotification(event: DetectedEvent): {
  title: string;
  body: string | null;
  relatedResource: string;
} {
  switch (event.eventType) {
    case "new_video":
      return {
        title: `New video from ${event.channelName}`,
        body: String(event.payload.title),
        relatedResource: `video:${event.payload.videoId}`,
      };
    case "view_spike":
      return {
        title: `${event.channelName} crossed ${formatCount(Number(event.payload.crossedThreshold))} views`,
        body: String(event.payload.title),
        relatedResource: `video:${event.payload.videoId}`,
      };
    case "cadence_change":
      return {
        title: `${event.channelName} changed upload cadence`,
        body: `Was ${Number(event.payload.previousPerWeek).toFixed(1)}/week, now ${Number(event.payload.currentPerWeek).toFixed(1)}/week`,
        relatedResource: `channel:${event.channelId}`,
      };
    case "outlier_detected":
      return {
        title: `Outlier detected on ${event.channelName}`,
        body: String(event.payload.title),
        relatedResource: `video:${event.payload.videoId}`,
      };
  }
}

// Batch size cap referenced in the fan-out loop below: never an unbounded
// INSERT for a hypothetically enormous tracker list.
const MAX_FANOUT_TRACKERS_PER_CHANNEL = 1000;
const FANOUT_BATCH_SIZE = 500;
const FANOUT_BATCH_DELAY_MS = 200;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Phase 2 Task 2 gap 6: email is a second delivery channel on the same
// notification an in-app-eligible user already gets, not an independently
// triggered one -- dispatches by event type, same shape as
// composeNotification above.
function sendEmailForEvent(userId: string, event: DetectedEvent): Promise<boolean> {
  switch (event.eventType) {
    case "new_video":
      return sendNewVideoEmail(userId, event);
    case "view_spike":
      return sendViewSpikeEmail(userId, event);
    case "cadence_change":
      return sendCadenceChangeEmail(userId, event);
    case "outlier_detected":
      return sendOutlierEmail(userId, event);
  }
}

// Separate from syncChannelData deliberately (Flag 5): a fan-out failure
// must not roll back the tracked_events write already committed above --
// events are more important than notifications. Called from its own
// step.run() in the Inngest function below, so a retry here never re-runs
// the (already-succeeded) sync step.
export async function fanOutNotifications(events: DetectedEvent[]): Promise<void> {
  if (events.length === 0) return;

  const supabase = createServiceClient();

  for (const event of events) {
    const { data: trackers, error: trackersError } = await supabase
      .from("tracked_channels")
      .select("user_id")
      // Hard cap: never fan out to more than 1,000 users for a single
      // event, and never in one unbounded INSERT -- batched below in
      // groups of FANOUT_BATCH_SIZE (500) with a short delay between
      // batches. Revisit if a channel realistically exceeds this in
      // practice; not expected in MVP.
      .eq("channel_id", event.channelId)
      .limit(MAX_FANOUT_TRACKERS_PER_CHANNEL);

    if (trackersError) {
      throw new Error(`fanOutNotifications tracker lookup failed: ${trackersError.message}`);
    }
    if (!trackers || trackers.length === 0) continue;

    const userIds = trackers.map((tracker) => tracker.user_id);

    const [
      { data: overrides, error: overridesError },
      { data: prefs, error: prefsError },
      { data: subscriptions, error: subscriptionsError },
      { data: profiles, error: profilesError },
    ] = await Promise.all([
      supabase
        .from("notification_channel_overrides")
        .select("user_id, notifications_enabled")
        .eq("channel_id", event.channelId)
        .in("user_id", userIds),
      supabase
        .from("notification_preferences")
        .select("user_id, in_app_enabled, email_enabled, quiet_hours_start, quiet_hours_end")
        .eq("notification_type", event.eventType)
        .in("user_id", userIds),
      supabase
        .from("subscriptions")
        .select("user_id, tier")
        .eq("is_current", true)
        .in("user_id", userIds),
      supabase.from("profiles").select("id, time_zone").in("id", userIds),
    ]);

    if (overridesError) {
      throw new Error(`fanOutNotifications override lookup failed: ${overridesError.message}`);
    }
    if (prefsError) {
      throw new Error(`fanOutNotifications preference lookup failed: ${prefsError.message}`);
    }
    if (subscriptionsError) {
      throw new Error(
        `fanOutNotifications subscription lookup failed: ${subscriptionsError.message}`,
      );
    }
    if (profilesError) {
      throw new Error(`fanOutNotifications profile lookup failed: ${profilesError.message}`);
    }

    const overrideByUser = new Map(
      (overrides ?? []).map((row) => [row.user_id, row.notifications_enabled]),
    );
    const prefByUser = new Map((prefs ?? []).map((row) => [row.user_id, row]));
    const tierByUser = new Map((subscriptions ?? []).map((row) => [row.user_id, row.tier]));
    const timeZoneByUser = new Map((profiles ?? []).map((row) => [row.id, row.time_zone]));

    // Per-channel override wins if set; otherwise the general preference;
    // otherwise default enabled (Backend-Schema.md §4.4: no row = no
    // override yet, and in_app_enabled itself defaults true).
    const eligibleUserIds = userIds.filter((userId) => {
      const override = overrideByUser.get(userId);
      if (override !== undefined) return override;
      return prefByUser.get(userId)?.in_app_enabled ?? true;
    });

    if (eligibleUserIds.length === 0) continue;

    // Email is a second channel on top of in-app (gap 6), gated by tier
    // (gap 1, no subscription row = trial = not eligible), the user's own
    // opt-in (default false), and quiet hours (gap 5).
    const emailEligibleUserIds = new Set(
      eligibleUserIds.filter((userId) => {
        if (!isEmailEligibleTier(tierByUser.get(userId))) return false;
        const pref = prefByUser.get(userId);
        if (!pref?.email_enabled) return false;
        const timeZone = timeZoneByUser.get(userId) ?? "UTC";
        return !isInQuietHours(pref.quiet_hours_start, pref.quiet_hours_end, timeZone);
      }),
    );

    const { title, body, relatedResource } = composeNotification(event);
    const rows = eligibleUserIds.map((userId) => ({
      user_id: userId,
      notification_type: event.eventType,
      title,
      body,
      related_resource: relatedResource,
      delivered_channels: ["in_app"],
    }));

    for (let i = 0; i < rows.length; i += FANOUT_BATCH_SIZE) {
      if (i > 0) await delay(FANOUT_BATCH_DELAY_MS);
      const batch = rows.slice(i, i + FANOUT_BATCH_SIZE);
      const { data: insertedRows, error: insertError } = await supabase
        .from("notifications")
        .insert(batch)
        .select("id, user_id");
      if (insertError) {
        throw new Error(`fanOutNotifications insert failed: ${insertError.message}`);
      }

      // Never blocks/rolls back the in-app rows just inserted above -- a
      // failed or skipped email is a no-op here, not a thrown error
      // (constraint: never block in-app delivery on email).
      for (const row of insertedRows ?? []) {
        if (!emailEligibleUserIds.has(row.user_id)) continue;
        const sent = await sendEmailForEvent(row.user_id, event);
        if (sent) {
          await supabase
            .from("notifications")
            .update({ delivered_channels: ["in_app", "email"] })
            .eq("id", row.id);
        }
      }
    }
  }
}

const ChannelSyncRequestedSchema = z.object({ channelId: z.string().uuid() });

export const channelSyncFunction = inngest.createFunction(
  {
    id: "channel-sync",
    // Idempotent per channel, not per user: the sync itself is
    // channel-global (Backend-Schema.md §4.2), so two events for the same
    // channel within Inngest's idempotency window collapse to one
    // execution (TRD.md §4.3 "Deduplication -- events with same key
    // within a window collapse").
    idempotency: "event.data.channelId",
    triggers: [{ event: "channel/sync.requested" }],
  },
  async ({ event, step }) => {
    const { channelId } = ChannelSyncRequestedSchema.parse(event.data);

    const events = await step.run("write-tracked-events", () => syncChannelData(channelId));

    await step.run("fan-out-notifications", () => fanOutNotifications(events));

    return { channelId, eventsDetected: events.length };
  },
);
