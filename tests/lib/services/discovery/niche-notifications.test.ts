import { beforeEach, describe, expect, it, vi } from "vitest";

import { callsOf, createFakeSupabase } from "@/tests/helpers/fake-supabase";

const fake = createFakeSupabase();
vi.mock("@/lib/supabase/service", () => ({ createServiceClient: () => fake.client }));

const { notifyNicheTrackers, newOutlierCopy, scoreMoveCopy } =
  await import("@/lib/services/discovery/niche-notifications");

const NOW = new Date("2026-09-27T01:00:00Z");

beforeEach(() => fake.reset());

function change(nicheId: string, trend: number | null) {
  return { nicheId, score: 70, trend, status: "active" as const };
}

describe("copy", () => {
  it("words score moves and outliers per spec §11", () => {
    expect(scoreMoveCopy("Mafia History", 12).title).toBe("Mafia History moved +12 this week");
    expect(scoreMoveCopy("Mafia History", -11).title).toBe("Mafia History moved -11 this week");
    expect(newOutlierCopy("Mafia History", 1).title).toBe("New outlier in Mafia History");
    expect(newOutlierCopy("Mafia History", 3).title).toBe("3 new outliers in Mafia History");
  });
});

describe("notifyNicheTrackers", () => {
  it("notifies trackers of niches that moved 10+ or got new outliers, skipping opt-outs and repeats", async () => {
    fake.on("outliers_feed", { data: [{ niche_id: "n2" }, { niche_id: "n2" }] });
    fake.on("tracked_channels", {
      data: [
        { user_id: "u1", channels: { niche_id: "n1" } },
        { user_id: "u2", channels: { niche_id: "n1" } },
        { user_id: "u3", channels: { niche_id: "n1" } },
        { user_id: "u1", channels: { niche_id: "n2" } },
      ],
    });
    fake.on("niches", {
      data: [
        { id: "n1", slug: "mafia-history", name: "Mafia History" },
        { id: "n2", slug: "rain-sleep-sounds", name: "Rain Sleep Sounds" },
      ],
    });
    fake.on("notification_preferences", { data: [{ user_id: "u2" }] }); // u2 opted out
    fake.on("notifications", {
      data: [{ user_id: "u3", title: "Mafia History moved +12 this week" }], // already sent today
    });

    const result = await notifyNicheTrackers(
      [change("n1", 12), change("n3", 4), change("n4", null)],
      NOW,
    );

    expect(result).toEqual({ scoreMoves: 1, newOutliers: 1 });
    const insert = callsOf(fake.queriesFor("notifications")[1], "insert")[0]?.[0];
    expect(insert).toEqual([
      {
        user_id: "u1",
        notification_type: "niche_update",
        title: "Mafia History moved +12 this week",
        body: expect.any(String),
        related_resource: "niche:mafia-history",
        delivered_channels: ["in_app"],
      },
      {
        user_id: "u1",
        notification_type: "niche_update",
        title: "2 new outliers in Rain Sleep Sounds",
        body: expect.any(String),
        related_resource: "niche:rain-sleep-sounds",
        delivered_channels: ["in_app"],
      },
    ]);
    // New outliers = detected in the last 24h.
    expect(callsOf(fake.queriesFor("outliers_feed")[0], "gte")[0]).toEqual([
      "detected_at",
      "2026-09-26T01:00:00.000Z",
    ]);
  });

  it("does nothing when no niche moved and nothing broke out", async () => {
    fake.on("outliers_feed", { data: [] });
    const result = await notifyNicheTrackers([change("n1", 5)], NOW);
    expect(result).toEqual({ scoreMoves: 0, newOutliers: 0 });
    expect(fake.queriesFor("notifications")).toHaveLength(0);
  });
});
