import { describe, expect, it } from "vitest";

import { SCORE_WEIGHTS } from "@/lib/discovery/config";
import {
  channelOutlierScore,
  competitionLabel,
  nicheStatus,
  percentileRank,
  qualifies,
  rawSignals,
  refreshTier,
  scoreNiches,
  whyChips,
  type NicheSignalInputs,
} from "@/lib/discovery/scoring";

const NOW = new Date("2026-09-26T12:00:00Z").getTime();
const daysAgo = (days: number) => new Date(NOW - days * 86_400_000).toISOString();

function niche(overrides: Partial<NicheSignalInputs> = {}): NicheSignalInputs {
  return {
    nicheId: "n",
    channelCount: 10,
    performingCount: 10,
    smallPerformingCount: 5,
    newPerformingCount: 2,
    newChannels30d: 1,
    medianViews90d: 10_000,
    recentVideoCount: 100,
    outlierVideoCount: 10,
    uploads30d: 50,
    ...overrides,
  };
}

describe("weights", () => {
  it("sum to 100 so a perfect niche scores exactly 100", () => {
    expect(Object.values(SCORE_WEIGHTS).reduce((a, b) => a + b, 0)).toBe(100);
  });
});

describe("percentileRank", () => {
  it("ranks min 0, max 1, and splits ties at the midpoint", () => {
    const population = [1, 2, 2, 3];
    expect(percentileRank(1, population)).toBe(0);
    expect(percentileRank(3, population)).toBe(1);
    expect(percentileRank(2, population)).toBe(0.5);
  });

  it("puts a lone niche in the middle", () => {
    expect(percentileRank(42, [42])).toBe(0.5);
  });
});

describe("rawSignals", () => {
  it("computes shares from performing channels and recent videos", () => {
    expect(rawSignals(niche())).toEqual({
      accessibility: 0.5,
      demand: 10_000,
      momentum: 0.2,
      outlierDensity: 0.1,
      supply: 50,
    });
  });

  it("never divides by zero", () => {
    const raw = rawSignals(
      niche({ performingCount: 0, recentVideoCount: 0, medianViews90d: null }),
    );
    expect(raw).toEqual({
      accessibility: 0,
      demand: 0,
      momentum: 0,
      outlierDensity: 0,
      supply: 50,
    });
  });
});

describe("scoreNiches", () => {
  it("drops niches below the minimum sample", () => {
    const scored = scoreNiches([niche({ nicheId: "tiny", performingCount: 2 })]);
    expect(scored).toEqual([]);
  });

  it("gives the best-on-every-signal niche 100 and the worst 0", () => {
    const best = niche({
      nicheId: "best",
      smallPerformingCount: 9,
      newPerformingCount: 9,
      medianViews90d: 90_000,
      outlierVideoCount: 50,
      uploads30d: 5,
    });
    const worst = niche({
      nicheId: "worst",
      smallPerformingCount: 0,
      newPerformingCount: 0,
      medianViews90d: 100,
      outlierVideoCount: 0,
      uploads30d: 500,
    });
    const scored = scoreNiches([best, worst]);
    expect(scored.find((s) => s.nicheId === "best")?.score).toBe(100);
    expect(scored.find((s) => s.nicheId === "worst")?.score).toBe(0);
  });

  it("inverts supply: fewer uploads is better", () => {
    const quiet = niche({ nicheId: "quiet", uploads30d: 5 });
    const busy = niche({ nicheId: "busy", uploads30d: 500 });
    const [a, b] = scoreNiches([quiet, busy]);
    expect(a?.normalized.supply).toBe(1);
    expect(b?.normalized.supply).toBe(0);
    expect(a!.score - b!.score).toBe(SCORE_WEIGHTS.supply);
  });
});

describe("competitionLabel", () => {
  it("maps 80+/50-79/<50 per spec §8", () => {
    expect(competitionLabel(80)).toBe("low");
    expect(competitionLabel(79)).toBe("medium");
    expect(competitionLabel(50)).toBe("medium");
    expect(competitionLabel(49)).toBe("high");
  });
});

describe("nicheStatus", () => {
  const [scored] = scoreNiches([niche({ nicheId: "a", newPerformingCount: 1 })]);

  it("is rising on a +10 trend and declining on -10", () => {
    expect(nicheStatus(scored!, 10)).toBe("rising");
    expect(nicheStatus(scored!, -10)).toBe("declining");
    expect(nicheStatus(scored!, 3)).toBe("active");
  });

  it("is rising when half the performing channels are new, even with no history", () => {
    const [young] = scoreNiches([niche({ newPerformingCount: 5 })]);
    expect(nicheStatus(young!, null)).toBe("rising");
  });
});

describe("whyChips", () => {
  it("words the top two contributing signals", () => {
    const [scored] = scoreNiches([
      niche({ nicheId: "a", smallPerformingCount: 9, newPerformingCount: 4 }),
      niche({ nicheId: "b", smallPerformingCount: 1, newPerformingCount: 0 }),
    ]);
    const chips = whyChips({
      raw: scored!.raw,
      contributions: scored!.contributions,
      performingCount: 10,
      newPerformingCount: 4,
    });
    expect(chips).toEqual(["90% small channels ranking", "4 new channels breaking out"]);
  });
});

describe("channelOutlierScore", () => {
  it("is avg views over subscribers, null when subs are hidden", () => {
    expect(channelOutlierScore(47_000, 10_000)).toBe(4.7);
    expect(channelOutlierScore(5_000, 0)).toBeNull();
  });
});

describe("qualifies (spec §6.2)", () => {
  it("keeps a young channel with enough views", () => {
    expect(
      qualifies(
        { youtubeCreatedAt: daysAgo(100), avgViewsRecent: 5_000, outlierPublishedAt: [] },
        NOW,
      ),
    ).toBe(true);
  });

  it("keeps an old channel with a recent 3x video", () => {
    expect(
      qualifies(
        {
          youtubeCreatedAt: daysAgo(900),
          avgViewsRecent: 8_000,
          outlierPublishedAt: [daysAgo(10)],
        },
        NOW,
      ),
    ).toBe(true);
  });

  it("drops an old channel whose last outlier is stale", () => {
    expect(
      qualifies(
        {
          youtubeCreatedAt: daysAgo(900),
          avgViewsRecent: 8_000,
          outlierPublishedAt: [daysAgo(45)],
        },
        NOW,
      ),
    ).toBe(false);
  });

  it("drops anything under 5,000 avg views", () => {
    expect(
      qualifies(
        { youtubeCreatedAt: daysAgo(10), avgViewsRecent: 4_999, outlierPublishedAt: [] },
        NOW,
      ),
    ).toBe(false);
  });
});

describe("refreshTier (spec §6.1)", () => {
  const base = {
    isTracked: false,
    youtubeCreatedAt: daysAgo(900),
    qualifies: true,
    outlierPublishedAt: [] as string[],
  };

  it("is hot when tracked, recently outlying, or under 6 months old", () => {
    expect(refreshTier({ ...base, isTracked: true }, NOW)).toBe("hot");
    expect(refreshTier({ ...base, outlierPublishedAt: [daysAgo(5)] }, NOW)).toBe("hot");
    expect(refreshTier({ ...base, youtubeCreatedAt: daysAgo(60) }, NOW)).toBe("hot");
  });

  it("is warm when it qualifies, cold when it no longer does", () => {
    expect(refreshTier(base, NOW)).toBe("warm");
    expect(refreshTier({ ...base, qualifies: false }, NOW)).toBe("cold");
  });
});
