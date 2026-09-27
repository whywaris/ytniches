import { describe, expect, it } from "vitest";

import { channelInsights, viewsToSubsRatio, type InsightVideo } from "@/lib/discovery/insights";

const NOW = new Date("2026-09-28T12:00:00Z").getTime();
const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (days: number) => new Date(NOW - days * DAY).toISOString();

function video(overrides: Partial<InsightVideo> & { daysAgo: number }): InsightVideo {
  const { daysAgo: age, ...rest } = overrides;
  return {
    publishedAt: daysAgo(age),
    viewCount: 10_000,
    likeCount: 100,
    commentCount: 10,
    outlierMultiple: 1,
    ...rest,
  };
}

const base: { youtubeCreatedAt: string; firstUploadAt: string | null; isFaceless: boolean | null } =
  { youtubeCreatedAt: daysAgo(1000), firstUploadAt: null, isFaceless: false };
const ids = (videos: InsightVideo[], extra: Partial<typeof base> = {}) =>
  channelInsights({ ...base, ...extra, recentVideos: videos }, NOW).map((insight) => insight.id);

describe("channelInsights", () => {
  it("Breakout: a 3x upload in the last 30 days, not an older one", () => {
    expect(ids([video({ daysAgo: 10, outlierMultiple: 3 })])).toContain("breakout");
    expect(ids([video({ daysAgo: 45, outlierMultiple: 8 })])).not.toContain("breakout");
    expect(ids([video({ daysAgo: 10, outlierMultiple: 2.9 })])).not.toContain("breakout");
  });

  it("New channel: first upload within 12 months (else channel creation)", () => {
    expect(ids([], { firstUploadAt: daysAgo(200) })).toContain("new");
    expect(ids([], { firstUploadAt: daysAgo(400) })).not.toContain("new");
    expect(ids([], { youtubeCreatedAt: daysAgo(100) })).toContain("new");
  });

  it("Consistent uploads: at least one upload in each of the last 4 weeks", () => {
    const weekly = [2, 9, 16, 23].map((d) => video({ daysAgo: d }));
    expect(ids(weekly)).toContain("consistent");
    expect(ids(weekly.slice(0, 3))).not.toContain("consistent");
  });

  it("Engaged audience: typical (likes + comments) / views of at least 4%", () => {
    const engaged = [1, 2, 3].map((d) => video({ daysAgo: d, likeCount: 350, commentCount: 60 }));
    expect(ids(engaged)).toContain("engaged");
    const quiet = [1, 2, 3].map((d) => video({ daysAgo: d, likeCount: 100, commentCount: 10 }));
    expect(ids(quiet)).not.toContain("engaged");
    // Too few videos with stats to judge.
    expect(ids(engaged.slice(0, 2))).not.toContain("engaged");
  });

  it("Faceless (est.) only when the classifier says so", () => {
    expect(ids([], { isFaceless: true })).toContain("faceless");
    expect(ids([], { isFaceless: false })).not.toContain("faceless");
  });

  it("every chip carries its rule as a hint, and none mention money", () => {
    const all = channelInsights(
      {
        youtubeCreatedAt: daysAgo(30),
        firstUploadAt: null,
        isFaceless: true,
        recentVideos: [2, 9, 16, 23].map((d) =>
          video({ daysAgo: d, outlierMultiple: 4, likeCount: 500, commentCount: 50 }),
        ),
      },
      NOW,
    );
    expect(all.map((insight) => insight.id)).toEqual([
      "breakout",
      "new",
      "consistent",
      "engaged",
      "faceless",
    ]);
    for (const insight of all) {
      expect(insight.hint.length).toBeGreaterThan(10);
      expect(insight.hint).not.toMatch(/revenue|rpm|\$|earn|profit/i);
    }
  });
});

describe("viewsToSubsRatio", () => {
  it("is typical views over subscribers, null when unknown", () => {
    expect(viewsToSubsRatio(200_000, 10_000)).toBe(20);
    expect(viewsToSubsRatio(null, 10_000)).toBeNull();
    expect(viewsToSubsRatio(5_000, 0)).toBeNull();
  });
});
