import { describe, expect, it } from "vitest";

import { formatRelativeTime } from "@/lib/format-relative-time";

const NOW = new Date("2026-01-15T12:00:00Z").getTime();

describe("formatRelativeTime", () => {
  it("returns 'just now' for under a minute", () => {
    expect(formatRelativeTime(new Date(NOW - 30_000).toISOString(), NOW)).toBe("just now");
  });

  it("formats minutes", () => {
    expect(formatRelativeTime(new Date(NOW - 5 * 60_000).toISOString(), NOW)).toBe("5m ago");
  });

  it("formats hours", () => {
    expect(formatRelativeTime(new Date(NOW - 2 * 60 * 60_000).toISOString(), NOW)).toBe("2h ago");
  });

  it("formats days", () => {
    expect(formatRelativeTime(new Date(NOW - 3 * 24 * 60 * 60_000).toISOString(), NOW)).toBe(
      "3d ago",
    );
  });

  it("formats weeks", () => {
    expect(formatRelativeTime(new Date(NOW - 2 * 7 * 24 * 60 * 60_000).toISOString(), NOW)).toBe(
      "2w ago",
    );
  });

  it("formats years for old timestamps", () => {
    expect(formatRelativeTime(new Date(NOW - 400 * 24 * 60 * 60_000).toISOString(), NOW)).toBe(
      "1y ago",
    );
  });
});
