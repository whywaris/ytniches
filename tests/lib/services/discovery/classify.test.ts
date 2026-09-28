import { beforeEach, describe, expect, it, vi } from "vitest";

import { createFakeSupabase } from "@/tests/helpers/fake-supabase";

const fake = createFakeSupabase();
vi.mock("@/lib/supabase/service", () => ({ createServiceClient: () => fake.client }));

const generateStructuredOutput = vi.fn();
vi.mock("@/lib/ai/client", () => ({
  CLASSIFY_MODEL: "gpt-4o-mini",
  generateStructuredOutput: (...args: unknown[]) => generateStructuredOutput(...args),
}));

const addExpansionSeeds = vi.fn();
vi.mock("@/lib/services/discovery/seeds", () => ({
  addExpansionSeeds: (...args: unknown[]) => addExpansionSeeds(...args),
}));

const { buildSystemPrompt, classifyBatch, slugify } =
  await import("@/lib/services/discovery/classify");

const NOW = new Date("2026-09-26T22:00:00Z");

const TAXONOMY = [
  { id: "n-crime", slug: "organised-crime", name: "Organised Crime", description: "Mafia" },
  { id: "n-true", slug: "true-crime", name: "True Crime", description: "Real cases" },
  { id: "n-dark", slug: "dark-history", name: "Dark History", description: "Grim past" },
  { id: "n-war", slug: "war-history", name: "War History", description: "Battles" },
];

const channels = [
  {
    id: "c1",
    name: "Mafia Tales",
    description: null,
    language: null,
    titles: ["The Gambino story"],
  },
];

function answer(item: Record<string, unknown>) {
  return {
    ok: true,
    value: {
      channels: [
        {
          channelId: "c1",
          niches: [],
          isFaceless: true,
          language: "en",
          suggestion: null,
          relatedKeywords: [],
          ...item,
        },
      ],
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  fake.reset();
  fake.on("niches", { data: TAXONOMY });
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

describe("buildSystemPrompt (D-080)", () => {
  it("lists every curated niche and tells the model to use only those", () => {
    const prompt = buildSystemPrompt(TAXONOMY);
    for (const niche of TAXONOMY) expect(prompt).toContain(`${niche.slug} | ${niche.name}`);
    expect(prompt).toMatch(/Use ONLY these niches/);
    expect(prompt).toMatch(/language and format .* never decide the niche/);
  });
});

describe("classifyBatch (D-080: list only)", () => {
  it("uses the mini model and writes the primary niche, faceless flag and language", async () => {
    generateStructuredOutput.mockResolvedValue(
      answer({
        niches: [{ slug: "organised-crime", confidence: 1.4 }],
        relatedKeywords: ["mob documentary"],
      }),
    );

    const result = await classifyBatch(channels, NOW);

    expect(generateStructuredOutput.mock.calls[0]?.[4]).toEqual({ model: "gpt-4o-mini" });
    expect(result).toEqual({
      classified: 1,
      unclassified: 0,
      suggestions: 0,
      failed: false,
      expansionSeeds: 0,
    });
    const update = fake.queriesFor("channels")[0]?.calls.find((c) => c.method === "update");
    expect(update?.args[0]).toEqual({
      niche_id: "n-crime",
      is_faceless: true,
      classification_confidence: 1,
      classified_at: NOW.toISOString(),
      language: "en",
    });
    expect(addExpansionSeeds).toHaveBeenCalledWith(["mob documentary"], NOW);
  });

  it("tags up to 3 listed niches: primary plus confident extras, unknown slugs and dupes dropped", async () => {
    generateStructuredOutput.mockResolvedValue(
      answer({
        niches: [
          { slug: "invented-niche", confidence: 0.9 },
          { slug: "organised-crime", confidence: 0.9 },
          { slug: "true-crime", confidence: 0.8 },
          { slug: "organised-crime", confidence: 0.9 },
          { slug: "dark-history", confidence: 0.4 },
          { slug: "war-history", confidence: 0.7 },
        ],
      }),
    );

    await classifyBatch(channels, NOW);

    const insert = fake
      .queriesFor("channel_niches")
      .flatMap((q) => q.calls)
      .find((c) => c.method === "insert");
    expect(insert?.args[0]).toEqual([
      { channel_id: "c1", niche_id: "n-crime", confidence: 0.9, is_primary: true },
      { channel_id: "c1", niche_id: "n-true", confidence: 0.8, is_primary: false },
      { channel_id: "c1", niche_id: "n-war", confidence: 0.7, is_primary: false },
    ]);
    // Never creates a niche.
    expect(
      fake
        .queriesFor("niches")
        .flatMap((q) => q.calls)
        .some((c) => ["insert", "upsert"].includes(c.method)),
    ).toBe(false);
  });

  it("marks a channel with no listed niche unclassified and queues a suggestion", async () => {
    generateStructuredOutput.mockResolvedValue(
      answer({
        niches: [{ slug: "made-up", confidence: 0.9 }],
        suggestion: { name: "Knitting Tutorials", description: "Learn to knit" },
      }),
    );

    const result = await classifyBatch(channels, NOW);

    expect(result).toMatchObject({ classified: 0, unclassified: 1, suggestions: 1 });
    const update = fake.queriesFor("channels")[0]?.calls.find((c) => c.method === "update");
    expect(update?.args[0]).toMatchObject({ niche_id: null, classified_at: NOW.toISOString() });
    expect(fake.rpcCalls).toEqual([
      {
        fn: "suggest_niche",
        args: {
          p_slug: "knitting-tutorials",
          p_name: "Knitting Tutorials",
          p_description: "Learn to knit",
          p_channel_id: "c1",
        },
      },
    ]);
    const niches = fake.queriesFor("channel_niches").flatMap((q) => q.calls);
    expect(niches.some((c) => c.method === "delete")).toBe(true);
    expect(niches.some((c) => c.method === "insert")).toBe(false);
  });

  it("doesn't suggest a niche that's already on the list", async () => {
    generateStructuredOutput.mockResolvedValue(
      answer({ suggestion: { name: "True Crime", description: "dupe" } }),
    );
    const result = await classifyBatch(channels, NOW);
    expect(result.suggestions).toBe(0);
    expect(fake.rpcCalls).toEqual([]);
  });

  it("throws on a transient AI error so the job retries", async () => {
    generateStructuredOutput.mockResolvedValue({ ok: false, error: { type: "rate_limited" } });
    await expect(classifyBatch(channels, NOW)).rejects.toThrow(/rate_limited/);
  });

  it("gives up quietly on a malformed response", async () => {
    generateStructuredOutput.mockResolvedValue({
      ok: false,
      error: { type: "invalid_response", message: "bad" },
    });
    const result = await classifyBatch(channels, NOW);
    expect(result).toMatchObject({ classified: 0, unclassified: 0, failed: true });
  });
});
