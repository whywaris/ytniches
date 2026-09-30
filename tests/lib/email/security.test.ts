import { beforeEach, describe, expect, it, vi } from "vitest";

// Security.md §2.4: the lockout alert goes only to an address with an
// account, from hello@, and never throws.

const send = vi.fn();
vi.mock("@/lib/email/client", () => ({
  getResendClient: () => ({ emails: { send } }),
  SECURITY_FROM_ADDRESS: "YTNiches <hello@ytniches.com>",
}));

const rpc = vi.fn();
vi.mock("@/lib/supabase/service", () => ({ createServiceClient: () => ({ rpc }) }));

const captureException = vi.fn();
vi.mock("@sentry/nextjs", () => ({ captureException: (e: unknown) => captureException(e) }));

const { sendLoginLockAlert } = await import("@/lib/email/security");

beforeEach(() => {
  vi.clearAllMocks();
  send.mockResolvedValue({ data: { id: "e1" }, error: null });
});

describe("sendLoginLockAlert", () => {
  it("emails an existing account with a reset link and the Google note", async () => {
    rpc.mockResolvedValue({ data: true, error: null });

    expect(await sendLoginLockAlert("a@b.co")).toBe(true);

    expect(rpc).toHaveBeenCalledWith("auth_user_exists", { p_email: "a@b.co" });
    const message = send.mock.calls[0]?.[0];
    expect(message).toMatchObject({ from: "YTNiches <hello@ytniches.com>", to: "a@b.co" });
    expect(message.text).toMatch(/15 minutes/);
    expect(message.text).toMatch(/Google still works/);
    expect(message.text).toMatch(/\/forgot-password/);
  });

  it("sends nothing to an address without an account", async () => {
    rpc.mockResolvedValue({ data: false, error: null });
    expect(await sendLoginLockAlert("nobody@b.co")).toBe(false);
    expect(send).not.toHaveBeenCalled();
  });

  it("never throws on a failure", async () => {
    rpc.mockResolvedValue({ data: true, error: null });
    send.mockResolvedValue({ data: null, error: { message: "boom" } });
    expect(await sendLoginLockAlert("a@b.co")).toBe(false);
    expect(captureException).toHaveBeenCalled();
  });
});
