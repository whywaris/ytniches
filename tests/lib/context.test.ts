import { beforeEach, describe, expect, it, vi } from "vitest";

let authUser: { id: string } | null = { id: "user-1" };
const getUser = vi.fn(async () => ({ data: { user: authUser } }));
const getCookie = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { getUser } })),
  getCookie: (...args: unknown[]) => getCookie(...args),
}));

const resolveTier = vi.fn();
vi.mock("@/lib/billing/tier-cache", () => ({
  resolveTier: (...args: unknown[]) => resolveTier(...args),
}));

const { getRequestContext, UnauthenticatedError } = await import("@/lib/context");

beforeEach(() => {
  authUser = { id: "user-1" };
  getCookie.mockReset();
  getCookie.mockResolvedValue(null);
  resolveTier.mockReset();
  resolveTier.mockResolvedValue(null);
});

describe("getRequestContext", () => {
  it("throws UnauthenticatedError when no session exists", async () => {
    authUser = null;
    await expect(getRequestContext()).rejects.toThrow(UnauthenticatedError);
  });

  it("reads workspaceId from the workspace-id cookie", async () => {
    getCookie.mockResolvedValue("workspace-1");
    const ctx = await getRequestContext();
    expect(ctx.workspaceId).toBe("workspace-1");
    expect(getCookie).toHaveBeenCalledWith("workspace-id");
  });

  it("defaults workspaceId to null when the cookie is absent", async () => {
    const ctx = await getRequestContext();
    expect(ctx.workspaceId).toBeNull();
  });

  it("resolves tier via lib/billing/tier-cache for the authenticated user", async () => {
    resolveTier.mockResolvedValue("pro");
    const ctx = await getRequestContext();
    expect(ctx.tier).toBe("pro");
    expect(resolveTier).toHaveBeenCalledWith("user-1");
  });
});
