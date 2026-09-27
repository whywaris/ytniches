import {
  NEW_CHANNEL_MONTHS,
  RISING_MOMENTUM_SHARE,
  SATURATED_MAX_SCORE,
  SATURATED_SUPPLY_PERCENTILE,
  SMALL_CHANNEL_SUBS,
  TREND_STATUS_DELTA,
  TREND_WINDOW_DAYS,
} from "@/lib/discovery/config";

// D-077: one typed definition of every feed filter, shared by the server
// (parsing, Pro stripping, billing) and the filter bar (chips, panel,
// mobile sheet). Plain module: no "use client", no server-only imports.

export type FilterTier = "basic" | "pro";

export interface FilterOption {
  value: string;
  label: string;
  /** Shown as a tooltip: the rule behind the option. */
  hint?: string;
}

export interface RangePreset {
  label: string;
  min?: number;
  max?: number;
}

export type FilterControl =
  | { kind: "range"; minKey: string; maxKey: string; presets: RangePreset[] }
  | { kind: "options"; key: string; options: FilterOption[] }
  | { kind: "toggle"; key: string }
  | { kind: "date"; key: string }
  | { kind: "number"; key: string; min?: number; step?: number; suffix?: string };

export interface FeedFilterDef {
  id: string;
  label: string;
  tier: FilterTier;
  control: FilterControl;
}

export function filterKeys(def: FeedFilterDef): string[] {
  return def.control.kind === "range"
    ? [def.control.minKey, def.control.maxKey]
    : [def.control.key];
}

export const LANGUAGE_OPTIONS: FilterOption[] = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "pt", label: "Portuguese" },
  { value: "hi", label: "Hindi" },
  { value: "ur", label: "Urdu" },
  { value: "ar", label: "Arabic" },
  { value: "de", label: "German" },
  { value: "fr", label: "French" },
  { value: "id", label: "Indonesian" },
  { value: "ja", label: "Japanese" },
];

export const COUNTRY_OPTIONS: FilterOption[] = [
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "IN", label: "India" },
  { value: "PK", label: "Pakistan" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "BR", label: "Brazil" },
  { value: "MX", label: "Mexico" },
  { value: "ES", label: "Spain" },
  { value: "PH", label: "Philippines" },
  { value: "ID", label: "Indonesia" },
];

export const CHANNEL_AGE_MONTHS = { "3m": 3, "6m": 6, "12m": 12 } as const;
export type ChannelAge = keyof typeof CHANNEL_AGE_MONTHS;

export const CONTENT_TYPES = ["long", "shorts", "mixed"] as const;

// `niche` options come from the DB at render time (see withNicheOptions).
export const CHANNEL_FILTERS: FeedFilterDef[] = [
  {
    id: "niche",
    label: "Niche",
    tier: "basic",
    control: { kind: "options", key: "niche", options: [] },
  },
  {
    id: "subscribers",
    label: "Subscribers",
    tier: "basic",
    control: {
      kind: "range",
      minKey: "minSubs",
      maxKey: "maxSubs",
      presets: [
        { label: "Under 1K", max: 1_000 },
        { label: "1K–10K", min: 1_000, max: 10_000 },
        { label: "10K–100K", min: 10_000, max: 100_000 },
        { label: "100K–1M", min: 100_000, max: 1_000_000 },
        { label: "1M+", min: 1_000_000 },
      ],
    },
  },
  {
    id: "views",
    label: "Avg views",
    tier: "basic",
    control: {
      kind: "range",
      minKey: "minViews",
      maxKey: "maxViews",
      presets: [
        { label: "1K+", min: 1_000 },
        { label: "10K+", min: 10_000 },
        { label: "100K+", min: 100_000 },
        { label: "1M+", min: 1_000_000 },
      ],
    },
  },
  {
    id: "age",
    label: "Channel age",
    tier: "basic",
    control: {
      kind: "options",
      key: "age",
      options: [
        { value: "3m", label: "Under 3 months" },
        { value: "6m", label: "Under 6 months" },
        { value: "12m", label: "Under 12 months" },
      ],
    },
  },
  {
    id: "lang",
    label: "Language",
    tier: "basic",
    control: { kind: "options", key: "lang", options: LANGUAGE_OPTIONS },
  },
  {
    id: "country",
    label: "Country",
    tier: "basic",
    control: { kind: "options", key: "country", options: COUNTRY_OPTIONS },
  },
  {
    id: "content",
    label: "Content type",
    tier: "basic",
    control: {
      kind: "options",
      key: "content",
      options: [
        { value: "long", label: "Long-form", hint: "At most 20% of recent uploads are Shorts." },
        { value: "shorts", label: "Shorts", hint: "At least 80% of recent uploads are Shorts." },
        { value: "mixed", label: "Mixed", hint: "Somewhere in between." },
      ],
    },
  },
  {
    id: "minOutlier",
    label: "Min outlier score",
    tier: "pro",
    control: { kind: "number", key: "minOutlier", min: 0, step: 0.5 },
  },
  {
    id: "faceless",
    label: "Faceless only (est.)",
    tier: "pro",
    control: { kind: "toggle", key: "faceless" },
  },
  {
    id: "noKids",
    label: "Exclude kids content",
    tier: "pro",
    control: { kind: "toggle", key: "noKids" },
  },
  {
    id: "monetized",
    label: "Likely monetized (est.)",
    tier: "pro",
    control: { kind: "toggle", key: "monetized" },
  },
  { id: "after", label: "Started after", tier: "pro", control: { kind: "date", key: "after" } },
  { id: "before", label: "Started before", tier: "pro", control: { kind: "date", key: "before" } },
];

export const TREND_OPTIONS: FilterOption[] = [
  {
    value: "rising",
    label: "Rising",
    hint: `Score up ${TREND_STATUS_DELTA}+ points in ${TREND_WINDOW_DAYS} days, or at least ${RISING_MOMENTUM_SHARE * 100}% of its performing channels are under ${NEW_CHANNEL_MONTHS} months old.`,
  },
  { value: "steady", label: "Steady", hint: "Not rising, cooling or crowded." },
  {
    value: "crowded",
    label: "Crowded",
    hint: `Score under ${SATURATED_MAX_SCORE} and more channels than ${SATURATED_SUPPLY_PERCENTILE * 100}% of niches.`,
  },
  {
    value: "cooling",
    label: "Cooling",
    hint: `Score down ${TREND_STATUS_DELTA}+ points in ${TREND_WINDOW_DAYS} days.`,
  },
];

// URL "trend" value -> stored niche status.
export const TREND_TO_STATUS = {
  rising: "rising",
  steady: "active",
  crowded: "saturated",
  cooling: "declining",
} as const;

export const SCORE_BANDS = { hot: { min: 70 }, good: { min: 50, max: 69 } } as const;

export const NICHE_FILTERS: FeedFilterDef[] = [
  {
    id: "score",
    label: "Score",
    tier: "basic",
    control: {
      kind: "options",
      key: "score",
      options: [
        { value: "hot", label: "70+ Hot" },
        { value: "good", label: "50–69 Good" },
      ],
    },
  },
  {
    id: "trend",
    label: "Trend",
    tier: "basic",
    control: { kind: "options", key: "trend", options: TREND_OPTIONS },
  },
];

export const OUTLIER_FILTERS: FeedFilterDef[] = [
  {
    id: "niche",
    label: "Niche",
    tier: "basic",
    control: { kind: "options", key: "niche", options: [] },
  },
  {
    id: "minMultiple",
    label: "Min multiple",
    tier: "basic",
    control: { kind: "number", key: "minMultiple", min: 3, step: 0.5, suffix: "×" },
  },
  {
    id: "within",
    label: "Published within",
    tier: "basic",
    control: {
      kind: "options",
      key: "within",
      options: [
        { value: "7", label: "7 days" },
        { value: "90", label: "90 days" },
      ],
    },
  },
];

export const SORT_OPTIONS = {
  channels: [
    { value: "outlier_score", label: "Outlier score" },
    { value: "avg_views", label: "Avg views" },
    { value: "newest", label: "Newest channel" },
    { value: "subscribers", label: "Subscribers" },
  ],
  niches: [
    { value: "score", label: "Opportunity score" },
    { value: "trend", label: "7-day trend" },
    { value: "newest", label: "Newest niche" },
  ],
} as const;

// D-072 (revised by D-077): the presets are free, like the default feeds.
export const CHANNEL_PRESETS = [
  {
    id: "new-faceless",
    label: "New faceless",
    hint: "Faceless (est.) channels under 12 months old.",
  },
  {
    id: "small-breakout",
    label: "Small + breakout",
    hint: `Under ${SMALL_CHANNEL_SUBS.toLocaleString("en-US")} subscribers with a 3× outlier in the last 30 days.`,
  },
  { id: "rising", label: "Rising", hint: "Channels in niches that are Rising." },
] as const;
export type ChannelPresetId = (typeof CHANNEL_PRESETS)[number]["id"];

export function withNicheOptions(defs: FeedFilterDef[], niches: FilterOption[]): FeedFilterDef[] {
  return defs.map((def) =>
    def.id === "niche" && def.control.kind === "options"
      ? { ...def, control: { ...def.control, options: niches } }
      : def,
  );
}

// Every URL key a Pro-only filter owns: stripped server-side for others.
export function proKeys(defs: FeedFilterDef[]): Set<string> {
  return new Set(defs.filter((def) => def.tier === "pro").flatMap(filterKeys));
}

export function isProTier(tier: string | null | undefined): boolean {
  return tier === "pro" || tier === "team";
}
