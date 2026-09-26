import { z } from "zod";

import { isEmailEligibleTier } from "@/lib/billing";
import { getEffectivePlan } from "@/lib/billing/effective-plan";
import { DIGEST_ITEM_LIMIT } from "@/lib/notifications/digest-config";
import { buildOutlierItems } from "@/lib/services/outliers";
import { sendWeeklyDigestEmail, type WeeklyDigestData } from "@/lib/email/notifications";
import { createServiceClient } from "@/lib/supabase/service";
import { inngest } from "@/lib/inngest/client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const DAY_MS = 24 * 60 * 60 * 1000;

export type DigestCadence = "daily" | "weekly";

interface DueDigestUser {
  userId: string;
  cadence: DigestCadence;
}

// TRD.md §4.2 "digest.email: Scheduled Daily 8am user local." The RPC does
// the timezone-aware "is it 8am for this user right now" filtering
// (find_due_digest_user_ids_function migration) -- this just shapes the
// result.
async function findDueDigestUsers(): Promise<DueDigestUser[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc("find_due_digest_user_ids");

  if (error) {
    throw new Error(`findDueDigestUsers failed: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    userId: row.user_id,
    cadence: row.cadence === "weekly" ? "weekly" : "daily",
  }));
}

interface CronStepTools {
  run: (id: string, fn: () => Promise<DueDigestUser[]> | DueDigestUser[]) => Promise<unknown>;
  sendEvent: (
    id: string,
    events: { name: string; data: Record<string, unknown> }[],
  ) => Promise<unknown>;
}

// The testable core, same split as workers/cron.ts's dispatchDueChannelSyncs.
export async function dispatchDueDigests(step: CronStepTools): Promise<{ dispatched: number }> {
  const dueUsers = (await step.run("find-due-digest-users", findDueDigestUsers)) as DueDigestUser[];

  if (dueUsers.length > 0) {
    await step.sendEvent(
      "dispatch-digest-events",
      dueUsers.map((user) => ({
        name: "digest/send.requested",
        data: { userId: user.userId, cadence: user.cadence },
      })),
    );
  }

  return { dispatched: dueUsers.length };
}

export const digestCron = inngest.createFunction(
  { id: "digest-cron", triggers: [{ cron: "0 * * * *" }] },
  async ({ step }) => dispatchDueDigests(step),
);

// PRD.md §7.2's weekly digest: "top outliers, top new videos, channel
// movement" -- channel movement isn't tracked anywhere yet (Phase 2 Task 2
// build plan), so this builds only the two lists real data exists for.
// windowDays: 1 for a daily cadence, 7 for weekly.
export async function buildDigestData(
  userId: string,
  cadence: DigestCadence,
): Promise<WeeklyDigestData> {
  const windowDays = cadence === "daily" ? 1 : 7;
  const since = new Date(Date.now() - windowDays * DAY_MS).toISOString();

  const supabase = createServiceClient();

  const { data: tracked, error: trackedError } = await supabase
    .from("tracked_channels")
    .select("channel_id")
    .eq("user_id", userId);
  if (trackedError) {
    throw new Error(`buildDigestData tracked_channels query failed: ${trackedError.message}`);
  }
  const channelIds = tracked.map((row) => row.channel_id);
  if (channelIds.length === 0) {
    return { cadence, topOutliers: [], newVideos: [] };
  }

  const [
    { data: outlierEvents, error: outlierEventsError },
    { data: newVideoRows, error: newVideosError },
  ] = await Promise.all([
    supabase
      .from("tracked_events")
      .select("*")
      .eq("event_type", "outlier_detected")
      .in("channel_id", channelIds)
      .gte("detected_at", since)
      .order("detected_at", { ascending: false })
      .limit(50),
    supabase
      .from("videos")
      .select("title, channel_id, published_at")
      .in("channel_id", channelIds)
      .gte("published_at", since)
      .order("published_at", { ascending: false })
      .limit(50),
  ]);

  if (outlierEventsError) {
    throw new Error(`buildDigestData outlier events query failed: ${outlierEventsError.message}`);
  }
  if (newVideosError) {
    throw new Error(`buildDigestData new videos query failed: ${newVideosError.message}`);
  }

  const outlierItems = await buildOutlierItems(supabase, outlierEvents ?? []);
  const topOutliers = outlierItems
    .sort((a, b) => b.outlierScore - a.outlierScore)
    .slice(0, DIGEST_ITEM_LIMIT)
    .map((item) => ({
      title: item.videoTitle,
      channelName: item.channelName,
      url: `${SITE_URL}/prompts?channelId=${item.channelId}&videoId=${item.videoId}`,
      viewCount: item.viewCount,
    }));

  const channelIdsForNewVideos = [...new Set((newVideoRows ?? []).map((row) => row.channel_id))];
  const { data: channels, error: channelsError } =
    channelIdsForNewVideos.length > 0
      ? await supabase.from("channels").select("id, name").in("id", channelIdsForNewVideos)
      : { data: [], error: null };
  if (channelsError) {
    throw new Error(`buildDigestData channels query failed: ${channelsError.message}`);
  }
  const channelNameById = new Map((channels ?? []).map((channel) => [channel.id, channel.name]));

  const newVideos = (newVideoRows ?? []).slice(0, DIGEST_ITEM_LIMIT).map((video) => ({
    title: video.title,
    channelName: channelNameById.get(video.channel_id) ?? "Unknown channel",
    url: `${SITE_URL}/tracking/${video.channel_id}`,
  }));

  return { cadence, topOutliers, newVideos };
}

// The testable core for the event-driven half: build this one user's
// digest and send it. Returns false (not thrown) for "nothing to send" --
// find_due_digest_user_ids' own EXISTS filter should already exclude
// users with no tracked channels, so an empty digest here is defensive,
// not expected.
export async function sendDigestForUser(userId: string, cadence: DigestCadence): Promise<boolean> {
  // Checked at SEND time, not just when the preference was saved: someone
  // who turned digests on while on Pro and later moved to Starter must stop
  // getting them. Their saved preference stays as-is, so the digest
  // resumes by itself if they upgrade again. Effective plan, so a Team
  // workspace member counts (D-059).
  const plan = await getEffectivePlan(userId);
  if (!isEmailEligibleTier(plan.tier)) return false;

  const data = await buildDigestData(userId, cadence);
  if (data.topOutliers.length === 0 && data.newVideos.length === 0) {
    return false;
  }
  return sendWeeklyDigestEmail(userId, data);
}

const DigestSendRequestedSchema = z.object({
  userId: z.string().uuid(),
  cadence: z.enum(["daily", "weekly"]),
});

export const digestSendFunction = inngest.createFunction(
  {
    id: "digest-send",
    // One digest per user per dispatch window, same reasoning as
    // channel-sync's per-channel idempotency.
    idempotency: "event.data.userId",
    triggers: [{ event: "digest/send.requested" }],
  },
  async ({ event }) => {
    const { userId, cadence } = DigestSendRequestedSchema.parse(event.data);
    const sent = await sendDigestForUser(userId, cadence);
    return { userId, cadence, sent };
  },
);
