import { beforeEach, describe, expect, it, vi } from "vitest";

const getRequestContext = vi.fn();
vi.mock("@/lib/context", () => ({
  getRequestContext: (...args: unknown[]) => getRequestContext(...args),
}));

const searchNiches = vi.fn();
const saveChannelToTracking = vi.fn();
vi.mock("@/lib/services/channels", () => ({
  searchNiches: (...args: unknown[]) => searchNiches(...args),
  saveChannelToTracking: (...args: unknown[]) => saveChannelToTracking(...args),
}));

const { searchNichesAction, saveChannelAction } = await import("@/app/(app)/niches/actions");

const ctx = { userId: "user-1" };

beforeEach(() => {
  vi.clearAllMocks();
  getRequestContext.mockResolvedValue(ctx);
});

describe("searchNichesAction", () => {
  it("rejects invalid input without calling getRequestContext or the service", async () => {
    const result = await searchNichesAction({ subscribersMin: -5 }, "key-1");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe("validation_error");
      if (result.error.type === "validation_error") {
        expect(result.error.fields.subscribersMin).toBeTruthy();
      }
    }
    expect(getRequestContext).not.toHaveBeenCalled();
    expect(searchNiches).not.toHaveBeenCalled();
  });

  it("rejects unknown fields (.strict())", async () => {
    const result = await searchNichesAction({ keyword: "x", notARealField: true }, "key-1");

    expect(result.ok).toBe(false);
    expect(searchNiches).not.toHaveBeenCalled();
  });

  it("rejects an invalid enum value", async () => {
    const result = await searchNichesAction({ uploadFrequency: "hourly" }, "key-1");

    expect(result.ok).toBe(false);
    if (!result.ok && result.error.type === "validation_error") {
      expect(result.error.fields.uploadFrequency).toBeTruthy();
    }
  });

  it("applies schema defaults and calls the service with the parsed filters and idempotency key", async () => {
    searchNiches.mockResolvedValueOnce({ ok: true, value: [] });

    const result = await searchNichesAction({ keyword: "sleep music" }, "key-1");

    expect(getRequestContext).toHaveBeenCalledOnce();
    expect(searchNiches).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        keyword: "sleep music",
        uploadFrequency: "any",
        monetized: "any",
        sort: "relevance",
        page: 1,
      }),
      "key-1",
    );
    expect(result).toEqual({ ok: true, value: [] });
  });

  it("returns the service's Result untouched on failure, without wrapping or rethrowing", async () => {
    searchNiches.mockResolvedValueOnce({ ok: false, error: { type: "quota_exhausted" } });

    const result = await searchNichesAction({}, "key-1");

    expect(result).toEqual({ ok: false, error: { type: "quota_exhausted" } });
  });
});

describe("saveChannelAction", () => {
  it("gets the request context and delegates to the service", async () => {
    saveChannelToTracking.mockResolvedValueOnce({ ok: true, value: undefined });

    const result = await saveChannelAction("channel-1");

    expect(getRequestContext).toHaveBeenCalledOnce();
    expect(saveChannelToTracking).toHaveBeenCalledWith(ctx, "channel-1");
    expect(result).toEqual({ ok: true, value: undefined });
  });

  it("returns the service's error Result untouched", async () => {
    saveChannelToTracking.mockResolvedValueOnce({
      ok: false,
      error: { type: "tier_limit", limit: 10, current: 10 },
    });

    const result = await saveChannelAction("channel-1");

    expect(result).toEqual({ ok: false, error: { type: "tier_limit", limit: 10, current: 10 } });
  });
});
