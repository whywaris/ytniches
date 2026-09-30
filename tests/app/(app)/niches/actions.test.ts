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

const unlockFilteredView = vi.fn();
vi.mock("@/lib/services/feed-credits", () => ({
  unlockFilteredView: (...args: unknown[]) => unlockFilteredView(...args),
}));

const capture = vi.fn();
vi.mock("@/lib/analytics", () => ({
  capture: (...args: unknown[]) => capture(...args),
}));

// isFirstEver's count query: .select().eq() (and optionally a second
// .eq() for the reason filter) all resolve to the same { count }.
let mockCount = 0;
interface CountQuery extends PromiseLike<{ count: number }> {
  select: () => CountQuery;
  eq: () => CountQuery;
}
function makeCountQuery(): CountQuery {
  const builder: CountQuery = {
    select: () => builder,
    eq: () => builder,
    then: (onfulfilled, onrejected) =>
      Promise.resolve({ count: mockCount }).then(onfulfilled, onrejected),
  };
  return builder;
}
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ from: () => makeCountQuery() }),
}));

const { searchNichesAction, saveChannelAction, unlockFeedFiltersAction } =
  await import("@/app/(app)/niches/actions");

const ctx = { userId: "user-1", workspaceId: null, tier: null };

beforeEach(() => {
  vi.clearAllMocks();
  getRequestContext.mockResolvedValue(ctx);
  mockCount = 0;
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

describe("unlockFeedFiltersAction (D-072)", () => {
  const KEY = "3f1c2b1e-9a4b-4c2d-8e7f-1a2b3c4d5e6f";

  it("canonicalises the filters the same way the page does before charging", async () => {
    unlockFilteredView.mockResolvedValue({ ok: true, value: { charged: true } });

    await unlockFeedFiltersAction(
      "channels",
      { faceless: "1", minSubs: "1000", sort: "outlier_score", junk: "x", lang: "english" },
      KEY,
    );

    expect(unlockFilteredView).toHaveBeenCalledWith(
      ctx,
      "channels",
      expect.objectContaining({ faceless: "1", minSubs: "1000", sort: undefined, lang: undefined }),
      KEY,
    );
    const values = unlockFilteredView.mock.calls[0]?.[2] as Record<string, unknown>;
    expect(values).not.toHaveProperty("junk");
  });

  it("rejects a bad tab, bad values or a non-UUID key without charging", async () => {
    expect(await unlockFeedFiltersAction("search", {}, KEY)).toEqual({
      ok: false,
      error: { type: "validation_error" },
    });
    expect(await unlockFeedFiltersAction("channels", "nope", KEY)).toEqual({
      ok: false,
      error: { type: "validation_error" },
    });
    expect(await unlockFeedFiltersAction("channels", {}, "not-a-uuid")).toEqual({
      ok: false,
      error: { type: "validation_error" },
    });
    expect(unlockFilteredView).not.toHaveBeenCalled();
  });
});
