import { z } from "zod";

import { SMALL_CHANNEL_SUBS } from "@/lib/discovery/config";
import {
  CHANNEL_AGE_MONTHS,
  CHANNEL_PRESETS,
  CONTENT_TYPES,
  SCORE_BANDS,
  TREND_TO_STATUS,
  type ChannelAge,
  type ChannelPresetId,
} from "@/lib/discovery/feed-filters";
import type {
  ChannelFeedFilters,
  NicheFeedFilters,
  OutlierFeedFilters,
} from "@/lib/services/niche-feed";

// Niche-Discovery-Engine.md §9.4: every feed filter lives in the URL so a
// view is shareable (Application-Flow.md §2.5). Parsing is lenient: a bad
// or hand-edited param is dropped, never an error page. Plain module (no
// "use client") so the server page and the client filter panels share it.

// D-077: Channels first and the default (niche scores need weeks of data).
export const FEED_TABS = ["channels", "niches", "outliers", "search"] as const;
export const DEFAULT_FEED_TAB = "channels" satisfies (typeof FEED_TABS)[number];
export type FeedTab = (typeof FEED_TABS)[number];

export type SearchParams = Record<string, string | string[] | undefined>;

function first(params: SearchParams, key: string): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function pick<T>(schema: z.ZodType<T>, value: string | undefined): T | undefined {
  if (value === undefined || value === "") return undefined;
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

const count = z.coerce.number().int().min(0).max(10_000_000_000);
const page = z.coerce.number().int().min(1).max(500);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const slug = z.string().regex(/^[a-z0-9-]{1,80}$/);
const flag = z.literal("1").transform(() => true);

export function parseTab(params: SearchParams): FeedTab | undefined {
  return pick(z.enum(FEED_TABS), first(params, "tab"));
}

const TREND_KEYS = Object.keys(TREND_TO_STATUS) as (keyof typeof TREND_TO_STATUS)[];

export function parseNicheFilters(params: SearchParams): NicheFeedFilters {
  // D-077: score chips (70+ Hot / 50-69 Good) and a named Trend.
  const band = pick(z.enum(["hot", "good"]), first(params, "score"));
  const trend = pick(z.enum(TREND_KEYS as [string, ...string[]]), first(params, "trend"));
  return {
    minScore: band ? SCORE_BANDS[band].min : undefined,
    maxScore: band === "good" ? SCORE_BANDS.good.max : undefined,
    status: trend ? TREND_TO_STATUS[trend as keyof typeof TREND_TO_STATUS] : undefined,
    sort: pick(z.enum(["score", "trend", "newest"]), first(params, "sort")) ?? "score",
    page: pick(page, first(params, "page")) ?? 1,
  };
}

const PRESET_IDS = CHANNEL_PRESETS.map((preset) => preset.id) as [
  ChannelPresetId,
  ...ChannelPresetId[],
];

// The filters behind each free preset (D-077).
function presetFilters(preset: ChannelPresetId): Partial<ChannelFeedFilters> {
  switch (preset) {
    case "new-faceless":
      return { maxAgeMonths: CHANNEL_AGE_MONTHS["12m"], faceless: true };
    case "small-breakout":
      return { maxSubs: SMALL_CHANNEL_SUBS, breakout: true };
    case "rising":
      return { risingNiche: true };
  }
}

export function parseChannelFilters(params: SearchParams): ChannelFeedFilters {
  const sort =
    pick(z.enum(["outlier_score", "avg_views", "newest", "subscribers"]), first(params, "sort")) ??
    "outlier_score";
  const pageNumber = pick(page, first(params, "page")) ?? 1;
  // A preset is a whole filter set on its own: other params are ignored.
  const preset = pick(z.enum(PRESET_IDS), first(params, "preset"));
  if (preset) return { ...presetFilters(preset), preset, sort, page: pageNumber };

  const age = pick(
    z.enum(Object.keys(CHANNEL_AGE_MONTHS) as [ChannelAge, ...ChannelAge[]]),
    first(params, "age"),
  );
  return {
    q: pick(z.string().trim().min(1).max(80), first(params, "q")),
    maxAgeMonths: age ? CHANNEL_AGE_MONTHS[age] : undefined,
    country: pick(z.string().regex(/^[A-Z]{2}$/), first(params, "country")),
    contentType: pick(z.enum(CONTENT_TYPES), first(params, "content")),
    niche: pick(slug, first(params, "niche")),
    createdAfter: pick(date, first(params, "after")),
    createdBefore: pick(date, first(params, "before")),
    minSubs: pick(count, first(params, "minSubs")),
    maxSubs: pick(count, first(params, "maxSubs")),
    minAvgViews: pick(count, first(params, "minViews")),
    maxAvgViews: pick(count, first(params, "maxViews")),
    minOutlierScore: pick(z.coerce.number().min(0).max(1_000), first(params, "minOutlier")),
    faceless: pick(flag, first(params, "faceless")),
    excludeKids: pick(flag, first(params, "noKids")),
    likelyMonetized: pick(flag, first(params, "monetized")),
    language: pick(z.string().regex(/^[a-z]{2}$/), first(params, "lang")),
    sort,
    page: pageNumber,
  };
}

// D-077: Pro filters are locked (never hidden) for Starter; a hand-made URL
// can't get round it. Presets are exempt: they're free for everyone.
export function stripProChannelFilters(filters: ChannelFeedFilters): ChannelFeedFilters {
  if (filters.preset) return filters;
  return {
    ...filters,
    createdAfter: undefined,
    createdBefore: undefined,
    minOutlierScore: undefined,
    faceless: undefined,
    excludeKids: undefined,
    likelyMonetized: undefined,
  };
}

export function parseOutlierFilters(params: SearchParams): OutlierFeedFilters {
  const within = pick(z.enum(["7", "30", "90"]), first(params, "within"));
  return {
    niche: pick(slug, first(params, "niche")),
    minMultiple: pick(z.coerce.number().min(3).max(1_000), first(params, "minMultiple")),
    withinDays: within ? (Number(within) as 7 | 30 | 90) : 30,
    page: pick(page, first(params, "page")) ?? 1,
  };
}

// Builds `/niches?tab=...&...`, dropping defaults and empties so URLs stay
// short and a default view has a clean URL.
export function buildFeedUrl(tab: FeedTab, values: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  if (tab !== DEFAULT_FEED_TAB) params.set("tab", tab);
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== "") params.set(key, value);
  }
  const query = params.toString();
  return query ? `/niches?${query}` : "/niches";
}

const DEFAULT_SORT: Record<FeedTab, string> = {
  niches: "score",
  channels: "outlier_score",
  outliers: "",
  search: "",
};

// Filter state as URL strings, from parsed filters (the inverse of parse*).
export function nicheFiltersToValues(
  filters: NicheFeedFilters,
): Record<string, string | undefined> {
  const band =
    filters.minScore === SCORE_BANDS.hot.min
      ? "hot"
      : filters.minScore === SCORE_BANDS.good.min
        ? "good"
        : undefined;
  const trend = TREND_KEYS.find((key) => TREND_TO_STATUS[key] === filters.status);
  return {
    score: band,
    trend,
    sort: filters.sort === DEFAULT_SORT.niches ? undefined : filters.sort,
  };
}

export function channelFiltersToValues(
  filters: ChannelFeedFilters,
): Record<string, string | undefined> {
  const sort = filters.sort === DEFAULT_SORT.channels ? undefined : filters.sort;
  if (filters.preset) return { preset: filters.preset, sort };
  const age = (Object.keys(CHANNEL_AGE_MONTHS) as ChannelAge[]).find(
    (key) => CHANNEL_AGE_MONTHS[key] === filters.maxAgeMonths,
  );
  return {
    q: filters.q,
    age,
    country: filters.country,
    content: filters.contentType,
    niche: filters.niche,
    after: filters.createdAfter,
    before: filters.createdBefore,
    minSubs: filters.minSubs?.toString(),
    maxSubs: filters.maxSubs?.toString(),
    minViews: filters.minAvgViews?.toString(),
    maxViews: filters.maxAvgViews?.toString(),
    minOutlier: filters.minOutlierScore?.toString(),
    faceless: filters.faceless ? "1" : undefined,
    noKids: filters.excludeKids ? "1" : undefined,
    monetized: filters.likelyMonetized ? "1" : undefined,
    lang: filters.language,
    sort,
  };
}

export function outlierFiltersToValues(
  filters: OutlierFeedFilters,
): Record<string, string | undefined> {
  return {
    niche: filters.niche,
    minMultiple: filters.minMultiple?.toString(),
    within: filters.withinDays === 30 ? undefined : String(filters.withinDays),
  };
}

export function withPage(
  values: Record<string, string | undefined>,
  pageNumber: number,
): Record<string, string | undefined> {
  return { ...values, page: pageNumber > 1 ? String(pageNumber) : undefined };
}

export type FilterValues = Record<string, string | undefined>;

// D-072: which filters make a view billable (null = free). Sort and page
// are presentation, not a new query; a niche on its own is navigation (card
// badges and niche pages link to it). Expects values from *FiltersToValues
// above, which already drop defaults. Plain module so the filter panel can
// tell the user before charging.
// "preset": the three presets are free (D-077, D-072 revised).
const FREE_KEYS = new Set(["sort", "page", "tab", "preset"]);

export function billableFilters(values: FilterValues): FilterValues | null {
  const kept = Object.entries(values).filter(
    ([key, value]) => value !== undefined && value !== "" && !FREE_KEYS.has(key),
  );
  if (kept.length === 0) return null;
  if (kept.length === 1 && kept[0]![0] === "niche") return null;
  return Object.fromEntries(kept.sort(([a], [b]) => a.localeCompare(b)));
}
