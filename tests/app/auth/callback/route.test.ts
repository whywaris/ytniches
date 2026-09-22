import { beforeEach, describe, expect, it, vi } from "vitest";

const exchangeCodeForSession = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { exchangeCodeForSession } }),
}));

const getOnboardingStep = vi.fn();
vi.mock("@/lib/services/onboarding", () => ({
  getOnboardingStep: (...args: unknown[]) => getOnboardingStep(...args),
}));

const { GET } = await import("@/app/auth/callback/route");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /auth/callback", () => {
  it("redirects to /onboarding when the user's onboarding_step is 0", async () => {
    exchangeCodeForSession.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    getOnboardingStep.mockResolvedValue(0);

    const response = await GET(new Request("https://example.com/auth/callback?code=abc"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://example.com/onboarding");
    expect(getOnboardingStep).toHaveBeenCalledWith({ userId: "u1" });
  });

  it("redirects to /dashboard when the user's onboarding_step is 5", async () => {
    exchangeCodeForSession.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    getOnboardingStep.mockResolvedValue(5);

    const response = await GET(new Request("https://example.com/auth/callback?code=abc"));

    expect(response.headers.get("location")).toBe("https://example.com/dashboard");
  });

  it("redirects to /onboarding for any in-progress step, not just 0", async () => {
    exchangeCodeForSession.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    getOnboardingStep.mockResolvedValue(2);

    const response = await GET(new Request("https://example.com/auth/callback?code=abc"));

    expect(response.headers.get("location")).toBe("https://example.com/onboarding");
  });

  it("honors an explicit ?redirect= deep link over the onboarding check", async () => {
    exchangeCodeForSession.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });

    const response = await GET(
      new Request("https://example.com/auth/callback?code=abc&redirect=%2Fprompts"),
    );

    expect(response.headers.get("location")).toBe("https://example.com/prompts");
    expect(getOnboardingStep).not.toHaveBeenCalled();
  });

  it("falls back to the safe default when ?redirect= is unsafe", async () => {
    exchangeCodeForSession.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });

    const response = await GET(
      new Request("https://example.com/auth/callback?code=abc&redirect=https%3A%2F%2Fevil.com"),
    );

    expect(response.headers.get("location")).toBe("https://example.com/dashboard");
  });

  it("redirects to /login with an error when the code exchange fails", async () => {
    exchangeCodeForSession.mockResolvedValue({ data: {}, error: { message: "invalid code" } });

    const response = await GET(new Request("https://example.com/auth/callback?code=bad"));

    expect(response.headers.get("location")).toBe(
      "https://example.com/login?error=auth_callback_failed",
    );
  });

  it("redirects to /login when no code is present", async () => {
    const response = await GET(new Request("https://example.com/auth/callback"));

    expect(response.headers.get("location")).toBe(
      "https://example.com/login?error=auth_callback_failed",
    );
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });
});
