import { NextRequest } from "next/server";

import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();
const single = vi.fn();
const eq = vi.fn(() => ({ single }));
const select = vi.fn(() => ({ eq }));
const from = vi.fn(() => ({ select }));
const rpc = vi.fn(() => Promise.resolve({ data: null, error: null }));

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: { getUser },
    from,
    rpc,
  }),
}));

const { middleware, classifyRoute } = await import("@/middleware");

function makeRequest(pathname: string): NextRequest {
  return new NextRequest(new URL(`https://example.com${pathname}`));
}

beforeEach(() => {
  vi.clearAllMocks();
});

// Regression guard for exactly the bug the Phase 2 exit gate caught live:
// /outliers (added Phase 2 Task 1) was never added to APP_ROUTE_PREFIXES,
// so it fell through to "public" and skipped the auth check entirely --
// an unauthenticated request reached the page and 500'd on
// getRequestContext()'s "middleware already blocked this" assumption,
// instead of cleanly redirecting to /login. One entry per real directory
// under app/(app)/ (not calendar/workspace -- Phase 3, no page yet, but
// already-listed per this file's own "route without a page just 404s"
// design note).
describe("classifyRoute", () => {
  const REAL_APP_ROUTES = [
    "/calendar",
    "/dashboard",
    "/niches",
    "/onboarding",
    "/outliers",
    "/prompts",
    "/settings",
    "/tracking",
    "/workspace",
  ];

  it.each(REAL_APP_ROUTES)("classifies %s as an app route", (pathname) => {
    expect(classifyRoute(pathname)).toBe("app");
  });

  it("classifies a nested path under a real app route as an app route too", () => {
    expect(classifyRoute("/tracking/chan-1")).toBe("app");
    expect(classifyRoute("/settings/notifications")).toBe("app");
    expect(classifyRoute("/workspace/tasks")).toBe("app");
    expect(classifyRoute("/workspace/members")).toBe("app");
  });

  it("classifies /invite as public, not app or a 500", () => {
    expect(classifyRoute("/invite")).toBe("public");
  });
});

describe("middleware onboarding gate", () => {
  it("redirects an onboarding_step=0 user hitting an app route to /onboarding", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    single.mockResolvedValue({ data: { role: "user", onboarding_step: 0 }, error: null });

    const response = await middleware(makeRequest("/dashboard"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://example.com/onboarding");
  });

  it("lets an onboarding_step=5 user through to an app route", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    single.mockResolvedValue({ data: { role: "user", onboarding_step: 5 }, error: null });

    const response = await middleware(makeRequest("/dashboard"));

    expect(response.headers.get("location")).toBeNull();
  });

  it("does not redirect an onboarding_step=0 user already on /onboarding", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    single.mockResolvedValue({ data: { role: "user", onboarding_step: 0 }, error: null });

    const response = await middleware(makeRequest("/onboarding"));

    expect(response.headers.get("location")).toBeNull();
  });

  it("does not redirect a mid-onboarding user (step 2, not 0) away from other app routes", async () => {
    // Per spec the gate is scoped to onboarding_step === 0 specifically
    // (brand-new users), not "< 5" -- someone who started onboarding and
    // navigated away mid-flow isn't forced back onto it by every request.
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    single.mockResolvedValue({ data: { role: "user", onboarding_step: 2 }, error: null });

    const response = await middleware(makeRequest("/prompts"));

    expect(response.headers.get("location")).toBeNull();
  });
});

describe("middleware admin gate (unchanged behavior, shares the profile query)", () => {
  it("still 403s a non-super-admin user on /admin", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    single.mockResolvedValue({ data: { role: "user", onboarding_step: 5 }, error: null });

    const response = await middleware(makeRequest("/admin"));

    expect(response.status).toBe(403);
  });

  it("lets a super_admin through to /admin", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    single.mockResolvedValue({ data: { role: "super_admin", onboarding_step: 5 }, error: null });

    const response = await middleware(makeRequest("/admin"));

    expect(response.status).not.toBe(403);
  });

  it("403s an anonymous visitor to /admin without querying the profile", async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const response = await middleware(makeRequest("/admin"));

    expect(response.status).toBe(403);
    expect(from).not.toHaveBeenCalled();
  });
});

describe("middleware suspension + activity", () => {
  const today = new Date().toISOString().slice(0, 10);

  it("sends a suspended user to /suspended from an app route", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    single.mockResolvedValue({
      data: {
        role: "user",
        onboarding_step: 5,
        suspended_at: "2026-09-24T00:00:00Z",
        last_active_at: null,
      },
      error: null,
    });

    const response = await middleware(makeRequest("/dashboard"));

    expect(response.headers.get("location")).toBe("https://example.com/suspended");
  });

  it("treats the pre-request hook's account_suspended error as suspended", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    single.mockResolvedValue({ data: null, error: { code: "account_suspended" } });

    const response = await middleware(makeRequest("/dashboard"));

    expect(response.headers.get("location")).toBe("https://example.com/suspended");
  });

  it("blocks a suspended super_admin from /admin too", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    single.mockResolvedValue({
      data: {
        role: "super_admin",
        onboarding_step: 5,
        suspended_at: "2026-09-24T00:00:00Z",
        last_active_at: null,
      },
      error: null,
    });

    const response = await middleware(makeRequest("/admin/dashboard"));

    expect(response.headers.get("location")).toBe("https://example.com/suspended");
  });

  it("stamps last_active_at when it isn't today yet", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    single.mockResolvedValue({
      data: {
        role: "user",
        onboarding_step: 5,
        suspended_at: null,
        last_active_at: "2026-01-01T09:00:00+00:00",
      },
      error: null,
    });

    await middleware(makeRequest("/dashboard"));

    expect(rpc).toHaveBeenCalledWith("touch_last_active");
  });

  it("does not stamp again on the same UTC day", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    single.mockResolvedValue({
      data: {
        role: "user",
        onboarding_step: 5,
        suspended_at: null,
        last_active_at: `${today}T00:01:00+00:00`,
      },
      error: null,
    });

    await middleware(makeRequest("/dashboard"));

    expect(rpc).not.toHaveBeenCalled();
  });

  it("leaves /suspended public (no redirect loop)", () => {
    expect(classifyRoute("/suspended")).toBe("public");
  });
});
