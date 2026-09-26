import {
  DAY_MS,
  HOT_CHANNEL_AGE_MONTHS,
  HOT_OUTLIER_WINDOW_DAYS,
  LOW_COMPETITION_MIN_SCORE,
  MEDIUM_COMPETITION_MIN_SCORE,
  MIN_AVG_VIEWS,
  MIN_PERFORMING_CHANNELS,
  QUALIFY_MAX_CHANNEL_AGE_MONTHS,
  QUALIFY_OUTLIER_WINDOW_DAYS,
  RISING_MOMENTUM_SHARE,
  SATURATED_MAX_SCORE,
  SATURATED_SUPPLY_PERCENTILE,
  SCORE_WEIGHTS,
  TREND_STATUS_DELTA,
  type RefreshTier,
  type SignalName,
} from "@/lib/discovery/config";

// Niche-Discovery-Engine.md §8 (D-071). Pure and dependency-free so the
// snapshot job, the feed and the tests all share one implementation.

/** Raw per-niche aggregates, as returned by niche_signal_inputs(). */
export interface NicheSignalInputs {
  nicheId: string;
  channelCount: number;
  performingCount: number;
  smallPerformingCount: number;
  newPerformingCount: number;
  newChannels30d: number;
  medianViews90d: number | null;
  recentVideoCount: number;
  outlierVideoCount: number;
  uploads30d: number;
}

export type RawSignals = Record<SignalName, number>;

export function rawSignals(input: NicheSignalInputs): RawSignals {
  const performing = input.performingCount;
  return {
    accessibility: performing > 0 ? input.smallPerformingCount / performing : 0,
    demand: input.medianViews90d ?? 0,
    momentum: performing > 0 ? input.newPerformingCount / performing : 0,
    outlierDensity:
      input.recentVideoCount > 0 ? input.outlierVideoCount / input.recentVideoCount : 0,
    supply: input.uploads30d,
  };
}

// Percentile rank in [0, 1] of `value` within `population` (mid-rank for
// ties). A lone niche ranks 0.5 -- there's nothing to beat or lose to.
export function percentileRank(value: number, population: number[]): number {
  if (population.length <= 1) return 0.5;
  let below = 0;
  let equal = 0;
  for (const other of population) {
    if (other < value) below += 1;
    else if (other === value) equal += 1;
  }
  return (below + (equal - 1) / 2) / (population.length - 1);
}

export type CompetitionLabel = "low" | "medium" | "high";

export function competitionLabel(score: number): CompetitionLabel {
  if (score >= LOW_COMPETITION_MIN_SCORE) return "low";
  if (score >= MEDIUM_COMPETITION_MIN_SCORE) return "medium";
  return "high";
}

export interface ScoredNiche {
  nicheId: string;
  score: number;
  raw: RawSignals;
  /** Normalised 0-1 signal (supply already inverted: 1 = least supply). */
  normalized: RawSignals;
  /** Points each signal contributed to the score. */
  contributions: RawSignals;
}

export function isScorable(input: NicheSignalInputs): boolean {
  return input.performingCount >= MIN_PERFORMING_CHANNELS;
}

// Scores every scorable niche against the others. Unscorable niches (too
// few performing channels) are dropped -- the feed hides them (spec §8).
export function scoreNiches(inputs: NicheSignalInputs[]): ScoredNiche[] {
  const scorable = inputs.filter(isScorable);
  const raws = scorable.map(rawSignals);
  const names = Object.keys(SCORE_WEIGHTS) as SignalName[];
  const populations = Object.fromEntries(
    names.map((name) => [name, raws.map((raw) => raw[name])]),
  ) as Record<SignalName, number[]>;

  return scorable.map((input, index) => {
    const raw = raws[index]!;
    const normalized = {} as RawSignals;
    const contributions = {} as RawSignals;
    let total = 0;
    for (const name of names) {
      const rank = percentileRank(raw[name], populations[name]);
      normalized[name] = name === "supply" ? 1 - rank : rank;
      contributions[name] = normalized[name] * SCORE_WEIGHTS[name];
      total += contributions[name];
    }
    return {
      nicheId: input.nicheId,
      score: Math.max(0, Math.min(100, Math.round(total))),
      raw,
      normalized,
      contributions,
    };
  });
}

export type NicheStatus = "active" | "rising" | "saturated" | "declining";

export function nicheStatus(scored: ScoredNiche, trend: number | null): NicheStatus {
  if (
    (trend !== null && trend >= TREND_STATUS_DELTA) ||
    scored.raw.momentum >= RISING_MOMENTUM_SHARE
  )
    return "rising";
  if (trend !== null && trend <= -TREND_STATUS_DELTA) return "declining";
  if (
    scored.score < SATURATED_MAX_SCORE &&
    1 - scored.normalized.supply >= SATURATED_SUPPLY_PERCENTILE
  )
    return "saturated";
  return "active";
}

export interface WhyChipInput {
  raw: RawSignals;
  contributions: RawSignals;
  performingCount: number;
  newPerformingCount: number;
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(Math.round(value));
}

function chipFor(name: SignalName, input: WhyChipInput): string {
  switch (name) {
    case "accessibility":
      return `${Math.round(input.raw.accessibility * 100)}% small channels ranking`;
    case "demand":
      return `${formatCompact(input.raw.demand)} median views`;
    case "momentum":
      return input.newPerformingCount === 1
        ? "1 new channel breaking out"
        : `${input.newPerformingCount} new channels breaking out`;
    case "outlierDensity":
      return `${Math.round(input.raw.outlierDensity * 100)}% of videos are 3x outliers`;
    case "supply":
      return `Only ${formatCompact(input.raw.supply)} uploads this month`;
  }
}

// Spec §8: the two signals that contributed the most points.
export function whyChips(input: WhyChipInput): string[] {
  const ranked = (Object.keys(input.contributions) as SignalName[])
    .filter((name) => input.contributions[name] > 0)
    .sort((a, b) => input.contributions[b] - input.contributions[a]);
  return ranked.slice(0, 2).map((name) => chipFor(name, input));
}

// --- Channel-level ---------------------------------------------------------

// Spec §8: avg recent views / subscribers, shown as "4.7x". Null when the
// channel hides its subscriber count (reported as 0).
export function channelOutlierScore(
  avgViewsRecent: number,
  subscriberCount: number,
): number | null {
  if (subscriberCount <= 0) return null;
  return avgViewsRecent / subscriberCount;
}

function monthsAgo(months: number, now: number): number {
  const date = new Date(now);
  date.setUTCMonth(date.getUTCMonth() - months);
  return date.getTime();
}

export interface QualificationInput {
  youtubeCreatedAt: string;
  avgViewsRecent: number;
  /** Publish dates of videos at >= QUALIFY_OUTLIER_MULTIPLE. */
  outlierPublishedAt: string[];
}

// Spec §6.2: (created within 12 months OR a >= 3x video in the last 30
// days) AND avg recent views >= 5,000.
export function qualifies(input: QualificationInput, now: number = Date.now()): boolean {
  if (input.avgViewsRecent < MIN_AVG_VIEWS) return false;
  const isNew =
    new Date(input.youtubeCreatedAt).getTime() >= monthsAgo(QUALIFY_MAX_CHANNEL_AGE_MONTHS, now);
  const cutoff = now - QUALIFY_OUTLIER_WINDOW_DAYS * DAY_MS;
  const recentOutlier = input.outlierPublishedAt.some((iso) => new Date(iso).getTime() >= cutoff);
  return isNew || recentOutlier;
}

export interface TierInput {
  isTracked: boolean;
  youtubeCreatedAt: string;
  qualifies: boolean;
  /** Publish dates of videos at >= QUALIFY_OUTLIER_MULTIPLE. */
  outlierPublishedAt: string[];
}

// Spec §6.1.
export function refreshTier(input: TierInput, now: number = Date.now()): RefreshTier {
  const recentOutlierCutoff = now - HOT_OUTLIER_WINDOW_DAYS * DAY_MS;
  const hot =
    input.isTracked ||
    input.outlierPublishedAt.some((iso) => new Date(iso).getTime() >= recentOutlierCutoff) ||
    new Date(input.youtubeCreatedAt).getTime() >= monthsAgo(HOT_CHANNEL_AGE_MONTHS, now);
  if (hot) return "hot";
  return input.qualifies ? "warm" : "cold";
}
