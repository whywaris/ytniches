import { beforeEach, describe, expect, it, vi } from "vitest";

import { callsOf, createFakeSupabase } from "@/tests/helpers/fake-supabase";

const fake = createFakeSupabase();
vi.mock("@/lib/supabase/service", () => ({ createServiceClient: () => fake.client }));

const redisSet = vi.fn();
vi.mock("@/lib/cache/redis", () => ({ getRedis: () => ({ set: redisSet }) }));

const { snapshotNiches } = await import("@/lib/services/discovery/snapshot");

const NOW = new Date("2026-09-27T01:00:00Z");

function inputRow(nicheId: string, overrides: Record<string, number> = {}) {
  return {
    niche_id: nicheId,
    channel_count: 12,
    performing_count: 10,
    small_performing_count: 5,
    new_performing_count: 2,
    new_channels_30d: 3,
    median_views_90d: 12_000,
    recent_video_count: 100,
    outlier_video_count: 10,
    uploads_30d: 60,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  fake.reset();
});

describe("snapshotNiches", () => {
  it("passes config thresholds to SQL, writes today's rows with trend and chips", async () => {
    fake.onRpc("niche_signal_inputs", {
      data: [
        inputRow("good", { small_performing_count: 9, uploads_30d: 10 }),
        inputRow("meh"),
        inputRow("tiny", { performing_count: 1 }),
      ],
    });
    fake.on("niche_snapshots", { data: [{ niche_id: "good", opportunity_score: 40 }] });

    const result = await snapshotNiches(NOW);

    expect(fake.rpcCalls[0]?.args).toEqual({
      p_min_avg_views: 5_000,
      p_small_channel_subs: 10_000,
      p_new_channel_months: 12,
      p_outlier_multiple: 3,
    });
    // Trend compares against exactly 7 days earlier.
    expect(callsOf(fake.queriesFor("niche_snapshots")[0], "eq")).toEqual([
      ["snapshot_date", "2026-09-20"],
    ]);

    expect(result.snapshotDate).toBe("2026-09-27");
    expect(result.scored).toBe(2); // "tiny" is below the minimum sample.

    const rows = callsOf(fake.queriesFor("niche_snapshots")[1], "upsert")[0]?.[0] as {
      niche_id: string;
      opportunity_score: number;
      trend: number | null;
      why_chips: string[];
    }[];
    const good = rows.find((r) => r.niche_id === "good")!;
    expect(good.opportunity_score).toBeGreaterThan(
      rows.find((r) => r.niche_id === "meh")!.opportunity_score,
    );
    expect(good.trend).toBe(good.opportunity_score - 40);
    expect(good.why_chips).toHaveLength(2);
    expect(rows.find((r) => r.niche_id === "meh")!.trend).toBeNull();
  });

  it("bumps the feed cache version so stale pages are orphaned", async () => {
    fake.onRpc("niche_signal_inputs", { data: [] });
    await snapshotNiches(NOW);
    expect(redisSet).toHaveBeenCalledWith("discovery:feed:version", String(NOW.getTime()));
  });
});
