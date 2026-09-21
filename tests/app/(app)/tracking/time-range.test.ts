import { describe, expect, it } from "vitest";

import { parseTimeRange, rangeToSince } from "@/app/(app)/tracking/time-range";

describe("parseTimeRange", () => {
  it("accepts 24h, 7d, and 30d", () => {
    expect(parseTimeRange("24h")).toBe("24h");
    expect(parseTimeRange("7d")).toBe("7d");
    expect(parseTimeRange("30d")).toBe("30d");
  });

  it("defaults to 7d for anything else", () => {
    expect(parseTimeRange(undefined)).toBe("7d");
    expect(parseTimeRange("1y")).toBe("7d");
    expect(parseTimeRange("")).toBe("7d");
  });
});

describe("rangeToSince", () => {
  const NOW = new Date("2026-01-15T00:00:00.000Z").getTime();

  it("computes a 24-hour cutoff", () => {
    expect(rangeToSince("24h", NOW)).toBe("2026-01-14T00:00:00.000Z");
  });

  it("computes a 7-day cutoff", () => {
    expect(rangeToSince("7d", NOW)).toBe("2026-01-08T00:00:00.000Z");
  });

  it("computes a 30-day cutoff", () => {
    expect(rangeToSince("30d", NOW)).toBe("2025-12-16T00:00:00.000Z");
  });
});
