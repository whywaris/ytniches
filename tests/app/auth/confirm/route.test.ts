import { beforeEach, describe, expect, it, vi } from "vitest";

// D-083: where verification and password-reset email links land.

const verifyOtp = vi.fn();
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth: { verifyOtp } }) }));

const cookieSet = vi.fn();
vi.mock("next/headers", () => ({ cookies: async () => ({ set: cookieSet }) }));

const postAuthPath = vi.fn();
vi.mock("@/lib/auth/post-auth", () => ({
  postAuthPath: (...args: unknown[]) => postAuthPath(...args),
}));

const { GET } = await import("@/app/auth/confirm/route");
const { RECOVERY_COOKIE } = await import("@/lib/auth/forms");

const at = (query: string) => new Request(`https://ytniches.test/auth/confirm?${query}`);

beforeEach(() => {
  vi.clearAllMocks();
  postAuthPath.mockResolvedValue("/onboarding");
});

describe("GET /auth/confirm", () => {
  it("verifies a sign-up link and takes the same path as Google (onboarding first)", async () => {
    const user = { id: "u1" };
    verifyOtp.mockResolvedValue({ data: { user }, error: null });

    const response = await GET(at("token_hash=h1&type=email&next=%2Fniches"));

    expect(verifyOtp).toHaveBeenCalledWith({ type: "email", token_hash: "h1" });
    expect(postAuthPath).toHaveBeenCalledWith(user, "/niches");
    expect(response.headers.get("location")).toBe("https://ytniches.test/onboarding");
  });

  it("sends a reset link to /reset-password with the recovery cookie", async () => {
    verifyOtp.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });

    const response = await GET(at("token_hash=h2&type=recovery&next=%2Freset-password"));

    expect(response.headers.get("location")).toBe("https://ytniches.test/reset-password");
    expect(cookieSet).toHaveBeenCalledWith(
      RECOVERY_COOKIE,
      "1",
      expect.objectContaining({ httpOnly: true, maxAge: 900 }),
    );
    expect(postAuthPath).not.toHaveBeenCalled();
  });

  it("an expired or used link goes back with a clear message", async () => {
    verifyOtp.mockResolvedValue({ data: { user: null }, error: { code: "otp_expired" } });
    expect((await GET(at("token_hash=h&type=email"))).headers.get("location")).toBe(
      "https://ytniches.test/login?error=link_expired",
    );
    expect((await GET(at("token_hash=h&type=recovery"))).headers.get("location")).toBe(
      "https://ytniches.test/forgot-password?error=link_expired",
    );
  });

  it("ignores links with an unknown type or no token", async () => {
    await GET(at("token_hash=h&type=magiclink"));
    await GET(at("type=email"));
    expect(verifyOtp).not.toHaveBeenCalled();
  });

  it("a suspended account goes to /suspended", async () => {
    verifyOtp.mockResolvedValue({ data: { user: null }, error: { code: "user_banned" } });
    expect((await GET(at("token_hash=h&type=email"))).headers.get("location")).toBe(
      "https://ytniches.test/suspended",
    );
  });
});
