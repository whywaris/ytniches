import { beforeEach, describe, expect, it, vi } from "vitest";

const sessionFrom = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ from: sessionFrom }),
}));

const getSubscriptionStatus = vi.fn();
vi.mock("@/lib/services/billing", () => ({
  getSubscriptionStatus: (...args: unknown[]) => getSubscriptionStatus(...args),
}));

const listTrackedChannelsSummary = vi.fn();
vi.mock("@/lib/services/tracking", () => ({
  listTrackedChannelsSummary: (...args: unknown[]) => listTrackedChannelsSummary(...args),
}));

const {
  getNotificationPreferences,
  updateNotificationPreferences,
  listChannelNotificationOverrides,
  updateChannelNotificationOverride,
} = await import("@/lib/services/notification-preferences");

const ctx = { userId: "user-1", workspaceId: null, tier: null };

function makeQueryBuilder(result: { data: unknown; error: unknown }) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    in: vi.fn(() => builder),
    // Always a terminal call in this module (every real .upsert() site is
    // awaited directly, never chained further) -- resolves to `result`
    // itself, not `builder`, so there's no self-reference to worry about
    // and `.mock.calls[0][0]` is cleanly indexable.
    upsert: vi.fn((rows: unknown[], options?: unknown) => {
      void rows;
      void options;
      return Promise.resolve(result);
    }),
    then: (resolve: (value: typeof result) => void) => resolve(result),
  };
  return builder;
}

function prefRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    user_id: ctx.userId,
    notification_type: "new_video",
    in_app_enabled: true,
    email_enabled: false,
    digest_cadence: "off",
    digest_day_of_week: 1,
    quiet_hours_start: null,
    quiet_hours_end: null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getNotificationPreferences", () => {
  it("defaults every type to in-app-on/email-off, digest off, no quiet hours, when no rows exist", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: [], error: null }));
    getSubscriptionStatus.mockResolvedValueOnce(null);

    const summary = await getNotificationPreferences(ctx);

    expect(summary.perType).toEqual([
      { type: "new_video", inAppEnabled: true, emailEnabled: false },
      { type: "view_spike", inAppEnabled: true, emailEnabled: false },
      { type: "cadence_change", inAppEnabled: true, emailEnabled: false },
      { type: "outlier_detected", inAppEnabled: true, emailEnabled: false },
    ]);
    expect(summary.digestCadence).toBe("off");
    expect(summary.digestDayOfWeek).toBe(1);
    expect(summary.quietHoursStart).toBeNull();
    expect(summary.emailAvailable).toBe(false);
  });

  it("reads per-type booleans from their own row, and global fields from any single row", async () => {
    sessionFrom.mockReturnValueOnce(
      makeQueryBuilder({
        data: [
          prefRow({
            notification_type: "new_video",
            email_enabled: true,
            digest_cadence: "weekly",
            digest_day_of_week: 3,
          }),
          prefRow({ notification_type: "view_spike", in_app_enabled: false }),
        ],
        error: null,
      }),
    );
    getSubscriptionStatus.mockResolvedValueOnce({ tier: "pro" });

    const summary = await getNotificationPreferences(ctx);

    const newVideo = summary.perType.find((p) => p.type === "new_video");
    const viewSpike = summary.perType.find((p) => p.type === "view_spike");
    expect(newVideo).toEqual({ type: "new_video", inAppEnabled: true, emailEnabled: true });
    expect(viewSpike).toEqual({ type: "view_spike", inAppEnabled: false, emailEnabled: false });
    expect(summary.digestCadence).toBe("weekly");
    expect(summary.digestDayOfWeek).toBe(3);
    expect(summary.emailAvailable).toBe(true);
  });

  it("is not email-available for a starter-tier subscription", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: [], error: null }));
    getSubscriptionStatus.mockResolvedValueOnce({ tier: "starter" });

    const summary = await getNotificationPreferences(ctx);

    expect(summary.emailAvailable).toBe(false);
  });
});

describe("updateNotificationPreferences", () => {
  const INPUT = {
    perType: [
      { type: "new_video" as const, inAppEnabled: true, emailEnabled: true },
      { type: "view_spike" as const, inAppEnabled: false, emailEnabled: true },
      { type: "cadence_change" as const, inAppEnabled: true, emailEnabled: false },
      { type: "outlier_detected" as const, inAppEnabled: true, emailEnabled: true },
    ],
    digestCadence: "weekly" as const,
    digestDayOfWeek: 2,
    quietHoursStart: "22:00:00",
    quietHoursEnd: "07:00:00",
  };

  it("upserts all four type rows with the requested values for a Pro user", async () => {
    getSubscriptionStatus.mockResolvedValueOnce({ tier: "pro" });
    const table = makeQueryBuilder({ data: null, error: null });
    sessionFrom.mockReturnValueOnce(table);

    const result = await updateNotificationPreferences(ctx, INPUT);

    expect(result).toEqual({ ok: true, value: undefined });
    expect(table.upsert).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          notification_type: "new_video",
          email_enabled: true,
          digest_cadence: "weekly",
        }),
        expect.objectContaining({ notification_type: "view_spike", in_app_enabled: false }),
        expect.objectContaining({ notification_type: "cadence_change", email_enabled: false }),
        expect.objectContaining({ notification_type: "outlier_detected", email_enabled: true }),
      ],
      { onConflict: "user_id,notification_type" },
    );
  });

  it("forces email-only fields to their disabled defaults for a Starter/trial user (gap 1)", async () => {
    getSubscriptionStatus.mockResolvedValueOnce(null); // trial

    const table = makeQueryBuilder({ data: null, error: null });
    sessionFrom.mockReturnValueOnce(table);

    await updateNotificationPreferences(ctx, INPUT);

    const [rows] = table.upsert.mock.calls[0] as [Record<string, unknown>[], unknown];
    for (const row of rows) {
      expect(row.email_enabled).toBe(false);
      expect(row.digest_cadence).toBe("off");
      expect(row.quiet_hours_start).toBeNull();
      expect(row.quiet_hours_end).toBeNull();
    }
  });
});

describe("listChannelNotificationOverrides", () => {
  it("returns [] without querying overrides when there are no tracked channels", async () => {
    listTrackedChannelsSummary.mockResolvedValueOnce([]);

    const rows = await listChannelNotificationOverrides(ctx);

    expect(rows).toEqual([]);
    expect(sessionFrom).not.toHaveBeenCalled();
  });

  it("defaults to enabled for a channel with no override row", async () => {
    listTrackedChannelsSummary.mockResolvedValueOnce([
      { id: "chan-1", name: "Sleep Sounds Daily", avatarUrl: null, lastActivityAt: null },
    ]);
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: [], error: null }));

    const rows = await listChannelNotificationOverrides(ctx);

    expect(rows).toEqual([
      {
        channelId: "chan-1",
        channelName: "Sleep Sounds Daily",
        avatarUrl: null,
        notificationsEnabled: true,
      },
    ]);
  });

  it("reflects an existing override row", async () => {
    listTrackedChannelsSummary.mockResolvedValueOnce([
      { id: "chan-1", name: "Sleep Sounds Daily", avatarUrl: null, lastActivityAt: null },
    ]);
    sessionFrom.mockReturnValueOnce(
      makeQueryBuilder({
        data: [{ channel_id: "chan-1", notifications_enabled: false }],
        error: null,
      }),
    );

    const rows = await listChannelNotificationOverrides(ctx);

    expect(rows[0].notificationsEnabled).toBe(false);
  });
});

describe("updateChannelNotificationOverride", () => {
  it("upserts the override row", async () => {
    const table = makeQueryBuilder({ data: null, error: null });
    sessionFrom.mockReturnValueOnce(table);

    await updateChannelNotificationOverride(ctx, "chan-1", false);

    expect(table.upsert).toHaveBeenCalledWith(
      { user_id: ctx.userId, channel_id: "chan-1", notifications_enabled: false },
      { onConflict: "user_id,channel_id" },
    );
  });
});

describe("email availability follows the effective tier (D-059)", () => {
  it("offers email to a Team workspace member with no subscription of their own", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: [], error: null }));
    getSubscriptionStatus.mockResolvedValueOnce(null);
    const summary = await getNotificationPreferences({ ...ctx, tier: "team" });
    expect(summary.emailAvailable).toBe(true);
  });
});
