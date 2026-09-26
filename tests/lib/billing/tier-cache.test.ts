import { beforeEach, describe, expect, it, vi } from "vitest";

// resolveTier resolves the *effective* tier (D-059); effective-plan.ts has
// its own tests for the workspace rules, so it's mocked here.
const getEffectivePlan = vi.fn();
vi.mock("@/lib/billing/effective-plan", () => ({
  getEffectivePlan: (userId: string) => getEffectivePlan(userId),
}));

const redisGet = vi.fn();
const redisSet = vi.fn();
const redisDel = vi.fn();
vi.mock("@/lib/cache/redis", () => ({
  getRedis: vi.fn(() => ({ get: redisGet, set: redisSet, del: redisDel })),
}));

const { resolveTier, invalidateTierCache } = await import("@/lib/billing/tier-cache");

const plan = (tier: string | null) => ({
  tier,
  status: tier ? "active" : null,
  teamWorkspaceId: null,
});

beforeEach(() => {
  getEffectivePlan.mockReset();
  getEffectivePlan.mockResolvedValue(plan(null));
  redisGet.mockReset();
  redisGet.mockResolvedValue(null);
  redisSet.mockReset();
  redisDel.mockReset();
});

describe("resolveTier", () => {
  it("returns the cached tier without resolving the plan", async () => {
    redisGet.mockResolvedValue("pro");
    expect(await resolveTier("user-1")).toBe("pro");
    expect(getEffectivePlan).not.toHaveBeenCalled();
  });

  it("treats the cached 'none' sentinel as no active subscription", async () => {
    redisGet.mockResolvedValue("none");
    expect(await resolveTier("user-1")).toBeNull();
  });

  it("resolves the effective tier and caches it on a cache miss", async () => {
    getEffectivePlan.mockResolvedValue(plan("team"));
    expect(await resolveTier("user-1")).toBe("team");
    expect(getEffectivePlan).toHaveBeenCalledWith("user-1");
    expect(redisSet).toHaveBeenCalledWith("session:tier:user-1", "team", { ex: 60 });
  });

  it("caches the 'none' sentinel when there's no plan", async () => {
    await resolveTier("user-1");
    expect(redisSet).toHaveBeenCalledWith("session:tier:user-1", "none", { ex: 60 });
  });

  it("propagates a lookup error", async () => {
    getEffectivePlan.mockRejectedValue(new Error("connection reset"));
    await expect(resolveTier("user-1")).rejects.toThrow("connection reset");
  });
});

describe("invalidateTierCache", () => {
  it("deletes the tier cache key for the given user", async () => {
    await invalidateTierCache("user-1");
    expect(redisDel).toHaveBeenCalledWith("session:tier:user-1");
  });
});
