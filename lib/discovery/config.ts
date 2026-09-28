// Niche-Discovery-Engine.md §6 / §8, D-071. Every tunable of the Discovery
// Engine lives here so beta tuning is a one-file change. SQL functions take
// these as parameters instead of hard-coding them.

import { OUTLIER_THRESHOLD_MULTIPLIER } from "@/lib/outliers/scoring";

export const DAY_MS = 24 * 60 * 60 * 1000;

// --- Scoring (spec §8) ---------------------------------------------------
export const SCORE_WEIGHTS = {
  accessibility: 30,
  demand: 25,
  momentum: 20,
  outlierDensity: 15,
  supply: 10,
} as const;
export type SignalName = keyof typeof SCORE_WEIGHTS;

export const LOW_COMPETITION_MIN_SCORE = 80;
export const MEDIUM_COMPETITION_MIN_SCORE = 50;
// A niche with fewer performing channels than this gets no score at all.
export const MIN_PERFORMING_CHANNELS = 3;
export const SMALL_CHANNEL_SUBS = 10_000;
export const NEW_CHANNEL_MONTHS = 12;
export const TREND_WINDOW_DAYS = 7;
export const TREND_STATUS_DELTA = 10;
export const RISING_MOMENTUM_SHARE = 0.5;
export const SATURATED_MAX_SCORE = 35;
export const SATURATED_SUPPLY_PERCENTILE = 0.8;

// --- Qualification (spec §6.2) ---------------------------------------------
export const QUALIFY_MAX_CHANNEL_AGE_MONTHS = 12;
export const QUALIFY_OUTLIER_WINDOW_DAYS = 30;
// Same 3x rule as tracked outliers and the free Outlier Checker (D-054).
export const QUALIFY_OUTLIER_MULTIPLE = OUTLIER_THRESHOLD_MULTIPLIER;
export const OUTLIER_FEED_MIN_MULTIPLE = OUTLIER_THRESHOLD_MULTIPLIER;
export const MIN_AVG_VIEWS = 5_000;
// Cheap pre-filter at discovery time (lifetime views / videos), before we
// spend units on a channel's uploads. Looser than MIN_AVG_VIEWS on purpose:
// an older channel with one recent breakout can have a low lifetime average.
export const DISCOVERY_PREFILTER_MIN_LIFETIME_AVG_VIEWS = 2_500;
// "Likely monetized (est.)" heuristic -- YouTube doesn't expose monetization.
// YPP needs 1,000 subs + 4,000 watch hours; total views stands in for the
// latter. Always shown labelled as an estimate.
export const LIKELY_MONETIZED_MIN_SUBS = 1_000;
export const LIKELY_MONETIZED_MIN_TOTAL_VIEWS = 200_000;
// YouTube Shorts can run up to 3 minutes (since Oct 2024), D-077.
export const SHORTS_MAX_SECONDS = 180;

// D-077 content type from the recent uploads' Shorts share.
export const CONTENT_TYPE_SHORTS_MIN_SHARE = 0.8;
export const CONTENT_TYPE_LONG_MAX_SHARE = 0.2;
// "Views on uploads from the last N days" on the channel card.
export const RECENT_UPLOAD_VIEWS_DAYS = 30;

// --- Refresh tiers (spec §6.1) ---------------------------------------------
export const TIER_INTERVAL_DAYS = { hot: 2, warm: 7, cold: 25 } as const;
export type RefreshTier = keyof typeof TIER_INTERVAL_DAYS;
export const HOT_OUTLIER_WINDOW_DAYS = 14;
export const HOT_CHANNEL_AGE_MONTHS = 6;

// --- Crawl sizes -----------------------------------------------------------
// D-078: searches may use at most half the discovery budget (search.list
// is 100 units); the rest is kept for storing what they find (channels.list
// at ingest) and first enrichment (~81 units per 50 channels), which bill
// the same budget.
export const SEEDS_PER_RUN_MAX = 30;
export const SEARCH_COST_UNITS = 100;
export const DISCOVERY_SEARCH_BUDGET_SHARE = 0.5;

// D-079: search variants cycle over a run's seeds in this order. 4 of 6
// bias to English (relevanceLanguage ranks, it doesn't exclude); 3 of 6
// ask for medium (4-20 min) or long (>20 min) uploads, since unrestricted
// searches came back ~85% Shorts.
export interface SearchVariant {
  relevanceLanguage?: "en";
  videoDuration?: "medium" | "long";
}
const SEARCH_VARIANT_CYCLE: SearchVariant[] = [
  { relevanceLanguage: "en" },
  { relevanceLanguage: "en", videoDuration: "medium" },
  {},
  { relevanceLanguage: "en", videoDuration: "long" },
  { relevanceLanguage: "en", videoDuration: "medium" },
  {},
];

export function searchVariant(seedIndex: number): SearchVariant {
  return SEARCH_VARIANT_CYCLE[seedIndex % SEARCH_VARIANT_CYCLE.length]!;
}

// Seeds today's run can afford: the search share of the discovery budget,
// less what the discovery job (searches + ingest) already spent today.
export function affordableSeeds(discoveryBudget: number, discoveryJobUsed: number): number {
  const cap = Math.floor(discoveryBudget * DISCOVERY_SEARCH_BUDGET_SHARE);
  const seeds = Math.floor((cap - discoveryJobUsed) / SEARCH_COST_UNITS);
  return Math.max(0, Math.min(SEEDS_PER_RUN_MAX, seeds));
}
export const DISCOVERY_PUBLISHED_WITHIN_DAYS = 7;
export const VIDEOS_KEPT_PER_CHANNEL = 30;
export const ENRICHMENT_BATCH_SIZE = 50;
// Batches dispatched per enrichment-cron tick (every 2h -> 12 ticks/day).
export const ENRICHMENT_BATCHES_PER_TICK = 4;
export const CLASSIFY_BATCH_SIZE = 20;
export const CLASSIFY_BATCHES_PER_RUN = 25;
export const CLASSIFY_STALE_DAYS = 30;
export const EXPANSION_SEEDS_PER_DAY = 20;
export const USER_SEARCH_SEED_PRIORITY = 5;
export const EXPANSION_SEED_PRIORITY = 8;

// --- Niche matching (D-074) ------------------------------------------------
export const NICHE_MATCH_MIN_SIMILARITY = 0.85;
// A niche slug can't shadow a static route under /niches (today:
// /niches/channels/[id]). tests/lib/discovery/reserved-slugs.test.ts fails
// if a new static folder appears under app/(app)/niches without being
// listed here (and in the niches.slug check in SQL).
export const RESERVED_NICHE_SLUGS = ["channels"] as const;
export const NICHE_SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Whether a URL segment could be a niche page at all -- checked before any
// query, so /niches/<reserved or junk> 404s cheaply.
export function isValidNicheSlug(slug: string): boolean {
  return (
    slug.length <= 80 &&
    NICHE_SLUG_PATTERN.test(slug) &&
    !(RESERVED_NICHE_SLUGS as readonly string[]).includes(slug)
  );
}

// --- Retention (D-073) -----------------------------------------------------
// The 30-day window itself is main's YOUTUBE_DATA_MAX_AGE_DAYS
// (lib/youtube/retention.ts); this is only how long daily snapshots stay
// daily before the purge rolls them up to weekly.
export const SNAPSHOT_DAILY_RETENTION_DAYS = 90;

// D-077: per-channel total-views readings (channel_view_snapshots). Kept
// this many days back from today (so today + 30 dated rows), inside the
// 30-day YouTube data limit; enough for a true 30-day views difference.
export const CHANNEL_VIEW_SNAPSHOT_DAYS = 30;

// D-077: a channel carries up to this many niche tags (primary + extras);
// an extra niche needs at least this confidence. Scores count the primary.
export const MAX_NICHES_PER_CHANNEL = 3;
export const SECONDARY_NICHE_MIN_CONFIDENCE = 0.6;

// D-077 channel-card insight chips (lib/discovery/insights.ts).
export const BREAKOUT_WINDOW_DAYS = 30;
export const CONSISTENT_UPLOAD_WEEKS = 4;
export const ENGAGED_MIN_RATE = 0.04;
export const ENGAGED_MIN_VIDEOS = 3;
// "Views (30 days)" switches to a true difference once a reading this old exists.
export const TRUE_VIEWS_MIN_READING_AGE_DAYS = 28;

// --- Browse (D-072) --------------------------------------------------------
export const CAPPED_PLAN_NICHE_LIMIT = 50;
export const FEED_PAGE_SIZE = 24;
