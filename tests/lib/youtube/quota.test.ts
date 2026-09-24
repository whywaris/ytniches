import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const incrby = vi.fn();
const expire = vi.fn();
const mget = vi.fn();

vi.mock("@/lib/cache/redis", () => ({
  getRedis: () => ({ incrby, expire, mget }),
}));

const { checkAndIncrement, getQuotaHistory } = await import("@/lib/youtube/quota");

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

    expect(incrby).toHaveBeenCalledTimes(1);
    expect(incrby).toHaveBeenCalledWith(expect.any(String), 100);
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
    expect(incrby).toHaveBeenLastCalledWith("quota:youtube:2026-09-21", 100);

    vi.setSystemTime(new Date("2026-09-22T00:00:01Z"));
    incrby.mockResolvedValueOnce(50);
    await checkAndIncrement(50);
    expect(incrby).toHaveBeenLastCalledWith("quota:youtube:2026-09-22", 50);
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
