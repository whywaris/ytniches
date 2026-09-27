import { beforeEach, describe, expect, it, vi } from "vitest";

import { createFakeSupabase } from "@/tests/helpers/fake-supabase";

const fake = createFakeSupabase();
vi.mock("@/lib/supabase/service", () => ({ createServiceClient: () => fake.client }));

const hasJobBudget = vi.fn();
vi.mock("@/lib/youtube/quota", () => ({
  hasJobBudget: (...args: unknown[]) => hasJobBudget(...args),
  withQuotaSource: (_source: string, fn: () => Promise<unknown>) => fn(),
}));

const pickDueSeeds = vi.fn();
vi.mock("@/lib/services/discovery/seeds", () => ({
  pickDueSeeds: (...args: unknown[]) => pickDueSeeds(...args),
}));

const searchSeeds = vi.fn();
const ingestDiscoveredChannels = vi.fn();
vi.mock("@/lib/services/discovery/ingest", () => ({
  searchSeeds: (...args: unknown[]) => searchSeeds(...args),
  ingestDiscoveredChannels: (...args: unknown[]) => ingestDiscoveredChannels(...args),
}));

const enrichChannels = vi.fn();
vi.mock("@/lib/services/discovery/enrich", () => ({
  enrichChannels: (...args: unknown[]) => enrichChannels(...args),
}));

const listChannelsToClassify = vi.fn();
const classifyBatch = vi.fn();
vi.mock("@/lib/services/discovery/classify", () => ({
  listChannelsToClassify: (...args: unknown[]) => listChannelsToClassify(...args),
  classifyBatch: (...args: unknown[]) => classifyBatch(...args),
}));

const snapshotNiches = vi.fn();
vi.mock("@/lib/services/discovery/snapshot", () => ({
  snapshotNiches: (...args: unknown[]) => snapshotNiches(...args),
}));
const notifyNicheTrackers = vi.fn();
vi.mock("@/lib/services/discovery/niche-notifications", () => ({
  notifyNicheTrackers: (...args: unknown[]) => notifyNicheTrackers(...args),
}));

const { dispatchEnrichment, runDiscovery, runClassify, runEnrichmentBatch, runSnapshot } =
  await import("@/workers/discovery");

const NOW = new Date("2026-09-26T20:00:00Z");

// Memoising step double: a step id that already ran returns its stored
// output instead of re-running, like Inngest does on a retry.
function makeStep() {
  const memo = new Map<string, unknown>();
  return {
    run: vi.fn(async (id: string, fn: () => Promise<unknown>) => {
      if (!memo.has(id)) memo.set(id, await fn());
      return memo.get(id);
    }),
    sendEvent: vi.fn<
      (id: string, events: { name: string; data: Record<string, unknown> }[]) => Promise<undefined>
    >(async () => undefined),
  };
}

const uuid = (i: number) => `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`;

beforeEach(() => {
  vi.clearAllMocks();
  fake.reset();
  hasJobBudget.mockResolvedValue(true);
});

describe("dispatchEnrichment", () => {
  it("skips the tick entirely when a batch isn't affordable", async () => {
    hasJobBudget.mockResolvedValue(false);
    const step = makeStep();

    const result = await dispatchEnrichment(step, NOW);

    expect(result).toEqual({ dispatched: 0, skippedForBudget: true });
    expect(fake.rpcCalls).toEqual([]);
    expect(step.sendEvent).not.toHaveBeenCalled();
  });

  it("asks SQL for due channels using the config tier intervals and fans out 50 per batch", async () => {
    const ids = Array.from({ length: 120 }, (_, i) => uuid(i));
    fake.onRpc("find_due_enrichment_channel_ids", {
      data: ids.map((channel_id) => ({ channel_id })),
    });
    const step = makeStep();

    await dispatchEnrichment(step, NOW);

    expect(fake.rpcCalls[0]?.args).toEqual({
      p_limit: 200,
      p_hot_days: 2,
      p_warm_days: 7,
      p_cold_days: 25,
    });
    const events = step.sendEvent.mock.calls[0]?.[1] as unknown as {
      data: { channelIds: string[]; batchKey: string };
    }[];
    expect(events.map((e) => e.data.channelIds.length)).toEqual([50, 50, 20]);
    expect(events[2]?.data.batchKey).toBe(`tick:${NOW.toISOString()}:2`);
  });
});

describe("runEnrichmentBatch", () => {
  it("validates the event and enriches its channels", async () => {
    enrichChannels.mockResolvedValue({ enriched: 1 });
    const step = makeStep();

    await runEnrichmentBatch(step, { channelIds: [uuid(1)], batchKey: "k" });

    expect(enrichChannels).toHaveBeenCalledWith([uuid(1)]);
    await expect(runEnrichmentBatch(step, { channelIds: [], batchKey: "k" })).rejects.toThrow();
  });
});

describe("runDiscovery", () => {
  const seeds = [1, 2, 3].map((i) => ({ id: `s${i}`, keyword: `k${i}` }));

  it("searches seed by seed, stops at the budget line, ingests and enriches new channels", async () => {
    pickDueSeeds.mockResolvedValue(seeds);
    searchSeeds
      .mockResolvedValueOnce({
        searched: [{ seedId: "s1", channelIds: ["UC1"] }],
        stoppedForBudget: false,
      })
      .mockResolvedValueOnce({ searched: [], stoppedForBudget: true });
    ingestDiscoveredChannels.mockResolvedValue({
      newChannelIds: [uuid(1)],
      skippedExisting: 0,
      rejectedByPrefilter: 0,
      stoppedForBudget: false,
    });
    const step = makeStep();

    const result = await runDiscovery(step, NOW);

    expect(searchSeeds).toHaveBeenCalledTimes(2);
    expect(ingestDiscoveredChannels).toHaveBeenCalledWith(
      [{ seedId: "s1", channelIds: ["UC1"] }],
      NOW,
    );
    expect(result).toEqual({ seedsSearched: 1, newChannels: 1, stoppedForBudget: true });
    expect(step.sendEvent).toHaveBeenCalledWith("enrich-new-channels", [
      {
        name: "discovery/enrich.requested",
        data: { channelIds: [uuid(1)], batchKey: "discovery:2026-09-26:0" },
      },
    ]);
  });

  it("never re-pays a search that already succeeded when the run is retried", async () => {
    pickDueSeeds.mockResolvedValue(seeds.slice(0, 1));
    searchSeeds.mockResolvedValue({
      searched: [{ seedId: "s1", channelIds: [] }],
      stoppedForBudget: false,
    });
    ingestDiscoveredChannels.mockRejectedValueOnce(new Error("db blip")).mockResolvedValue({
      newChannelIds: [],
      skippedExisting: 0,
      rejectedByPrefilter: 0,
      stoppedForBudget: false,
    });
    const step = makeStep();

    await expect(runDiscovery(step, NOW)).rejects.toThrow("db blip");
    await runDiscovery(step, NOW); // Inngest retry with memoised steps

    expect(searchSeeds).toHaveBeenCalledTimes(1);
  });
});

describe("runClassify", () => {
  it("classifies batches until there's nothing left", async () => {
    listChannelsToClassify
      .mockResolvedValueOnce([{ id: "c1" }])
      .mockResolvedValueOnce([{ id: "c2" }])
      .mockResolvedValueOnce([]);
    classifyBatch.mockResolvedValue({ classified: 1, failed: false, expansionSeeds: 0 });

    expect(await runClassify(makeStep())).toEqual({ classified: 2, batches: 2 });
  });

  it("stops instead of looping on a batch the model can't parse", async () => {
    listChannelsToClassify.mockResolvedValue([{ id: "c1" }]);
    classifyBatch.mockResolvedValue({ classified: 0, failed: true, expansionSeeds: 0 });

    expect(await runClassify(makeStep())).toEqual({ classified: 0, batches: 1 });
    expect(classifyBatch).toHaveBeenCalledTimes(1);
  });
});

describe("runSnapshot", () => {
  it("scores, then notifies niche trackers in a separate retryable step", async () => {
    const changes = [{ nicheId: "n1", score: 80, trend: 12, status: "rising" }];
    snapshotNiches.mockResolvedValue({ snapshotDate: "2026-09-27", scored: 1, changes });
    notifyNicheTrackers
      .mockRejectedValueOnce(new Error("insert blip"))
      .mockResolvedValue({ scoreMoves: 1, newOutliers: 0 });
    const step = makeStep();

    await expect(runSnapshot(step)).rejects.toThrow("insert blip");
    const result = await runSnapshot(step); // retry: scores are memoised

    expect(snapshotNiches).toHaveBeenCalledTimes(1);
    expect(notifyNicheTrackers).toHaveBeenCalledWith(changes);
    expect(result.notified).toEqual({ scoreMoves: 1, newOutliers: 0 });
  });
});

describe("schedules (D-076)", () => {
  it("every discovery cron runs on the Pacific quota day", async () => {
    const { readFileSync } = await import("node:fs");
    const source = readFileSync(`${process.cwd()}/workers/discovery.ts`, "utf8");
    const crons = [...source.matchAll(/cron: `\$\{PT\} ([^`]+)`/g)].map((m) => m[1]);
    expect(source).toContain('const PT = "TZ=America/Los_Angeles"');
    expect(crons).toEqual(["15 0 * * *", "0 */2 * * *", "0 2 * * *", "0 4 * * *"]);
    expect(source).not.toMatch(/cron: "/);
  });
});
