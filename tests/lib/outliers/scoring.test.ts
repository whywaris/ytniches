import { describe, expect, it } from "vitest";

import {
  BASELINE_MIN_VIDEOS,
  computeBaseline,
  computeRecencyWeight,
  OUTLIER_SCORE,
  RECENCY_FLOOR,
} from "@/lib/outliers/scoring";

function video(viewCount: number, daysAgo: number) {
  return { viewCount, publishedAt: new Date(Date.now() - daysAgo * 86_400_000).toISOString() };
}

describe("computeBaseline", () => {
  it("returns null when there are fewer than BASELINE_MIN_VIDEOS prior videos (cold start)", () => {
    const priors = Array.from({ length: BASELINE_MIN_VIDEOS - 1 }, (_, i) => video(1000, i + 1));
    expect(computeBaseline(priors)).toBeNull();
  });

  it("returns the average once BASELINE_MIN_VIDEOS prior videos exist", () => {
    const priors = Array.from({ length: BASELINE_MIN_VIDEOS }, (_, i) => video(1000, i + 1));
    expect(computeBaseline(priors)).toBe(1000);
  });

  it("only averages the most recent BASELINE_WINDOW videos, not the full history", () => {
    // 10 videos at 1,000 views (recent) + 5 much older videos at 10 views
    // each -- the old ones fall outside the 10-video window and shouldn't
    // drag the baseline down.
    const recent = Array.from({ length: 10 }, (_, i) => video(1000, i + 1));
    const old = Array.from({ length: 5 }, (_, i) => video(10, 100 + i));
    expect(computeBaseline([...recent, ...old])).toBe(1000);
  });
});

describe("computeRecencyWeight", () => {
  it("is ~1 for a video published today", () => {
    expect(computeRecencyWeight(new Date().toISOString())).toBeCloseTo(1, 2);
  });

  it("decays linearly toward the floor as days-since-published approaches 90", () => {
    const publishedAt = new Date(Date.now() - 45 * 86_400_000).toISOString();
    expect(computeRecencyWeight(publishedAt)).toBeCloseTo(0.5, 2);
  });

  it("never drops below RECENCY_FLOOR for very old videos", () => {
    const publishedAt = new Date(Date.now() - 365 * 86_400_000).toISOString();
    expect(computeRecencyWeight(publishedAt)).toBe(RECENCY_FLOOR);
  });
});

describe("OUTLIER_SCORE", () => {
  it("multiplies the views/baseline ratio by the recency weight", () => {
    expect(OUTLIER_SCORE(5000, 1000, 0.5)).toBe(2.5);
  });
});
