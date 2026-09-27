import { beforeEach, describe, expect, it, vi } from "vitest";

import { createFakeSupabase } from "@/tests/helpers/fake-supabase";

const fake = createFakeSupabase();
vi.mock("@/lib/supabase/service", () => ({ createServiceClient: () => fake.client }));

const fetchChannelsFresh = vi.fn();
const fetchUploadIdsFresh = vi.fn();
const fetchVideosFresh = vi.fn();
vi.mock("@/lib/youtube/discovery", () => ({
  fetchChannelsFresh: (...args: unknown[]) => fetchChannelsFresh(...args),
  fetchUploadIdsFresh: (...args: unknown[]) => fetchUploadIdsFresh(...args),
  fetchVideosFresh: (...args: unknown[]) => fetchVideosFresh(...args),
}));

const upsertChannels = vi.fn();
vi.mock("@/lib/services/channels", () => ({
  upsertChannels: (...args: unknown[]) => upsertChannels(...args),
}));

const upsertVideos = vi.fn();
vi.mock("@/workers/channel-sync", () => ({
  upsertVideos: (...args: unknown[]) => upsertVideos(...args),
  parseIso8601Duration: (duration: string) => {
    const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(duration);
    return match
      ? Number(match[1] ?? 0) * 3600 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0)
      : 0;
  },
}));

const { computeChannelEnrichment, enrichChannels } =
  await import("@/lib/services/discovery/enrich");

const NOW = new Date("2026-09-26T12:00:00Z");
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 86_400_000).toISOString();

type Channel = Parameters<typeof computeChannelEnrichment>[0];
type Video = Parameters<typeof computeChannelEnrichment>[1][number];

function channel(overrides: Partial<Channel["statistics"]> = {}, createdDaysAgo = 900): Channel {
  return {
    id: "UC1",
    snippet: { title: "Mafia Tales", description: "", publishedAt: daysAgo(createdDaysAgo) },
    statistics: {
      subscriberCount: 20_000,
      viewCount: 5_000_000,
      videoCount: 200,
      hiddenSubscriberCount: false,
      ...overrides,
    },
    contentDetails: { relatedPlaylists: { uploads: "UU1" } },
  };
}

function video(id: string, views: number, publishedDaysAgo: number, duration = "PT12M"): Video {
  return {
    id,
    snippet: {
      title: id,
      description: "",
      publishedAt: daysAgo(publishedDaysAgo),
      tags: [],
      channelId: "UC1",
    },
    statistics: { viewCount: views },
    contentDetails: { duration },
  };
}

// Ten steady 10k-view uploads, then a 50k breakout 3 days ago.
function breakoutUploads(): Video[] {
  const steady = Array.from({ length: 10 }, (_, i) => video(`v${i}`, 10_000, 60 - i * 5));
  return [...steady, video("breakout", 50_000, 3)];
}

describe("computeChannelEnrichment", () => {
  it("averages long-form views and flags shorts separately", () => {
    const result = computeChannelEnrichment(
      channel(),
      [video("a", 10_000, 10), video("b", 20_000, 5), video("short", 900_000, 1, "PT45S")],
      false,
      NOW.getTime(),
    );
    expect(result.avgViewsRecent).toBe(15_000);
    expect(result.hasShorts).toBe(true);
  });

  it("scores each video with the shared 3x rule and lists the outliers", () => {
    const result = computeChannelEnrichment(channel(), breakoutUploads(), false, NOW.getTime());
    expect(result.multiples.get("breakout")).toBe(5);
    expect(result.outlierVideoIds).toEqual(["breakout"]);
    // A recent outlier qualifies an old channel and makes it hot.
    expect(result.qualifies).toBe(true);
    expect(result.tier).toBe("hot");
  });

  it("uses the shared 3x rule at the boundary (D-054): 2,999 is not an outlier, 3,000 is", () => {
    const steady = Array.from({ length: 10 }, (_, i) => video(`v${i}`, 1_000, 60 - i * 5));
    const below = computeChannelEnrichment(
      channel(),
      [...steady, video("edge", 2_999, 3)],
      false,
      NOW.getTime(),
    );
    const at = computeChannelEnrichment(
      channel(),
      [...steady, video("edge", 3_000, 3)],
      false,
      NOW.getTime(),
    );
    expect(below.outlierVideoIds).not.toContain("edge");
    expect(at.outlierVideoIds).toContain("edge");
  });

  it("computes the channel outlier score as avg views / subs", () => {
    const result = computeChannelEnrichment(
      channel({ subscriberCount: 5_000 }),
      [video("a", 10_000, 10), video("b", 20_000, 5)],
      false,
      NOW.getTime(),
    );
    expect(result.outlierScore).toBe(3);
  });

  it("estimates monetization, never for made-for-kids channels", () => {
    const adult = computeChannelEnrichment(channel(), [], false, NOW.getTime());
    expect(adult.likelyMonetized).toBe(true);
    const kids = computeChannelEnrichment(
      { ...channel(), status: { madeForKids: true } },
      [],
      false,
      NOW.getTime(),
    );
    expect(kids.likelyMonetized).toBe(false);
  });

  it("knows the first upload only when it has seen every upload", () => {
    const uploads = [video("a", 10_000, 10), video("b", 20_000, 40)];
    expect(
      computeChannelEnrichment(channel({ videoCount: 2 }), uploads, false, NOW.getTime())
        .firstUploadAt,
    ).toBe(daysAgo(40));
    expect(
      computeChannelEnrichment(channel({ videoCount: 90 }), uploads, false, NOW.getTime())
        .firstUploadAt,
    ).toBeNull();
  });
});

describe("enrichChannels", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fake.reset();
    upsertVideos.mockImplementation(async (_channelId: string, videos: Video[]) => {
      return new Map(videos.map((v) => [v.id, `db-${v.id}`]));
    });
  });

  it("stops cleanly, touching nothing, when the budget is gone up front", async () => {
    fake.on("channels", {
      data: [
        {
          id: "c1",
          youtube_channel_id: "UC1",
          niche_id: null,
          discovered_at: null,
          enriched_at: null,
        },
      ],
    });
    fetchChannelsFresh.mockResolvedValue({ ok: false, error: { type: "budget_exhausted" } });

    const result = await enrichChannels(["c1"], NOW);

    expect(result.stoppedForBudget).toBe(true);
    expect(upsertChannels).not.toHaveBeenCalled();
  });

  it("stores metrics, multiples and outlier feed rows for a qualifying channel", async () => {
    fake.on("channels", {
      data: [
        {
          id: "c1",
          youtube_channel_id: "UC1",
          niche_id: "n1",
          discovered_at: null,
          enriched_at: null,
        },
      ],
    });
    fetchChannelsFresh.mockResolvedValue({ ok: true, value: [channel()] });
    const uploads = breakoutUploads();
    fetchUploadIdsFresh.mockResolvedValue({ ok: true, value: uploads.map((v) => v.id) });
    fetchVideosFresh.mockResolvedValue({ ok: true, value: uploads });
    fake.on("tracked_channels", { data: [] });

    const result = await enrichChannels(["c1"], NOW);

    expect(result).toMatchObject({ enriched: 1, outliers: 1, dropped: 0, stoppedForBudget: false });
    expect(upsertVideos.mock.calls[0]?.[2]?.get("breakout")).toBe(5);

    const feed = fake.queriesFor("outliers_feed")[0];
    const upsert = feed?.calls.find((c) => c.method === "upsert")?.args[0];
    expect(upsert).toEqual([
      { video_id: "db-breakout", channel_id: "c1", niche_id: "n1", outlier_multiple: 5 },
    ]);

    const update = fake
      .queriesFor("channels")
      .flatMap((q) => q.calls)
      .find((c) => c.method === "update")?.args[0] as Record<string, unknown>;
    expect(update).toMatchObject({ refresh_tier: "hot", enriched_at: NOW.toISOString() });
  });

  it("drops a freshly discovered channel that fails qualification", async () => {
    fake.on("channels", {
      data: [
        {
          id: "c1",
          youtube_channel_id: "UC1",
          niche_id: null,
          discovered_at: daysAgo(0),
          enriched_at: null,
        },
      ],
    });
    fetchChannelsFresh.mockResolvedValue({ ok: true, value: [channel()] });
    const weak = [video("a", 100, 10), video("b", 200, 5)];
    fetchUploadIdsFresh.mockResolvedValue({ ok: true, value: ["a", "b"] });
    fetchVideosFresh.mockResolvedValue({ ok: true, value: weak });
    fake.on("tracked_channels", { data: [] }, { data: [] });
    fake.on("prompts", { data: [] });

    const result = await enrichChannels(["c1"], NOW);

    expect(result).toMatchObject({ enriched: 0, dropped: 1 });
    expect(upsertVideos).not.toHaveBeenCalled();
    const deleted = fake
      .queriesFor("channels")
      .some((q) => q.calls.some((c) => c.method === "delete"));
    expect(deleted).toBe(true);
  });

  it("marks channels YouTube no longer returns as unavailable", async () => {
    fake.on("channels", {
      data: [
        {
          id: "c1",
          youtube_channel_id: "UC1",
          niche_id: null,
          discovered_at: null,
          enriched_at: null,
        },
      ],
    });
    fetchChannelsFresh.mockResolvedValue({ ok: true, value: [] });
    fetchVideosFresh.mockResolvedValue({ ok: true, value: [] });

    const result = await enrichChannels(["c1"], NOW);

    expect(result.unavailable).toBe(1);
  });
});
