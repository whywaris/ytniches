import { describe, expect, it } from "vitest";

import { isInQuietHours } from "@/lib/notifications/quiet-hours";

// UTC throughout -- these are wall-clock UTC timestamps and timeZone:
// "UTC", so "now" and "quiet hours" are directly comparable without
// needing to reason about a second offset.
function utcAt(hour: number, minute = 0): Date {
  return new Date(Date.UTC(2026, 0, 1, hour, minute, 0));
}

describe("isInQuietHours", () => {
  it("returns false when no quiet hours are set", () => {
    expect(isInQuietHours(null, null, "UTC", utcAt(23))).toBe(false);
  });

  it("returns false when start equals end (degenerate/no window)", () => {
    expect(isInQuietHours("09:00:00", "09:00:00", "UTC", utcAt(9))).toBe(false);
  });

  describe("same-day window (start < end)", () => {
    it("is quiet at the start boundary (inclusive)", () => {
      expect(isInQuietHours("09:00:00", "17:00:00", "UTC", utcAt(9, 0))).toBe(true);
    });

    it("is quiet in the middle of the window", () => {
      expect(isInQuietHours("09:00:00", "17:00:00", "UTC", utcAt(12))).toBe(true);
    });

    it("is not quiet at the end boundary (exclusive)", () => {
      expect(isInQuietHours("09:00:00", "17:00:00", "UTC", utcAt(17, 0))).toBe(false);
    });

    it("is not quiet outside the window", () => {
      expect(isInQuietHours("09:00:00", "17:00:00", "UTC", utcAt(20))).toBe(false);
    });
  });

  describe("overnight wraparound (start > end, crosses midnight)", () => {
    const START = "22:00:00";
    const END = "07:00:00";

    it("is quiet right at the start boundary, before midnight", () => {
      expect(isInQuietHours(START, END, "UTC", utcAt(22, 0))).toBe(true);
    });

    it("is quiet late at night, before midnight", () => {
      expect(isInQuietHours(START, END, "UTC", utcAt(23, 30))).toBe(true);
    });

    it("is quiet just after midnight", () => {
      expect(isInQuietHours(START, END, "UTC", utcAt(0, 30))).toBe(true);
    });

    it("is quiet right up to the end boundary, after midnight", () => {
      expect(isInQuietHours(START, END, "UTC", utcAt(6, 59))).toBe(true);
    });

    it("is not quiet at the end boundary itself (exclusive)", () => {
      expect(isInQuietHours(START, END, "UTC", utcAt(7, 0))).toBe(false);
    });

    it("is not quiet in the middle of the day", () => {
      expect(isInQuietHours(START, END, "UTC", utcAt(14))).toBe(false);
    });
  });

  it("resolves a non-UTC IANA time zone correctly", () => {
    // 18:00 UTC is outside a 22:00-07:00 window when read as UTC, but
    // Asia/Karachi is UTC+5 (no DST) -- 18:00 UTC is 23:00 in Karachi,
    // which *is* inside the window. Picking an instant that gives
    // opposite answers in the two zones proves the conversion is actually
    // happening, not coincidentally passing either way.
    const quietStart = "22:00:00";
    const quietEnd = "07:00:00";
    const instant = new Date(Date.UTC(2026, 0, 1, 18, 0, 0));
    expect(isInQuietHours(quietStart, quietEnd, "UTC", instant)).toBe(false);
    expect(isInQuietHours(quietStart, quietEnd, "Asia/Karachi", instant)).toBe(true);
  });
});
