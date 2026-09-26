import { beforeEach, describe, expect, it, vi } from "vitest";

import { callsOf, createFakeSupabase } from "@/tests/helpers/fake-supabase";

const fake = createFakeSupabase();
vi.mock("@/lib/supabase/service", () => ({ createServiceClient: () => fake.client }));

const { addExpansionSeeds, addUserSearchSeed, normalizeKeyword, pickDueSeeds } =
  await import("@/lib/services/discovery/seeds");

beforeEach(() => {
  fake.reset();
});

describe("normalizeKeyword", () => {
  it("lower-cases and collapses whitespace; rejects empties and huge input", () => {
    expect(normalizeKeyword("  Mafia   HISTORY ")).toBe("mafia history");
    expect(normalizeKeyword(" a ")).toBeNull();
    expect(normalizeKeyword("x".repeat(81))).toBeNull();
  });
});

describe("pickDueSeeds", () => {
  it("orders by priority, then never-run first, then oldest run", async () => {
    fake.on("discovery_seeds", { data: [] });
    await pickDueSeeds(30);
    const query = fake.queriesFor("discovery_seeds")[0];
    expect(callsOf(query, "order")).toEqual([
      ["priority", { ascending: true }],
      ["last_run_at", { ascending: true, nullsFirst: true }],
    ]);
    expect(callsOf(query, "limit")).toEqual([[30]]);
  });
});

describe("addUserSearchSeed", () => {
  it("upserts the normalised keyword without overwriting an existing seed", async () => {
    fake.on("discovery_seeds", { data: [{ id: "s" }] });
    await addUserSearchSeed("Stoic  Philosophy");
    const query = fake.queriesFor("discovery_seeds")[0];
    expect(callsOf(query, "upsert")[0]).toEqual([
      [{ keyword: "stoic philosophy", source: "user_search", priority: 5 }],
      { onConflict: "keyword", ignoreDuplicates: true },
    ]);
  });

  it("never throws into the user's search", async () => {
    fake.on("discovery_seeds", { data: null, error: { message: "boom" } });
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(addUserSearchSeed("anything")).resolves.toBeUndefined();
    spy.mockRestore();
  });
});

describe("addExpansionSeeds", () => {
  it("respects the 20-per-day cap", async () => {
    fake.on("discovery_seeds", { count: 19 }, { data: [{ id: "s" }] });
    const added = await addExpansionSeeds(
      ["one", "two", "three"],
      new Date("2026-09-26T22:00:00Z"),
    );
    expect(added).toBe(1);
    const insert = callsOf(fake.queriesFor("discovery_seeds")[1], "upsert")[0]?.[0];
    expect(insert).toEqual([{ keyword: "one", source: "expansion", priority: 8 }]);
  });

  it("adds nothing once the cap is reached", async () => {
    fake.on("discovery_seeds", { count: 20 });
    expect(await addExpansionSeeds(["one"])).toBe(0);
    expect(fake.queriesFor("discovery_seeds")).toHaveLength(1);
  });
});
