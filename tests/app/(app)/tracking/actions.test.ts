import { beforeEach, describe, expect, it, vi } from "vitest";

const getRequestContext = vi.fn();
vi.mock("@/lib/context", () => ({
  getRequestContext: (...args: unknown[]) => getRequestContext(...args),
}));

const getActivityFeed = vi.fn();
const getChannelActivity = vi.fn();
const previewChannelFromUrl = vi.fn();
const addChannelToTracking = vi.fn();
const removeChannelFromTracking = vi.fn();
const markNotificationRead = vi.fn();
const dismissNotification = vi.fn();
vi.mock("@/lib/services/tracking", () => ({
  getActivityFeed: (...args: unknown[]) => getActivityFeed(...args),
  getChannelActivity: (...args: unknown[]) => getChannelActivity(...args),
  previewChannelFromUrl: (...args: unknown[]) => previewChannelFromUrl(...args),
  addChannelToTracking: (...args: unknown[]) => addChannelToTracking(...args),
  removeChannelFromTracking: (...args: unknown[]) => removeChannelFromTracking(...args),
  markNotificationRead: (...args: unknown[]) => markNotificationRead(...args),
  dismissNotification: (...args: unknown[]) => dismissNotification(...args),
}));

const joinNotificationChannels = vi.fn();
vi.mock("@/app/(app)/tracking/notification-refs", () => ({
  joinNotificationChannels: (...args: unknown[]) => joinNotificationChannels(...args),
}));

const {
  getActivityFeedAction,
  getChannelActivityAction,
  validateChannelUrlAction,
  addChannelToTrackingAction,
  removeChannelFromTrackingAction,
  markNotificationReadAction,
  dismissNotificationAction,
} = await import("@/app/(app)/tracking/actions");

const ctx = { userId: "user-1", workspaceId: null, tier: null };

beforeEach(() => {
  vi.clearAllMocks();
  getRequestContext.mockResolvedValue(ctx);
});

describe("getActivityFeedAction", () => {
  it("gets the context, calls the service, and joins channel refs onto the result", async () => {
    const rawNotifications = [{ id: "n1", relatedResource: "channel:chan-1" }];
    getActivityFeed.mockResolvedValueOnce({
      ok: true,
      value: { notifications: rawNotifications, nextCursor: "cursor-1" },
    });
    const joined = [{ id: "n1", channel: { id: "chan-1", name: "X", avatarUrl: null } }];
    joinNotificationChannels.mockResolvedValueOnce(joined);

    const result = await getActivityFeedAction({ filter: "new_video" });

    expect(getRequestContext).toHaveBeenCalledOnce();
    expect(getActivityFeed).toHaveBeenCalledWith(ctx, { filter: "new_video" });
    expect(joinNotificationChannels).toHaveBeenCalledWith(rawNotifications);
    expect(result).toEqual({ ok: true, value: { notifications: joined, nextCursor: "cursor-1" } });
  });

  it("returns the service's error untouched without calling the join helper", async () => {
    getActivityFeed.mockResolvedValueOnce({ ok: false, error: { type: "invalid_cursor" } });

    const result = await getActivityFeedAction({ cursor: "bad" });

    expect(result).toEqual({ ok: false, error: { type: "invalid_cursor" } });
    expect(joinNotificationChannels).not.toHaveBeenCalled();
  });
});

describe("getChannelActivityAction", () => {
  it("gets the context and delegates to the service", async () => {
    getChannelActivity.mockResolvedValueOnce({ ok: true, value: { events: [], nextCursor: null } });

    const result = await getChannelActivityAction("chan-1", { limit: 10 });

    expect(getRequestContext).toHaveBeenCalledOnce();
    expect(getChannelActivity).toHaveBeenCalledWith(ctx, "chan-1", { limit: 10 });
    expect(result).toEqual({ ok: true, value: { events: [], nextCursor: null } });
  });
});

describe("validateChannelUrlAction", () => {
  it("delegates to previewChannelFromUrl without needing a request context", async () => {
    previewChannelFromUrl.mockResolvedValueOnce({ ok: true, value: { channelId: "chan-1" } });

    const result = await validateChannelUrlAction("https://youtube.com/@someone");

    expect(previewChannelFromUrl).toHaveBeenCalledWith("https://youtube.com/@someone");
    expect(result).toEqual({ ok: true, value: { channelId: "chan-1" } });
  });
});

describe("addChannelToTrackingAction", () => {
  it("gets the context and delegates to the service", async () => {
    addChannelToTracking.mockResolvedValueOnce({ ok: true, value: { id: "tc1" } });

    const result = await addChannelToTrackingAction({ channelId: "chan-1" });

    expect(getRequestContext).toHaveBeenCalledOnce();
    expect(addChannelToTracking).toHaveBeenCalledWith(ctx, { channelId: "chan-1" });
    expect(result).toEqual({ ok: true, value: { id: "tc1" } });
  });
});

describe("removeChannelFromTrackingAction", () => {
  it("gets the context and delegates to the service", async () => {
    removeChannelFromTracking.mockResolvedValueOnce({ ok: true, value: undefined });

    const result = await removeChannelFromTrackingAction("chan-1");

    expect(removeChannelFromTracking).toHaveBeenCalledWith(ctx, "chan-1");
    expect(result).toEqual({ ok: true, value: undefined });
  });
});

describe("markNotificationReadAction", () => {
  it("gets the context and delegates to the service", async () => {
    markNotificationRead.mockResolvedValueOnce({ ok: true, value: undefined });

    const result = await markNotificationReadAction("notif-1");

    expect(markNotificationRead).toHaveBeenCalledWith(ctx, "notif-1");
    expect(result).toEqual({ ok: true, value: undefined });
  });
});

describe("dismissNotificationAction", () => {
  it("gets the context and delegates to the service", async () => {
    dismissNotification.mockResolvedValueOnce({ ok: true, value: undefined });

    const result = await dismissNotificationAction("notif-1");

    expect(dismissNotification).toHaveBeenCalledWith(ctx, "notif-1");
    expect(result).toEqual({ ok: true, value: undefined });
  });
});
