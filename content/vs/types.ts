// PRD.md §10.5 comparison pages. Every competitor fact lives in
// content/vs/<id>.ts with the first-party page it came from and the date
// it was checked; tests/content/vs.test.ts fails CI when a file goes stale.

export type CellStatus = "yes" | "partial" | "no" | "not-listed";

export interface Cell {
  status: CellStatus;
  note?: string;
}

export type FeatureKey =
  | "nicheResearch"
  | "channelDatabase"
  | "outliers"
  | "competitorTracking"
  | "rpm"
  | "keywordResearch"
  | "aiScripts"
  | "thumbnailImages"
  | "calendar"
  | "teamWorkspace"
  | "chromeExtension"
  | "api"
  | "rankTracker"
  | "course"
  | "lifetimePlan"
  | "freeTrial";

export interface CompetitorRow {
  key: FeatureKey;
  them: Cell;
  // Required for anything but "not-listed": the competitor's own page
  // that states it. Must be one of the competitor's `sources`.
  source?: string;
}

export interface PriceTier {
  name: string;
  monthly?: string;
  annual?: string;
  details: string[];
}

export interface CompetitorPage {
  id: string;
  name: string;
  // Hostname every source must be on: first-party facts only.
  domain: string;
  checkedOn: string; // YYYY-MM-DD
  pricingUrl: string;
  sources: { label: string; url: string }[];
  bestFor: { them: string; us: string };
  rows: CompetitorRow[];
  pricing:
    | { kind: "listed"; tiers: PriceTier[]; notes: string[] }
    | { kind: "unlisted"; reason: string; plans: PriceTier[] };
  trial: string;
  chooseThem: string[];
  chooseUs: string[];
}
