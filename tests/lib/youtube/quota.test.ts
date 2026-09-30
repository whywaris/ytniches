import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// In-memory Redis double: INCRBY/GET/MGET over one map, so budget checks
// see the same counters checkAndIncrement writes.
const store = new Map<string, number>();
const incrby = vi.fn(async (key: string, by: number) => {
  const next = (store.get(key) ?? 0) + by;
  store.set(key, next);
  return next;
});
const expire = vi.fn();
const get = vi.fn(async (key: string) => store.get(key) ?? null);
const mget = vi.fn(async (...keys: string[]) => keys.map((key) => store.get(key) ?? null));

vi.mock("@/lib/cache/redis", () => ({
  getRedis: () => ({ incrby, expire, mget, get }),
}));

const {
  checkAndIncrement,
  getCategoryUsed,
  getQuotaBudgets,
  getQuotaByCategory,
  getQuotaBySource,
  getQuotaHistory,
  hasJobBudget,
  quotaDay,
  withQuotaSource,
  DAILY_QUOTA_LIMIT,
} = await import("@/lib/youtube/quota");

// 2026-09-21 12:00 UTC is 05:00 on 2026-09-21 in Los Angeles (PDT, UTC-7).
const NOON_UTC = new Date("2026-09-21T12:00:00Z");

beforeEach(() => {
  store.clear();
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(NOON_UTC);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("Pacific quota day (D-076)", () => {
  it("rolls over at midnight Los Angeles, not midnight UTC", () => {
    // 06:59 UTC on the 22nd is still 23:59 on the 21st in LA.
    expect(quotaDay(new Date("2026-09-22T06:59:00Z"))).toBe("2026-09-21");
    expect(quotaDay(new Date("2026-09-22T07:00:00Z"))).toBe("2026-09-22");
  });

  it("keys every counter by the Pacific day", async () => {
    vi.setSystemTime(new Date("2026-09-22T03:00:00Z")); // 20:00 on the 21st in LA
    await checkAndIncrement(100);
    expect(incrby).toHaveBeenCalledWith("quota:youtube:2026-09-21", 100);
    expect(incrby).toHaveBeenCalledWith("quota:youtube:2026-09-21:cat:live", 100);
    expect(incrby).toHaveBeenCalledWith("quota:youtube:2026-09-21:app", 100);
    expect(expire).toHaveBeenCalledWith("quota:youtube:2026-09-21", 8 * 24 * 60 * 60);
  });

  it("reads history as Pacific days, oldest first, missing days as 0", async () => {
    store.set("quota:youtube:2026-09-20", 120);
    store.set("quota:youtube:2026-09-21", 9600);

    const history = await getQuotaHistory(3);

    expect(history).toEqual([
      { date: "2026-09-19", used: 0 },
      { date: "2026-09-20", used: 120 },
      { date: "2026-09-21", used: 9600 },
    ]);
  });
});

describe("per-category budgets (D-075)", () => {
  it("defaults to live 3500 / sync 2000 / free tools 1500 / discovery 3000", () => {
    expect(getQuotaBudgets()).toEqual({
      live: 3_500,
      sync: 2_000,
      free_tools: 1_500,
      discovery: 3_000,
    });
  });

  it("reads env overrides, ignores junk, never exceeds the daily limit", () => {
    vi.stubEnv("DISCOVERY_DAILY_BUDGET", "1200");
    vi.stubEnv("YT_BUDGET_FREE_TOOLS", "nonsense");
    vi.stubEnv("YT_BUDGET_LIVE", "50000");
    expect(getQuotaBudgets()).toMatchObject({
      discovery: 1_200,
      free_tools: 1_500,
      live: DAILY_QUOTA_LIMIT,
    });
  });

  it("maps each source to its category", async () => {
    await withQuotaSource("search", () => checkAndIncrement(100));
    await withQuotaSource("channel_sync", () => checkAndIncrement(2));
    await withQuotaSource("free_tools", () => checkAndIncrement(1));
    await withQuotaSource("discovery", () => checkAndIncrement(100));
    await withQuotaSource("enrichment", () => checkAndIncrement(5));

    const byCategory = await getQuotaByCategory();
    expect(byCategory).toEqual({
      live: { used: 100, budget: 3_500 },
      sync: { used: 2, budget: 2_000 },
      free_tools: { used: 1, budget: 1_500 },
      discovery: { used: 105, budget: 3_000 },
    });
    expect(await getQuotaBySource()).toMatchObject({ discovery: 100, enrichment: 5 });
  });

  it("refuses a call once its own category is over budget", async () => {
    store.set("quota:youtube:2026-09-21:cat:free_tools", 1_500);
    const result = await withQuotaSource("free_tools", () => checkAndIncrement(1));
    expect(result.allowed).toBe(false);
  });

  it("the crawler spending its whole budget leaves free tools and live search untouched", async () => {
    await withQuotaSource("discovery", () => checkAndIncrement(3_000));

    expect(await hasJobBudget(1)).toBe(false);
    expect(await getCategoryUsed("free_tools")).toBe(0);
    expect((await withQuotaSource("free_tools", () => checkAndIncrement(1))).allowed).toBe(true);
    expect((await withQuotaSource("search", () => checkAndIncrement(100))).allowed).toBe(true);
  });

  it("still refuses everything once the day's total is spent", async () => {
    store.set("quota:youtube:2026-09-21", DAILY_QUOTA_LIMIT);
    expect((await withQuotaSource("search", () => checkAndIncrement(100))).allowed).toBe(false);
    expect(await hasJobBudget(1)).toBe(false);
  });

  it("warns without blocking past the soft limit", async () => {
    store.set("quota:youtube:2026-09-21", 9_450);
    expect(await checkAndIncrement(100)).toEqual({ allowed: true, used: 9_550, warning: true });
  });
});

describe("hasJobBudget", () => {
  it("checks the discovery category before spending", async () => {
    store.set("quota:youtube:2026-09-21:cat:discovery", 2_900);
    expect(await hasJobBudget(100)).toBe(true);
    expect(await hasJobBudget(101)).toBe(false);
    expect(incrby).not.toHaveBeenCalled();
  });
});
