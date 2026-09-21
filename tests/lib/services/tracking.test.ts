import { beforeEach, describe, expect, it, vi } from "vitest";

const resolveChannelUrl = vi.fn();
vi.mock("@/lib/youtube", () => ({
  resolveChannelUrl: (...args: unknown[]) => resolveChannelUrl(...args),
}));

const saveChannelToTracking = vi.fn();
vi.mock("@/lib/services/channels", () => ({
  saveChannelToTracking: (...args: unknown[]) => saveChannelToTracking(...args),
}));

const sessionFrom = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ from: sessionFrom }),
}));

const {
  getActivityFeed,
  getChannelActivity,
  addChannelToTracking,
  removeChannelFromTracking,
  markNotificationRead,
  dismissNotification,
} = await import("@/lib/services/tracking");

const ctx = { userId: "user-1" };

// A chainable, thenable double for the Supabase query builder: every
// filter/order/select method returns the same object (so any call order
// works), and awaiting it directly resolves to `result` -- matching
// supabase-js's own PostgrestFilterBuilder being a thenable.
function makeQueryBuilder(result: { data: unknown; error: unknown }) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    or: vi.fn((filter: string): unknown => {
      void filter;
      return builder;
    }),
    delete: vi.fn(() => builder),
    update: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (value: typeof result) => void) => resolve(result),
  };
  return builder;
}

function notificationRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "n1",
    user_id: ctx.userId,
    notification_type: "new_video",
    title: "New video from Sleep Sounds Daily",
    body: "Ep 1",
    related_resource: "video:v1",
    read_at: null,
    dismissed_at: null,
    delivered_channels: ["in_app"],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function trackedEventRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "e1",
    channel_id: "chan-1",
    event_type: "new_video",
    payload: { videoId: "v1" },
    detected_at: "2026-01-01T00:00:00Z",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function trackedChannelRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "tc1",
    user_id: ctx.userId,
    channel_id: "chan-1",
    workspace_id: null,
    tracked_since: "2026-01-01T00:00:00Z",
    custom_label: null,
    refresh_cadence_hours: 24,
    notifications_enabled: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getActivityFeed", () => {
  it("returns notifications and null nextCursor for an empty feed", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: [], error: null }));

    const result = await getActivityFeed(ctx);

    expect(result).toEqual({ ok: true, value: { notifications: [], nextCursor: null } });
  });

  it("returns a nextCursor when more rows exist beyond the page", async () => {
    const rows = [
      notificationRow({ id: "n3", created_at: "2026-01-03T00:00:00Z" }),
      notificationRow({ id: "n2", created_at: "2026-01-02T00:00:00Z" }),
      notificationRow({ id: "n1", created_at: "2026-01-01T00:00:00Z" }),
    ];
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: rows, error: null }));

    const result = await getActivityFeed(ctx, { limit: 2 });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.notifications.map((n) => n.id)).toEqual(["n3", "n2"]);
      expect(result.value.nextCursor).not.toBeNull();
    }
  });

  it("filters by notification_type when a specific filter is given", async () => {
    const builder = makeQueryBuilder({ data: [], error: null });
    sessionFrom.mockReturnValueOnce(builder);

    await getActivityFeed(ctx, { filter: "view_spike" });

    expect(builder.eq).toHaveBeenCalledWith("notification_type", "view_spike");
  });

  it("does not filter by notification_type when filter is 'all'", async () => {
    const builder = makeQueryBuilder({ data: [], error: null });
    sessionFrom.mockReturnValueOnce(builder);

    await getActivityFeed(ctx, { filter: "all" });

    expect(builder.eq).not.toHaveBeenCalledWith("notification_type", expect.anything());
  });

  it("paginates: a cursor from page 1 narrows page 2 via a keyset filter", async () => {
    const rows = [
      notificationRow({ id: "n3", created_at: "2026-01-03T00:00:00Z" }),
      notificationRow({ id: "n2", created_at: "2026-01-02T00:00:00Z" }),
      notificationRow({ id: "n1", created_at: "2026-01-01T00:00:00Z" }),
    ];
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: rows, error: null }));
    const first = await getActivityFeed(ctx, { limit: 2 });
    if (!first.ok) throw new Error("expected ok");

    const secondBuilder = makeQueryBuilder({
      data: [notificationRow({ id: "n1", created_at: "2026-01-01T00:00:00Z" })],
      error: null,
    });
    sessionFrom.mockReturnValueOnce(secondBuilder);

    const second = await getActivityFeed(ctx, { limit: 2, cursor: first.value.nextCursor! });

    expect(second).toEqual({
      ok: true,
      value: { notifications: expect.any(Array), nextCursor: null },
    });
    const orFilter = secondBuilder.or.mock.calls[0][0] as string;
    expect(orFilter).toContain("2026-01-02T00:00:00Z");
    expect(orFilter).toContain("n2");
  });

  it("returns invalid_cursor for a malformed cursor without querying", async () => {
    const result = await getActivityFeed(ctx, { cursor: "not-valid-base64url-json" });

    expect(result).toEqual({ ok: false, error: { type: "invalid_cursor" } });
    expect(sessionFrom).not.toHaveBeenCalled();
  });
});

describe("getChannelActivity", () => {
  it("returns tracked events for a channel", async () => {
    const rows = [trackedEventRow({ id: "e1" })];
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: rows, error: null }));

    const result = await getChannelActivity(ctx, "chan-1");

    expect(result).toEqual({
      ok: true,
      value: {
        events: [
          {
            id: "e1",
            channelId: "chan-1",
            eventType: "new_video",
            payload: { videoId: "v1" },
            detectedAt: "2026-01-01T00:00:00Z",
          },
        ],
        nextCursor: null,
      },
    });
  });
});

describe("addChannelToTracking", () => {
  it("by ID: delegates straight to saveChannelToTracking without resolving a URL", async () => {
    saveChannelToTracking.mockResolvedValueOnce({ ok: true, value: undefined });
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: trackedChannelRow(), error: null }));

    const result = await addChannelToTracking(ctx, { channelId: "chan-1" });

    expect(resolveChannelUrl).not.toHaveBeenCalled();
    expect(saveChannelToTracking).toHaveBeenCalledWith(ctx, "chan-1");
    expect(result).toEqual({
      ok: true,
      value: {
        id: "tc1",
        channelId: "chan-1",
        trackedSince: "2026-01-01T00:00:00Z",
        customLabel: null,
        refreshCadenceHours: 24,
        notificationsEnabled: true,
      },
    });
  });

  it("by URL: resolves the URL first, then delegates with the resolved channel ID", async () => {
    resolveChannelUrl.mockResolvedValueOnce({ ok: true, value: "chan-1" });
    saveChannelToTracking.mockResolvedValueOnce({ ok: true, value: undefined });
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: trackedChannelRow(), error: null }));

    const result = await addChannelToTracking(ctx, { url: "https://youtube.com/@someone" });

    expect(resolveChannelUrl).toHaveBeenCalledWith("https://youtube.com/@someone");
    expect(saveChannelToTracking).toHaveBeenCalledWith(ctx, "chan-1");
    expect(result.ok).toBe(true);
  });

  it("propagates an invalid URL without calling saveChannelToTracking", async () => {
    resolveChannelUrl.mockResolvedValueOnce({ ok: false, error: { type: "invalid_url" } });

    const result = await addChannelToTracking(ctx, { url: "not a url" });

    expect(result).toEqual({ ok: false, error: { type: "invalid_url" } });
    expect(saveChannelToTracking).not.toHaveBeenCalled();
  });

  it("propagates not_found when the URL resolves to no channel", async () => {
    resolveChannelUrl.mockResolvedValueOnce({ ok: false, error: { type: "not_found" } });

    const result = await addChannelToTracking(ctx, { url: "https://youtube.com/@nobody" });

    expect(result).toEqual({ ok: false, error: { type: "not_found" } });
  });

  it("propagates a tier_limit error from saveChannelToTracking", async () => {
    saveChannelToTracking.mockResolvedValueOnce({
      ok: false,
      error: { type: "tier_limit", limit: 10, current: 10 },
    });

    const result = await addChannelToTracking(ctx, { channelId: "chan-1" });

    expect(result).toEqual({ ok: false, error: { type: "tier_limit", limit: 10, current: 10 } });
  });

  it("already tracked is an idempotent Ok, not an error", async () => {
    // saveChannelToTracking itself treats a duplicate as success (unique
    // constraint -> Ok), so a re-add of an already-tracked channel resolves
    // the same way as a first-time add.
    saveChannelToTracking.mockResolvedValueOnce({ ok: true, value: undefined });
    sessionFrom.mockReturnValueOnce(
      makeQueryBuilder({
        data: trackedChannelRow({ tracked_since: "2025-06-01T00:00:00Z" }),
        error: null,
      }),
    );

    const result = await addChannelToTracking(ctx, { channelId: "chan-1" });

    expect(result.ok).toBe(true);
  });
});

describe("removeChannelFromTracking", () => {
  it("succeeds when a tracked_channels row was deleted", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: [{ id: "tc1" }], error: null }));

    const result = await removeChannelFromTracking(ctx, "chan-1");

    expect(result).toEqual({ ok: true, value: undefined });
  });

  it("returns not_tracked when no row matched", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: [], error: null }));

    const result = await removeChannelFromTracking(ctx, "chan-1");

    expect(result).toEqual({ ok: false, error: { type: "not_tracked" } });
  });
});

describe("markNotificationRead", () => {
  it("succeeds and scopes the update to the caller's own row", async () => {
    const builder = makeQueryBuilder({ data: [{ id: "n1" }], error: null });
    sessionFrom.mockReturnValueOnce(builder);

    const result = await markNotificationRead(ctx, "n1");

    expect(result).toEqual({ ok: true, value: undefined });
    expect(builder.update).toHaveBeenCalledWith({ read_at: expect.any(String) });
    expect(builder.eq).toHaveBeenCalledWith("user_id", ctx.userId);
  });

  it("returns not_found when the row belongs to another user (RLS hides it)", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: [], error: null }));

    const result = await markNotificationRead(ctx, "someone-elses-notification");

    expect(result).toEqual({ ok: false, error: { type: "not_found" } });
  });
});

describe("dismissNotification", () => {
  it("succeeds and scopes the update to the caller's own row", async () => {
    const builder = makeQueryBuilder({ data: [{ id: "n1" }], error: null });
    sessionFrom.mockReturnValueOnce(builder);

    const result = await dismissNotification(ctx, "n1");

    expect(result).toEqual({ ok: true, value: undefined });
    expect(builder.update).toHaveBeenCalledWith({ dismissed_at: expect.any(String) });
  });

  it("returns not_found when the row belongs to another user (RLS hides it)", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: [], error: null }));

    const result = await dismissNotification(ctx, "someone-elses-notification");

    expect(result).toEqual({ ok: false, error: { type: "not_found" } });
  });
});
