import { beforeEach, describe, expect, it, vi } from "vitest";

const store = new Map<string, string>();
const redisSet = vi.fn(async (key: string, value: string) => {
  store.set(key, value);
});
vi.mock("@/lib/cache/redis", () => ({
  getRedis: () => ({ get: async (key: string) => store.get(key) ?? null, set: redisSet }),
}));

const consume = vi.fn();
vi.mock("@/lib/credits", () => ({ consume: (...args: unknown[]) => consume(...args) }));

const { billableFilters, isFilteredViewUnlocked, unlockFilteredView } =
  await import("@/lib/services/feed-credits");

const ctx = { userId: "u1", workspaceId: null, tier: null };

beforeEach(() => {
  store.clear();
  vi.clearAllMocks();
  consume.mockResolvedValue({ ok: true, value: undefined });
});

describe("billableFilters (D-072)", () => {
  it("default view, sort, page and a niche-only filter are free", () => {
    expect(billableFilters({})).toBeNull();
    expect(billableFilters({ sort: "avg_views", page: "3" })).toBeNull();
    expect(billableFilters({ niche: "mafia-history", sort: "newest" })).toBeNull();
  });

  it("any other filter is billable, niche included alongside it, keys sorted", () => {
    expect(billableFilters({ minSubs: "1000", niche: "mafia-history", page: "2" })).toEqual({
      minSubs: "1000",
      niche: "mafia-history",
    });
    expect(billableFilters({ faceless: "1" })).toEqual({ faceless: "1" });
  });
});

describe("unlockFilteredView", () => {
  it("charges 1 credit once, with the client's idempotency key, then is free for 24h", async () => {
    const values = { faceless: "1", sort: "newest" };
    expect(await isFilteredViewUnlocked(ctx, "channels", values)).toBe(false);

    expect(await unlockFilteredView(ctx, "channels", values, "key-1")).toEqual({
      ok: true,
      value: { charged: true },
    });
    expect(consume).toHaveBeenCalledWith(ctx, 1, "Filtered niche search", "key-1");
    expect(redisSet).toHaveBeenCalledWith(expect.stringMatching(/^feed-unlock:u1:/), "1", {
      ex: 24 * 60 * 60,
    });

    // Re-run, re-sort or page: same billable filters -> free.
    expect(await isFilteredViewUnlocked(ctx, "channels", { ...values, sort: "avg_views" })).toBe(
      true,
    );
    expect(await unlockFilteredView(ctx, "channels", values, "key-2")).toEqual({
      ok: true,
      value: { charged: false },
    });
    expect(consume).toHaveBeenCalledTimes(1);
  });

  it("is per user, per tab and per filter set", async () => {
    await unlockFilteredView(ctx, "channels", { faceless: "1" }, "k");
    expect(
      await isFilteredViewUnlocked({ ...ctx, userId: "u2" }, "channels", { faceless: "1" }),
    ).toBe(false);
    expect(await isFilteredViewUnlocked(ctx, "outliers", { faceless: "1" })).toBe(false);
    expect(await isFilteredViewUnlocked(ctx, "channels", { faceless: "1", noKids: "1" })).toBe(
      false,
    );
  });

  it("never charges for a free view", async () => {
    expect(await unlockFilteredView(ctx, "niches", { niche: "x" }, "k")).toEqual({
      ok: true,
      value: { charged: false },
    });
    expect(consume).not.toHaveBeenCalled();
  });

  it("returns insufficient_credits without unlocking", async () => {
    consume.mockResolvedValue({
      ok: false,
      error: { type: "insufficient_credits", balance: 0, required: 1 },
    });
    const result = await unlockFilteredView(ctx, "channels", { faceless: "1" }, "k");
    expect(result).toEqual({
      ok: false,
      error: { type: "insufficient_credits", balance: 0, required: 1 },
    });
    expect(redisSet).not.toHaveBeenCalled();
  });
});
