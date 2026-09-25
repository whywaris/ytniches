import { beforeEach, describe, expect, it, vi } from "vitest";

const limit = vi.fn();
vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: Object.assign(
    class {
      limit = limit;
    },
    { slidingWindow: vi.fn() },
  ),
}));
vi.mock("@/lib/cache/redis", () => ({ getRedis: vi.fn() }));

const create = vi.fn();
const add = vi.fn();
let resendConfigured = true;
vi.mock("@/lib/email/client", () => ({
  getResendClient: () =>
    resendConfigured ? { contacts: { create, segments: { add } } } : undefined,
}));

const { subscribeToNewsletter } = await import("@/lib/services/newsletter");

beforeEach(() => {
  vi.clearAllMocks();
  resendConfigured = true;
  vi.stubEnv("RESEND_NEWSLETTER_SEGMENT_ID", "seg_1");
  limit.mockResolvedValue({ success: true });
  create.mockResolvedValue({ data: { id: "c1" }, error: null });
});

describe("subscribeToNewsletter", () => {
  it("adds the email as a Resend contact in the Newsletter segment", async () => {
    expect(await subscribeToNewsletter("a@b.co", "1.1.1.1")).toEqual({
      ok: true,
      value: undefined,
    });
    expect(create).toHaveBeenCalledWith({ email: "a@b.co", segments: [{ id: "seg_1" }] });
  });

  it("is unavailable (not a crash) without a segment id or Resend key", async () => {
    vi.stubEnv("RESEND_NEWSLETTER_SEGMENT_ID", "");
    expect(await subscribeToNewsletter("a@b.co", "ip")).toEqual({
      ok: false,
      error: { type: "unavailable" },
    });
    vi.stubEnv("RESEND_NEWSLETTER_SEGMENT_ID", "seg_1");
    resendConfigured = false;
    expect((await subscribeToNewsletter("a@b.co", "ip")).ok).toBe(false);
    expect(create).not.toHaveBeenCalled();
  });

  it("rate-limits per IP before calling Resend", async () => {
    limit.mockResolvedValue({ success: false });
    expect(await subscribeToNewsletter("a@b.co", "ip")).toEqual({
      ok: false,
      error: { type: "rate_limited" },
    });
    expect(limit).toHaveBeenCalledWith("ip");
    expect(create).not.toHaveBeenCalled();
  });

  it("adds an existing contact to the segment instead, with the same success reply", async () => {
    create.mockResolvedValue({ data: null, error: { message: "Contact already exists" } });
    add.mockResolvedValue({ data: { id: "seg_1" }, error: null });
    expect((await subscribeToNewsletter("a@b.co", "ip")).ok).toBe(true);
    expect(add).toHaveBeenCalledWith({ email: "a@b.co", segmentId: "seg_1" });
  });

  it("fails when both Resend calls fail", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    create.mockResolvedValue({ data: null, error: { message: "x" } });
    add.mockResolvedValue({ data: null, error: { message: "y" } });
    expect(await subscribeToNewsletter("a@b.co", "ip")).toEqual({
      ok: false,
      error: { type: "failed" },
    });
  });
});
