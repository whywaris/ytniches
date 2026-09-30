import {
  BREAKOUT_MIN_MULTIPLE,
  BREAKOUT_WINDOW_DAYS,
  CONSISTENT_UPLOAD_WEEKS,
  DAY_MS,
  ENGAGED_MIN_RATE,
  ENGAGED_MIN_VIDEOS,
  NEW_CHANNEL_MONTHS,
} from "@/lib/discovery/config";

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

const HINTS: Record<Exclude<InsightId, "breakout">, Omit<Insight, "id">> = {
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
  // Breakout's label and hint carry the channel's own multiple; see below.
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
  const insights: Insight[] = [];
  const ids: Exclude<InsightId, "breakout">[] = [];
  const time = (iso: string) => new Date(iso).getTime();

  // D-080: 10× or more, labelled with the best multiple ("Breakout 29×").
  const breakoutSince = now - BREAKOUT_WINDOW_DAYS * DAY_MS;
  const best = Math.max(
    0,
    ...input.recentVideos
      .filter((video) => time(video.publishedAt) >= breakoutSince)
      .map((video) => video.outlierMultiple ?? 0),
  );
  if (best >= BREAKOUT_MIN_MULTIPLE) {
    const multiple = `${Math.floor(best)}×`;
    insights.push({
      id: "breakout",
      label: `Breakout ${multiple}`,
      hint: `An upload reached ${multiple} the channel's usual views in the last ${BREAKOUT_WINDOW_DAYS} days (a breakout is ${BREAKOUT_MIN_MULTIPLE}× or more).`,
    });
  }

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

  // D-080: a channel hiding likes on any recent upload gets no Engaged
  // chip -- the visible remainder isn't a fair read of its audience.
  const watched = input.recentVideos.filter((video) => video.viewCount > 0);
  const likesHidden = watched.some((video) => video.likeCount === null);
  const rates = watched.map(
    (video) => ((video.likeCount ?? 0) + (video.commentCount ?? 0)) / video.viewCount,
  );
  const typicalRate = !likesHidden && rates.length >= ENGAGED_MIN_VIDEOS ? median(rates) : null;
  if (typicalRate !== null && typicalRate >= ENGAGED_MIN_RATE) ids.push("engaged");

  if (input.isFaceless === true) ids.push("faceless");

  return [...insights, ...ids.map((id) => ({ id, ...HINTS[id] }))];
}

// "20×": typical views per video over subscribers. Null when either is unknown.
export function viewsToSubsRatio(typicalViews: number | null, subscribers: number): number | null {
  if (typicalViews === null || subscribers <= 0) return null;
  return typicalViews / subscribers;
}
