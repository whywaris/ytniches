import { beforeEach, describe, expect, it, vi } from "vitest";

// Security.md §2.4 / D-083 lockout, against an in-memory stand-in for the
// few Upstash commands it uses.
const store = new Map<string, string>();
const redis = {
  exists: vi.fn(async (key: string) => (store.has(key) ? 1 : 0)),
  incr: vi.fn(async (key: string) => {
    const next = Number(store.get(key) ?? 0) + 1;
    store.set(key, String(next));
    return next;
  }),
  expire: vi.fn(async () => 1),
  set: vi.fn(async (key: string, value: string, options?: { nx?: boolean }) => {
    if (options?.nx && store.has(key)) return null;
    store.set(key, value);
    return "OK";
  }),
  del: vi.fn(async (key: string) => (store.delete(key) ? 1 : 0)),
};
vi.mock("@/lib/cache/redis", () => ({ getRedis: () => redis }));
vi.mock("@upstash/ratelimit", () => ({ Ratelimit: class {} }));

const { clearFailures, isLocked, LOCKOUT_MAX_FAILURES, recordFailure } =
  await import("@/lib/auth/lockout");

beforeEach(() => {
  store.clear();
  vi.clearAllMocks();
});

describe("login lockout", () => {
  it("locks an email on the 5th failure within the window", async () => {
    for (let i = 1; i < LOCKOUT_MAX_FAILURES; i += 1) {
      expect(await recordFailure("a@b.co")).toEqual({ locked: false, sendAlert: false });
    }
    expect(await isLocked("a@b.co")).toBe(false);
    expect(await recordFailure("a@b.co")).toEqual({ locked: true, sendAlert: true });
    expect(await isLocked("a@b.co")).toBe(true);
  });

  it("alerts at most once per lockout window", async () => {
    for (let i = 0; i < LOCKOUT_MAX_FAILURES; i += 1) await recordFailure("a@b.co");
    expect(await recordFailure("a@b.co")).toEqual({ locked: true, sendAlert: false });
    expect(await recordFailure("a@b.co")).toEqual({ locked: true, sendAlert: false });
  });

  it("is per email, case-insensitive, and stores no address", async () => {
    for (let i = 0; i < LOCKOUT_MAX_FAILURES; i += 1) await recordFailure("A@B.co");
    expect(await isLocked("a@b.co")).toBe(true);
    expect(await isLocked("other@b.co")).toBe(false);
    expect([...store.keys()].join(" ")).not.toContain("b.co");
  });

  it("a successful sign-in clears the failure count", async () => {
    for (let i = 1; i < LOCKOUT_MAX_FAILURES; i += 1) await recordFailure("a@b.co");
    await clearFailures("a@b.co");
    expect(await recordFailure("a@b.co")).toEqual({ locked: false, sendAlert: false });
  });

  it("sets the 15-minute window on the first failure only", async () => {
    await recordFailure("a@b.co");
    await recordFailure("a@b.co");
    expect(redis.expire).toHaveBeenCalledTimes(1);
    expect(redis.expire).toHaveBeenCalledWith(expect.any(String), 900);
  });
});
