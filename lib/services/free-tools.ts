import { Ratelimit } from "@upstash/ratelimit";

import { getRedis } from "@/lib/cache/redis";
import { evaluateAgainstChannel, OUTLIER_THRESHOLD_MULTIPLIER } from "@/lib/outliers/scoring";
import { err, ok, type Result } from "@/lib/result";
import { getChannelById, getChannelVideos, getVideoById, resolveChannelUrl } from "@/lib/youtube";
import { FREE_TOOLS_QUOTA_CUTOFF, getQuotaUsedToday } from "@/lib/youtube/quota";
import { parseChannelInput, parseVideoInput } from "@/lib/youtube/urls";

// D-014 / D-054: the server-backed free tools (channel lookup, outlier
// check). Anonymous: no session is ever read, no credits are spent.
// Two protections run before any YouTube call:
//   1. quota guard -- above 70% of the day's quota the tools say "busy",
//      so the rest is kept for signed-in users;
//   2. one shared per-IP bucket: 10/hour and 30/day, cache hits included.

export type FreeToolError =
  | { type: "invalid_input" }
  | { type: "busy" }
  | { type: "rate_limited" }
  | { type: "not_found" }
  | { type: "too_old" }
  | { type: "not_enough_history" }
  | { type: "failed" };

// lib/youtube fetches a channel's 50 most recent uploads.
const UPLOADS_FETCHED = 50;

let limiters: { hour: Ratelimit; day: Ratelimit } | undefined;
function getLimiters() {
  limiters ??= {
    hour: new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      prefix: "ratelimit:free_tools:hour",
    }),
    day: new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(30, "1 d"),
      prefix: "ratelimit:free_tools:day",
    }),
  };
  return limiters;
}

// Quota first: when the tools are busy, a visitor's allowance isn't spent.
export async function guardFreeTool(ip: string): Promise<Result<void, FreeToolError>> {
  if ((await getQuotaUsedToday()) >= FREE_TOOLS_QUOTA_CUTOFF) return err({ type: "busy" });
  const { hour, day } = getLimiters();
  const [hourly, daily] = await Promise.all([hour.limit(ip), day.limit(ip)]);
  if (!hourly.success || !daily.success) return err({ type: "rate_limited" });
  return ok(undefined);
}

function fromYouTubeError(error: { type: string }): FreeToolError {
  if (error.type === "quota_exceeded") return { type: "busy" };
  if (error.type === "not_found") return { type: "not_found" };
  return { type: "failed" };
}

export interface ChannelLookup {
  channelId: string;
  title?: string;
}

// Channel IDs need no lookup at all (the client usually handles them
// before calling); only @handles cost anything, and those are cached.
export async function lookupChannel(
  input: string,
  ip: string,
): Promise<Result<ChannelLookup, FreeToolError>> {
  const parsed = parseChannelInput(input);
  if (!parsed) return err({ type: "invalid_input" });
  if (parsed.kind === "id") return ok({ channelId: parsed.id });

  const guard = await guardFreeTool(ip);
  if (!guard.ok) return guard;

  const resolved = await resolveChannelUrl(`@${parsed.handle}`);
  if (!resolved.ok) return err(fromYouTubeError(resolved.error));

  // resolveChannelUrl just cached the channel, so this costs nothing.
  const channel = await getChannelById(resolved.value);
  return ok({
    channelId: resolved.value,
    title: channel.ok ? channel.value.snippet?.title : undefined,
  });
}

export interface OutlierCheck {
  video: { id: string; title: string; channelTitle?: string; publishedAt: string };
  views: number;
  baseline: number;
  multiplier: number | null;
  isOutlier: boolean;
  threshold: number;
}

export async function checkOutlier(
  input: string,
  ip: string,
): Promise<Result<OutlierCheck, FreeToolError>> {
  const parsed = parseVideoInput(input);
  if (!parsed) return err({ type: "invalid_input" });

  const guard = await guardFreeTool(ip);
  if (!guard.ok) return guard;

  const video = await getVideoById(parsed.id);
  if (!video.ok) {
    return err(
      video.error.type === "api_error" ? { type: "not_found" } : fromYouTubeError(video.error),
    );
  }

  const uploads = await getChannelVideos(video.value.snippet.channelId);
  if (!uploads.ok) return err(fromYouTubeError(uploads.error));

  const toScored = (item: typeof video.value) => ({
    id: item.id,
    viewCount: item.statistics?.viewCount ?? 0,
    publishedAt: item.snippet.publishedAt,
  });
  // The same rule the app's outlier detection uses (lib/outliers/scoring).
  const evaluation = evaluateAgainstChannel(toScored(video.value), uploads.value.map(toScored));

  if (evaluation.baseline === null) {
    // With the full 50 uploads fetched, the channel has more history than
    // we can see, so the video is simply older than our window.
    return err({
      type: uploads.value.length >= UPLOADS_FETCHED ? "too_old" : "not_enough_history",
    });
  }

  return ok({
    video: {
      id: video.value.id,
      title: video.value.snippet.title,
      channelTitle: video.value.snippet.channelTitle,
      publishedAt: video.value.snippet.publishedAt,
    },
    views: evaluation.views,
    baseline: evaluation.baseline,
    multiplier: evaluation.multiplier,
    isOutlier: evaluation.isOutlier,
    threshold: OUTLIER_THRESHOLD_MULTIPLIER,
  });
}
