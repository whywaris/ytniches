// UI-UX-Flow.md §6.1's time range chips, narrowed to 24h/7d/30d for this
// build (Custom is out of scope). Query-param driven, same
// shareable-URL philosophy as niches/url-filters.ts.
export type TimeRange = "24h" | "7d" | "30d";

const RANGE_MS: Record<TimeRange, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

const DEFAULT_RANGE: TimeRange = "7d";

export function parseTimeRange(raw: string | undefined): TimeRange {
  return raw === "24h" || raw === "7d" || raw === "30d" ? raw : DEFAULT_RANGE;
}

export function rangeToSince(range: TimeRange, now: number = Date.now()): string {
  return new Date(now - RANGE_MS[range]).toISOString();
}
