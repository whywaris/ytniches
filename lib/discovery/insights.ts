import {
  BREAKOUT_WINDOW_DAYS,
  CONSISTENT_UPLOAD_WEEKS,
  DAY_MS,
  ENGAGED_MIN_RATE,
  ENGAGED_MIN_VIDEOS,
  NEW_CHANNEL_MONTHS,
} from "@/lib/discovery/config";
import { OUTLIER_THRESHOLD_MULTIPLIER } from "@/lib/outliers/scoring";

// D-077: the channel card's insight chips. Real data only, each rule stated
// in its tooltip (hint), no revenue or profitability claims. Pure, so the
// rules are unit-tested and the card only renders what this returns.

export interface InsightVideo {
  publishedAt: string;
  viewCount: number;
  likeCount: number | null;
  commentCount: number | null;
  outlierMultiple: number | null;
}

export interface InsightInput {
  youtubeCreatedAt: string;
  firstUploadAt: string | null;
  isFaceless: boolean | null;
  recentVideos: InsightVideo[];
}

export type InsightId = "breakout" | "new" | "consistent" | "engaged" | "faceless";

export interface Insight {
  id: InsightId;
  label: string;
  hint: string;
}

const HINTS: Record<InsightId, Omit<Insight, "id">> = {
  breakout: {
    label: "Breakout",
    hint: `An upload reached ${OUTLIER_THRESHOLD_MULTIPLIER}× the channel's usual views in the last ${BREAKOUT_WINDOW_DAYS} days.`,
  },
  new: {
    label: "New channel",
    hint: `First upload within the last ${NEW_CHANNEL_MONTHS} months.`,
  },
  consistent: {
    label: "Consistent uploads",
    hint: `At least one upload in each of the last ${CONSISTENT_UPLOAD_WEEKS} weeks.`,
  },
  engaged: {
    label: "Engaged audience",
    hint: `On recent uploads, likes plus comments are typically at least ${ENGAGED_MIN_RATE * 100}% of views.`,
  },
  faceless: {
    label: "Faceless (est.)",
    hint: "Our AI's estimate from titles and descriptions that the creator doesn't appear on camera.",
  },
};

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

function monthsAgo(now: number, months: number): number {
  const date = new Date(now);
  date.setUTCMonth(date.getUTCMonth() - months);
  return date.getTime();
}

export function channelInsights(input: InsightInput, now: number = Date.now()): Insight[] {
  const ids: InsightId[] = [];
  const time = (iso: string) => new Date(iso).getTime();

  const breakoutSince = now - BREAKOUT_WINDOW_DAYS * DAY_MS;
  if (
    input.recentVideos.some(
      (video) =>
        video.outlierMultiple !== null &&
        video.outlierMultiple >= OUTLIER_THRESHOLD_MULTIPLIER &&
        time(video.publishedAt) >= breakoutSince,
    )
  )
    ids.push("breakout");

  const started = input.firstUploadAt ?? input.youtubeCreatedAt;
  if (time(started) >= monthsAgo(now, NEW_CHANNEL_MONTHS)) ids.push("new");

  const weeks = Array.from({ length: CONSISTENT_UPLOAD_WEEKS }, (_, week) => [
    now - (week + 1) * 7 * DAY_MS,
    now - week * 7 * DAY_MS,
  ]);
  if (
    weeks.every(([from, to]) =>
      input.recentVideos.some(
        (video) => time(video.publishedAt) > from! && time(video.publishedAt) <= to!,
      ),
    )
  )
    ids.push("consistent");

  const rates = input.recentVideos
    .filter((video) => video.viewCount > 0 && video.likeCount !== null)
    .map((video) => ((video.likeCount ?? 0) + (video.commentCount ?? 0)) / video.viewCount);
  const typicalRate = rates.length >= ENGAGED_MIN_VIDEOS ? median(rates) : null;
  if (typicalRate !== null && typicalRate >= ENGAGED_MIN_RATE) ids.push("engaged");

  if (input.isFaceless === true) ids.push("faceless");

  return ids.map((id) => ({ id, ...HINTS[id] }));
}

// "20×": typical views per video over subscribers. Null when either is unknown.
export function viewsToSubsRatio(typicalViews: number | null, subscribers: number): number | null {
  if (typicalViews === null || subscribers <= 0) return null;
  return typicalViews / subscribers;
}
