import { beforeEach, describe, expect, it, vi } from "vitest";

import { createFakeSupabase } from "@/tests/helpers/fake-supabase";

const fake = createFakeSupabase();
vi.mock("@/lib/supabase/service", () => ({ createServiceClient: () => fake.client }));

const discoverChannelIdsForKeyword = vi.fn();
const fetchChannelsFresh = vi.fn();
vi.mock("@/lib/youtube/discovery", () => ({
  discoverChannelIdsForKeyword: (...args: unknown[]) => discoverChannelIdsForKeyword(...args),
  fetchChannelsFresh: (...args: unknown[]) => fetchChannelsFresh(...args),
}));

const upsertChannels = vi.fn();
vi.mock("@/lib/services/channels", () => ({
  upsertChannels: (...args: unknown[]) => upsertChannels(...args),
}));

const { searchSeeds, ingestDiscoveredChannels, passesPrefilter } =
  await import("@/lib/services/discovery/ingest");

const NOW = new Date("2026-09-26T20:00:00Z");
const seed = (id: string) => ({
  id,
  keyword: `kw ${id}`,
  source: "manual" as const,
  priority: 3,
  lastRunAt: null,
});

function channelItem(id: string, viewCount: number, videoCount: number) {
  return {
    id,
    snippet: { title: id, description: "", publishedAt: "2026-01-01T00:00:00Z" },
    statistics: { viewCount, videoCount, subscriberCount: 1_000, hiddenSubscriberCount: false },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  fake.reset();
});

describe("searchSeeds", () => {
  it("searches the last 7 days and leaves marking to the caller (D-078)", async () => {
    discoverChannelIdsForKeyword.mockResolvedValue({ ok: true, value: ["UC1"] });

    const result = await searchSeeds([seed("s1"), seed("s2")], NOW);

    expect(discoverChannelIdsForKeyword).toHaveBeenCalledWith("kw s1", "2026-09-19T20:00:00.000Z");
    expect(result.searched).toHaveLength(2);
    // Marked only after ingest stores the results (workers/discovery.ts).
    expect(fake.queriesFor("discovery_seeds")).toHaveLength(0);
  });

  it("stops at the budget line without marking the unsearched seed", async () => {
    discoverChannelIdsForKeyword
      .mockResolvedValueOnce({ ok: true, value: ["UC1"] })
      .mockResolvedValueOnce({ ok: false, error: { type: "budget_exhausted" } });

    const result = await searchSeeds([seed("s1"), seed("s2"), seed("s3")], NOW);

    expect(result.stoppedForBudget).toBe(true);
    expect(result.searched.map((s) => s.seedId)).toEqual(["s1"]);
    expect(discoverChannelIdsForKeyword).toHaveBeenCalledTimes(2);
  });
});

describe("passesPrefilter", () => {
  it("needs a lifetime average of 2,500 views per video", () => {
    expect(passesPrefilter(channelItem("a", 25_000, 10) as never)).toBe(true);
    expect(passesPrefilter(channelItem("b", 24_999, 10) as never)).toBe(false);
    expect(passesPrefilter(channelItem("c", 1_000, 0) as never)).toBe(false);
  });
});

describe("ingestDiscoveredChannels", () => {
  it("fetches only unknown channels, keeps prefilter passes, credits the first seed", async () => {
    fake.on("channels", { data: [{ youtube_channel_id: "UC-known" }] });
    fetchChannelsFresh.mockResolvedValue({
      ok: true,
      value: [channelItem("UC-good", 100_000, 10), channelItem("UC-weak", 100, 10)],
    });
    upsertChannels.mockResolvedValue(new Map([["UC-good", "c-good"]]));

    const result = await ingestDiscoveredChannels(
      [
        { seedId: "s1", channelIds: ["UC-good", "UC-known"] },
        { seedId: "s2", channelIds: ["UC-good", "UC-weak"] },
      ],
      NOW,
    );

    expect(fetchChannelsFresh).toHaveBeenCalledWith(["UC-good", "UC-weak"]);
    expect(upsertChannels.mock.calls[0]?.[0].map((c: { id: string }) => c.id)).toEqual(["UC-good"]);
    expect(result).toEqual({
      newChannelIds: ["c-good"],
      skippedExisting: 1,
      rejectedByPrefilter: 1,
      stoppedForBudget: false,
    });

    const provenance = fake.queriesFor("channels")[1];
    expect(provenance?.calls.find((c) => c.method === "update")?.args[0]).toEqual({
      discovered_at: NOW.toISOString(),
      discovered_via_seed: "s1",
    });
    expect(provenance?.calls.find((c) => c.method === "is")?.args).toEqual(["discovered_at", null]);
  });

  it("looks up existing channels 100 IDs at a time so the URL stays short", async () => {
    const ids = Array.from({ length: 250 }, (_, i) => `UC${String(i).padStart(22, "0")}`);
    fake.on("channels", { data: [{ youtube_channel_id: ids[0] }] });
    fake.on("channels", { data: [{ youtube_channel_id: ids[150] }] });
    fake.on("channels", { data: [] });
    fetchChannelsFresh.mockResolvedValue({ ok: true, value: [] });
    upsertChannels.mockResolvedValue(new Map());

    const result = await ingestDiscoveredChannels([{ seedId: "s1", channelIds: ids }], NOW);

    const lookups = fake
      .queriesFor("channels")
      .map((q) => q.calls.find((c) => c.method === "in")?.args[1] as string[]);
    expect(lookups.map((list) => list.length)).toEqual([100, 100, 50]);
    expect(result.skippedExisting).toBe(2);
    expect(fetchChannelsFresh.mock.calls[0]?.[0]).toHaveLength(248);
  });

  it("spends nothing when every channel is already known", async () => {
    fake.on("channels", { data: [{ youtube_channel_id: "UC1" }] });

    const result = await ingestDiscoveredChannels([{ seedId: "s1", channelIds: ["UC1"] }], NOW);

    expect(fetchChannelsFresh).not.toHaveBeenCalled();
    expect(result.newChannelIds).toEqual([]);
  });
});
