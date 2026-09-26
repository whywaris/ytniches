import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const incrby = vi.fn();
const expire = vi.fn();
const mget = vi.fn();
const get = vi.fn();

vi.mock("@/lib/cache/redis", () => ({
  getRedis: () => ({ incrby, expire, mget, get }),
}));

const {
  checkAndIncrement,
  getJobDailyBudget,
  getQuotaBySource,
  getQuotaHistory,
  hasJobBudget,
  withQuotaSource,
} = await import("@/lib/youtube/quota");

// The per-source attribution counter is a second INCRBY; these tests are
// about the total counter unless they say otherwise.
const totalCalls = () =>
  incrby.mock.calls.filter(([key]) => /^quota:youtube:\d{4}-\d{2}-\d{2}$/.test(String(key)));

beforeEach(() => {
  incrby.mockReset();
  expire.mockReset();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-21T12:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("checkAndIncrement", () => {
  it("allows the first call and reports the incremented total", async () => {
    incrby.mockResolvedValueOnce(100);

    const result = await checkAndIncrement(100);

    expect(result).toEqual({ allowed: true, used: 100 });
    expect(incrby).toHaveBeenCalledWith("quota:youtube:2026-09-21", 100);
  });

  it("increments by cost via INCRBY, not one-by-one via INCR", async () => {
    incrby.mockResolvedValueOnce(9600);

    await checkAndIncrement(100);

    expect(totalCalls()).toEqual([["quota:youtube:2026-09-21", 100]]);
  });

  it("warns without blocking once past the soft limit (9,500)", async () => {
    incrby.mockResolvedValueOnce(9600);

    const result = await checkAndIncrement(100);

    expect(result).toEqual({ allowed: true, used: 9600, warning: true });
  });

  it("does not warn exactly at the soft limit boundary (9,500)", async () => {
    incrby.mockResolvedValueOnce(9500);

    const result = await checkAndIncrement(100);

    expect(result).toEqual({ allowed: true, used: 9500 });
  });

  it("blocks once past the hard limit (10,000)", async () => {
    incrby.mockResolvedValueOnce(10001);

    const result = await checkAndIncrement(100);

    expect(result).toEqual({ allowed: false, used: 10001 });
  });

  it("still allows (with warning) exactly at the hard limit boundary (10,000)", async () => {
    incrby.mockResolvedValueOnce(10000);

    const result = await checkAndIncrement(100);

    expect(result).toEqual({ allowed: true, used: 10000, warning: true });
  });

  it("keeps each day's counter for 8 days (admin 7-day trend)", async () => {
    incrby.mockResolvedValueOnce(100);

    await checkAndIncrement(100);

    expect(expire).toHaveBeenCalledWith("quota:youtube:2026-09-21", 8 * 24 * 60 * 60);
  });

  it("uses a different key on a different UTC date", async () => {
    incrby.mockResolvedValueOnce(100);
    await checkAndIncrement(100);
    expect(totalCalls().at(-1)).toEqual(["quota:youtube:2026-09-21", 100]);

    vi.setSystemTime(new Date("2026-09-22T00:00:01Z"));
    incrby.mockResolvedValueOnce(50);
    await checkAndIncrement(50);
    expect(totalCalls().at(-1)).toEqual(["quota:youtube:2026-09-22", 50]);
  });

  it("attributes units to the ambient source, 'app' by default", async () => {
    incrby.mockResolvedValue(100);
    await checkAndIncrement(100);
    await withQuotaSource("enrichment", () => checkAndIncrement(3));

    expect(incrby).toHaveBeenCalledWith("quota:youtube:2026-09-21:app", 100);
    expect(incrby).toHaveBeenCalledWith("quota:youtube:2026-09-21:enrichment", 3);
    expect(expire).toHaveBeenCalledWith("quota:youtube:2026-09-21:enrichment", 8 * 24 * 60 * 60);
  });
});

describe("getQuotaHistory", () => {
  it("reads one key per day, oldest first, missing days as 0", async () => {
    mget.mockResolvedValueOnce([null, "120", 9600]);

    const history = await getQuotaHistory(3);

    expect(mget).toHaveBeenCalledWith(
      "quota:youtube:2026-09-19",
      "quota:youtube:2026-09-20",
      "quota:youtube:2026-09-21",
    );
    expect(history).toEqual([
      { date: "2026-09-19", used: 0 },
      { date: "2026-09-20", used: 120 },
      { date: "2026-09-21", used: 9600 },
    ]);
  });
});

describe("getQuotaBySource", () => {
  it("reads every source's counter for the day", async () => {
    mget.mockResolvedValueOnce(["300", null, 12, 0, "40", null]);

    const bySource = await getQuotaBySource();

    expect(mget).toHaveBeenCalledWith(
      "quota:youtube:2026-09-21:search",
      "quota:youtube:2026-09-21:free_tools",
      "quota:youtube:2026-09-21:channel_sync",
      "quota:youtube:2026-09-21:discovery",
      "quota:youtube:2026-09-21:enrichment",
      "quota:youtube:2026-09-21:app",
    );
    expect(bySource).toEqual({
      search: 300,
      free_tools: 0,
      channel_sync: 12,
      discovery: 0,
      enrichment: 40,
      app: 0,
    });
  });
});

describe("job budget", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults to the daily limit minus the 500-unit live-search buffer", () => {
    expect(getJobDailyBudget()).toBe(9_500);
  });

  it("DISCOVERY_DAILY_BUDGET can lower it but never eat the buffer", () => {
    vi.stubEnv("DISCOVERY_DAILY_BUDGET", "4000");
    expect(getJobDailyBudget()).toBe(4_000);
    vi.stubEnv("DISCOVERY_DAILY_BUDGET", "20000");
    expect(getJobDailyBudget()).toBe(9_500);
    vi.stubEnv("DISCOVERY_DAILY_BUDGET", "nonsense");
    expect(getJobDailyBudget()).toBe(9_500);
  });

  it("allows a call only if it stays within the budget", async () => {
    get.mockResolvedValueOnce("9400");
    expect(await hasJobBudget(100)).toBe(true);
    get.mockResolvedValueOnce("9401");
    expect(await hasJobBudget(100)).toBe(false);
    get.mockResolvedValueOnce(null);
    expect(await hasJobBudget(100)).toBe(true);
  });
});

describe("free tools cutoff", () => {
  it("is 70% of the daily limit", async () => {
    const { FREE_TOOLS_QUOTA_CUTOFF, DAILY_QUOTA_LIMIT } = await import("@/lib/youtube/quota");
    expect(FREE_TOOLS_QUOTA_CUTOFF).toBe(DAILY_QUOTA_LIMIT * 0.7);
  });
});
