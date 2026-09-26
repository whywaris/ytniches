import { beforeEach, describe, expect, it, vi } from "vitest";

import { createFakeSupabase } from "@/tests/helpers/fake-supabase";

const fake = createFakeSupabase();
vi.mock("@/lib/supabase/service", () => ({ createServiceClient: () => fake.client }));

const generateStructuredOutput = vi.fn();
const createEmbedding = vi.fn();
vi.mock("@/lib/ai/client", () => ({
  CLASSIFY_MODEL: "gpt-4o-mini",
  generateStructuredOutput: (...args: unknown[]) => generateStructuredOutput(...args),
  createEmbedding: (...args: unknown[]) => createEmbedding(...args),
}));

const addExpansionSeeds = vi.fn();
vi.mock("@/lib/services/discovery/seeds", () => ({
  addExpansionSeeds: (...args: unknown[]) => addExpansionSeeds(...args),
}));

const { classifyBatch, resolveNiche, slugify } = await import("@/lib/services/discovery/classify");

const NOW = new Date("2026-09-26T22:00:00Z");

beforeEach(() => {
  vi.clearAllMocks();
  fake.reset();
  createEmbedding.mockResolvedValue({ ok: true, value: [0.1, 0.2] });
  addExpansionSeeds.mockResolvedValue(0);
});

describe("slugify", () => {
  it("makes url-safe slugs and never the reserved 'channels'", () => {
    expect(slugify("Mafia History")).toBe("mafia-history");
    expect(slugify("  AI & Tech — News! ")).toBe("ai-tech-news");
    expect(slugify("Channels")).toBe("channels-niche");
    expect(slugify("!!!")).toBe("niche");
  });
});

describe("resolveNiche", () => {
  it("reuses an exact slug match without embedding", async () => {
    fake.on("niches", { data: { id: "n-existing" } });

    const id = await resolveNiche("Mafia History", "Crime families", new Map());

    expect(id).toBe("n-existing");
    expect(createEmbedding).not.toHaveBeenCalled();
  });

  it("joins the nearest niche above the similarity threshold", async () => {
    fake.on("niches", { data: null });
    fake.onRpc("match_niche", { data: [{ niche_id: "n-near", similarity: 0.91 }] });

    const id = await resolveNiche("Mob History", "Organised crime", new Map());

    expect(id).toBe("n-near");
    expect(fake.rpcCalls[0]).toEqual({
      fn: "match_niche",
      args: { p_embedding: "[0.1,0.2]", p_min_similarity: 0.85 },
    });
  });

  it("creates a new niche when nothing is close", async () => {
    fake.on("niches", { data: null }, { data: { id: "n-new" } });
    fake.onRpc("match_niche", { data: [] });
    const cache = new Map<string, string>();

    const id = await resolveNiche("Rain Sleep Sounds", "Rain audio for sleep", cache);

    expect(id).toBe("n-new");
    expect(cache.get("rain-sleep-sounds")).toBe("n-new");
  });
});

describe("classifyBatch", () => {
  const channels = [
    {
      id: "c1",
      name: "Mafia Tales",
      description: null,
      language: null,
      titles: ["The Gambino story"],
    },
  ];

  it("uses the mini model and writes niche, faceless flag and language", async () => {
    generateStructuredOutput.mockResolvedValue({
      ok: true,
      value: {
        channels: [
          {
            channelId: "c1",
            niche: "Mafia History",
            nicheDescription: "Organised crime history",
            isFaceless: true,
            language: "en",
            confidence: 1.4,
            relatedKeywords: ["mob documentary"],
          },
          {
            channelId: "hallucinated",
            niche: "X",
            nicheDescription: "",
            isFaceless: false,
            language: null,
            confidence: 0.5,
            relatedKeywords: [],
          },
        ],
      },
    });
    fake.on("niches", { data: { id: "n1" } });

    const result = await classifyBatch(channels, new Map(), NOW);

    expect(generateStructuredOutput.mock.calls[0]?.[4]).toEqual({ model: "gpt-4o-mini" });
    expect(result).toEqual({ classified: 1, failed: false, expansionSeeds: 0 });
    const update = fake.queriesFor("channels")[0]?.calls.find((c) => c.method === "update");
    expect(update?.args[0]).toEqual({
      niche_id: "n1",
      is_faceless: true,
      classification_confidence: 1,
      classified_at: NOW.toISOString(),
      language: "en",
    });
    expect(addExpansionSeeds).toHaveBeenCalledWith(["mob documentary"], NOW);
  });

  it("throws on a transient AI error so the job retries", async () => {
    generateStructuredOutput.mockResolvedValue({ ok: false, error: { type: "rate_limited" } });
    await expect(classifyBatch(channels, new Map(), NOW)).rejects.toThrow(/rate_limited/);
  });

  it("gives up quietly on a malformed response", async () => {
    generateStructuredOutput.mockResolvedValue({
      ok: false,
      error: { type: "invalid_response", message: "bad" },
    });
    const result = await classifyBatch(channels, new Map(), NOW);
    expect(result).toEqual({ classified: 0, failed: true, expansionSeeds: 0 });
  });
});
