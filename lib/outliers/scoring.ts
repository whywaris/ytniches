// PRD.md §7.1 / Phase 2 Task 1 plan (2026-09-22 approval). Pure, dependency-
// free scoring so workers/channel-sync.ts (detection) and
// lib/services/outliers.ts (ranking, Phase OB) share one implementation
// instead of two approximations of the same formula.

// Gap 2: "dramatically over-perform" -- 3x baseline is the detection cutoff.
export const OUTLIER_THRESHOLD_MULTIPLIER = 3;

// Gap 3: rolling baseline = trailing average of a channel's previous 10
// videos by publish date; fewer than 5 prior videos means not enough
// history to trust a baseline yet (cold start).
export const BASELINE_WINDOW = 10;
export const BASELINE_MIN_VIDEOS = 5;

// Gap 4: linear decay to a floor over 90 days, so old outliers fade from
// ranking but never fully disappear from historical Grid views.
export const RECENCY_DECAY_DAYS = 90;
export const RECENCY_FLOOR = 0.1;

const DAY_MS = 24 * 60 * 60 * 1000;

export function computeRecencyWeight(publishedAt: string, now: number = Date.now()): number {
  const daysSince = (now - new Date(publishedAt).getTime()) / DAY_MS;
  return Math.min(1, Math.max(RECENCY_FLOOR, 1 - daysSince / RECENCY_DECAY_DAYS));
}

export const OUTLIER_SCORE = (views: number, baseline: number, recencyWeight: number): number =>
  (views / baseline) * recencyWeight;

export interface BaselineVideo {
  viewCount: number;
  publishedAt: string;
}

// Trailing average of the BASELINE_WINDOW most-recent entries in
// `priorVideos` (videos published strictly before the candidate -- callers
// filter that before calling in). Returns null below BASELINE_MIN_VIDEOS:
// too little history to flag anything yet, not a baseline of 0 (which
// would make every early video an "infinite x" false outlier).
export function computeBaseline(priorVideos: BaselineVideo[]): number | null {
  if (priorVideos.length < BASELINE_MIN_VIDEOS) return null;

  const window = [...priorVideos]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, BASELINE_WINDOW);

  return window.reduce((sum, video) => sum + video.viewCount, 0) / window.length;
}

export interface ChannelVideo extends BaselineVideo {
  id: string;
}

export interface OutlierEvaluation {
  views: number;
  // null = fewer than BASELINE_MIN_VIDEOS earlier uploads (cold start).
  baseline: number | null;
  // views / baseline; null when there's no baseline or it's 0.
  multiplier: number | null;
  isOutlier: boolean;
}

// One video against its own channel: the baseline comes from the channel's
// uploads published strictly before it. Shared by the channel-sync worker
// and the free Outlier Checker so both judge a video the same way.
export function evaluateAgainstChannel(
  candidate: ChannelVideo,
  channelVideos: ChannelVideo[],
): OutlierEvaluation {
  const publishedAtMs = new Date(candidate.publishedAt).getTime();
  const priorVideos = channelVideos.filter(
    (other) => other.id !== candidate.id && new Date(other.publishedAt).getTime() < publishedAtMs,
  );
  const baseline = computeBaseline(priorVideos);
  const views = candidate.viewCount;
  if (baseline === null) return { views, baseline, multiplier: null, isOutlier: false };
  return {
    views,
    baseline,
    multiplier: baseline > 0 ? views / baseline : null,
    isOutlier: views >= baseline * OUTLIER_THRESHOLD_MULTIPLIER,
  };
}
