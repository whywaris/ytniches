import { beforeEach, describe, expect, it, vi } from "vitest";

let subscriptionResult: { data: { tier: string } | null; error: { message: string } | null } = {
  data: null,
  error: null,
};
const maybeSingleSpy = vi.fn(() => Promise.resolve(subscriptionResult));

function makeSubscriptionsSelectBuilder() {
  const builder = {
    eq: vi.fn(() => builder),
    maybeSingle: maybeSingleSpy,
  };
  return builder;
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: vi.fn(() => ({ select: vi.fn(() => makeSubscriptionsSelectBuilder()) })),
  }),
}));

const redisGet = vi.fn();
const redisSet = vi.fn();
const redisDel = vi.fn();
vi.mock("@/lib/cache/redis", () => ({
  getRedis: vi.fn(() => ({ get: redisGet, set: redisSet, del: redisDel })),
}));

const { resolveTier, invalidateTierCache } = await import("@/lib/billing/tier-cache");

beforeEach(() => {
  subscriptionResult = { data: null, error: null };
  maybeSingleSpy.mockClear();
  redisGet.mockReset();
  redisGet.mockResolvedValue(null);
  redisSet.mockReset();
  redisDel.mockReset();
});

describe("resolveTier", () => {
  it("returns the cached tier without querying subscriptions", async () => {
    redisGet.mockResolvedValue("pro");
    expect(await resolveTier("user-1")).toBe("pro");
    expect(maybeSingleSpy).not.toHaveBeenCalled();
  });

  it("treats the cached 'none' sentinel as no active subscription", async () => {
    redisGet.mockResolvedValue("none");
    expect(await resolveTier("user-1")).toBeNull();
  });

  it("queries subscriptions and caches the result on a cache miss", async () => {
    subscriptionResult = { data: { tier: "team" }, error: null };
    expect(await resolveTier("user-1")).toBe("team");
    expect(redisSet).toHaveBeenCalledWith("session:tier:user-1", "team", { ex: 60 });
  });

  it("caches the 'none' sentinel when no current subscription row exists", async () => {
    subscriptionResult = { data: null, error: null };
    await resolveTier("user-1");
    expect(redisSet).toHaveBeenCalledWith("session:tier:user-1", "none", { ex: 60 });
  });

  it("treats a legacy/unknown tier value as no active subscription", async () => {
    subscriptionResult = { data: { tier: "free" }, error: null };
    expect(await resolveTier("user-1")).toBeNull();
  });

  it("throws on a subscriptions query error", async () => {
    subscriptionResult = { data: null, error: { message: "connection reset" } };
    await expect(resolveTier("user-1")).rejects.toThrow("connection reset");
  });
});

describe("invalidateTierCache", () => {
  it("deletes the tier cache key for the given user", async () => {
    await invalidateTierCache("user-1");
    expect(redisDel).toHaveBeenCalledWith("session:tier:user-1");
  });
});
