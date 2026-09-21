import { beforeEach, describe, expect, it, vi } from "vitest";

const getChannelById = vi.fn();
const getChannelVideos = vi.fn();
vi.mock("@/lib/youtube", () => ({
  getChannelById: (...args: unknown[]) => getChannelById(...args),
  getChannelVideos: (...args: unknown[]) => getChannelVideos(...args),
}));

const upsertChannels = vi.fn();
vi.mock("@/lib/services/channels", () => ({
  upsertChannels: (...args: unknown[]) => upsertChannels(...args),
}));

const serviceFrom = vi.fn();
vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({ from: serviceFrom }),
}));

const { syncChannelData, fanOutNotifications } = await import("@/workers/channel-sync");

const CHANNEL_ID = "11111111-1111-1111-1111-111111111111";
const CHANNEL_ROW = { id: CHANNEL_ID, youtube_channel_id: "UC1", name: "Sleep Sounds Daily" };

function channelsTable(result: { data: unknown; error: unknown }) {
  return {
    select: vi.fn(() => ({
      eq: vi.fn(() => ({ maybeSingle: vi.fn(() => Promise.resolve(result)) })),
    })),
  };
}

function videosSelectTable(result: { data: unknown[] | null; error: unknown }) {
  return {
    select: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve(result)),
    })),
  };
}

function videosUpsertTable(result: { data: unknown[]; error: unknown }) {
  return {
    upsert: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve(result)),
    })),
  };
}

function insertTable(result: { error: unknown } = { error: null }) {
  return {
    insert: vi.fn<(rows: unknown[]) => Promise<typeof result>>(() => Promise.resolve(result)),
  };
}

function makeVideo(overrides: Record<string, unknown> = {}) {
  return {
    id: "vid1",
    snippet: {
      title: "How to pick a niche",
      description: "",
      publishedAt: new Date().toISOString(),
      tags: [],
    },
    statistics: { viewCount: 100 },
    contentDetails: { duration: "PT10M" },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  getChannelById.mockResolvedValue({ ok: true, value: { id: "UC1" } });
  upsertChannels.mockResolvedValue(new Map());
});

describe("syncChannelData", () => {
  it("returns [] without fetching from YouTube when the channel row is gone", async () => {
    serviceFrom.mockReturnValueOnce(channelsTable({ data: null, error: null }));

    const events = await syncChannelData(CHANNEL_ID);

    expect(events).toEqual([]);
    expect(getChannelById).not.toHaveBeenCalled();
  });

  it("throws when the channel fetch fails (lets Inngest retry)", async () => {
    serviceFrom.mockReturnValueOnce(channelsTable({ data: CHANNEL_ROW, error: null }));
    serviceFrom.mockReturnValueOnce(videosSelectTable({ data: [], error: null }));
    getChannelById.mockResolvedValueOnce({ ok: false, error: { type: "quota_exceeded" } });

    await expect(syncChannelData(CHANNEL_ID)).rejects.toThrow("channel fetch failed");
  });

  it("throws when the videos fetch fails", async () => {
    serviceFrom.mockReturnValueOnce(channelsTable({ data: CHANNEL_ROW, error: null }));
    serviceFrom.mockReturnValueOnce(videosSelectTable({ data: [], error: null }));
    getChannelVideos.mockResolvedValueOnce({
      ok: false,
      error: { type: "network_error", message: "x" },
    });

    await expect(syncChannelData(CHANNEL_ID)).rejects.toThrow("videos fetch failed");
  });

  it("emits a new_video event for a video not already in the videos table", async () => {
    serviceFrom.mockReturnValueOnce(channelsTable({ data: CHANNEL_ROW, error: null }));
    serviceFrom.mockReturnValueOnce(videosSelectTable({ data: [], error: null })); // no old videos
    getChannelVideos.mockResolvedValueOnce({ ok: true, value: [makeVideo({ id: "vid1" })] });
    serviceFrom.mockReturnValueOnce(
      videosUpsertTable({
        data: [{ id: "internal-vid-1", youtube_video_id: "vid1" }],
        error: null,
      }),
    );
    const trackedEventsInsert = insertTable();
    serviceFrom.mockReturnValueOnce(trackedEventsInsert);

    const events = await syncChannelData(CHANNEL_ID);

    expect(events).toEqual([
      {
        channelId: CHANNEL_ID,
        channelName: "Sleep Sounds Daily",
        eventType: "new_video",
        payload: { videoId: "internal-vid-1", title: "How to pick a niche" },
      },
    ]);
    expect(trackedEventsInsert.insert).toHaveBeenCalledWith([
      { channel_id: CHANNEL_ID, event_type: "new_video", payload: events[0].payload },
    ]);
  });

  it("emits view_spike for a milestone crossed, choosing the highest one crossed in a single jump", async () => {
    serviceFrom.mockReturnValueOnce(channelsTable({ data: CHANNEL_ROW, error: null }));
    serviceFrom.mockReturnValueOnce(
      videosSelectTable({
        data: [
          { youtube_video_id: "vid1", view_count: 500, published_at: new Date().toISOString() },
        ],
        error: null,
      }),
    );
    // Jumps from 500 straight to 50,000 -- crosses both 1K and 10K, should
    // report only the highest (10K), not both.
    getChannelVideos.mockResolvedValueOnce({
      ok: true,
      value: [makeVideo({ id: "vid1", statistics: { viewCount: 50_000 } })],
    });
    serviceFrom.mockReturnValueOnce(
      videosUpsertTable({
        data: [{ id: "internal-vid-1", youtube_video_id: "vid1" }],
        error: null,
      }),
    );
    serviceFrom.mockReturnValueOnce(insertTable());

    const events = await syncChannelData(CHANNEL_ID);

    expect(events).toEqual([
      {
        channelId: CHANNEL_ID,
        channelName: "Sleep Sounds Daily",
        eventType: "view_spike",
        payload: {
          videoId: "internal-vid-1",
          title: "How to pick a niche",
          crossedThreshold: 10_000,
          viewCount: 50_000,
        },
      },
    ]);
  });

  it("does not emit view_spike when no milestone is crossed", async () => {
    serviceFrom.mockReturnValueOnce(channelsTable({ data: CHANNEL_ROW, error: null }));
    serviceFrom.mockReturnValueOnce(
      videosSelectTable({
        data: [
          { youtube_video_id: "vid1", view_count: 950, published_at: new Date().toISOString() },
        ],
        error: null,
      }),
    );
    getChannelVideos.mockResolvedValueOnce({
      ok: true,
      value: [makeVideo({ id: "vid1", statistics: { viewCount: 990 } })],
    });
    serviceFrom.mockReturnValueOnce(
      videosUpsertTable({
        data: [{ id: "internal-vid-1", youtube_video_id: "vid1" }],
        error: null,
      }),
    );

    const events = await syncChannelData(CHANNEL_ID);

    expect(events).toEqual([]);
  });

  it("skips cadence_change detection on a channel's first-ever sync (no old videos)", async () => {
    serviceFrom.mockReturnValueOnce(channelsTable({ data: CHANNEL_ROW, error: null }));
    serviceFrom.mockReturnValueOnce(videosSelectTable({ data: [], error: null }));
    getChannelVideos.mockResolvedValueOnce({
      ok: true,
      value: Array.from({ length: 8 }, (_, i) => makeVideo({ id: `vid${i}` })),
    });
    serviceFrom.mockReturnValueOnce(videosUpsertTable({ data: [], error: null }));
    serviceFrom.mockReturnValueOnce(insertTable());

    const events = await syncChannelData(CHANNEL_ID);

    expect(events.find((e) => e.eventType === "cadence_change")).toBeUndefined();
  });

  it("emits cadence_change when the delta meets the >=1/week threshold", async () => {
    const now = new Date();
    const recentIso = (daysAgo: number) =>
      new Date(now.getTime() - daysAgo * 86_400_000).toISOString();

    // Old: 1 video in the last 28 days -> 0.25/week.
    serviceFrom.mockReturnValueOnce(channelsTable({ data: CHANNEL_ROW, error: null }));
    serviceFrom.mockReturnValueOnce(
      videosSelectTable({
        data: [{ youtube_video_id: "old1", view_count: 10, published_at: recentIso(5) }],
        error: null,
      }),
    );
    // Fresh: 5 videos in the last 28 days -> 1.25/week. Delta = 1.0 >= threshold.
    const freshVideos = Array.from({ length: 5 }, (_, i) =>
      makeVideo({ id: `new${i}`, snippet: { ...makeVideo().snippet, publishedAt: recentIso(i) } }),
    );
    getChannelVideos.mockResolvedValueOnce({ ok: true, value: freshVideos });
    serviceFrom.mockReturnValueOnce(videosUpsertTable({ data: [], error: null }));
    serviceFrom.mockReturnValueOnce(insertTable());

    const events = await syncChannelData(CHANNEL_ID);

    const cadenceEvent = events.find((e) => e.eventType === "cadence_change");
    expect(cadenceEvent).toEqual({
      channelId: CHANNEL_ID,
      channelName: "Sleep Sounds Daily",
      eventType: "cadence_change",
      payload: { previousPerWeek: 0.25, currentPerWeek: 1.25 },
    });
  });

  it("does not emit cadence_change when the delta is below the threshold", async () => {
    const now = new Date();
    const recentIso = (daysAgo: number) =>
      new Date(now.getTime() - daysAgo * 86_400_000).toISOString();

    serviceFrom.mockReturnValueOnce(channelsTable({ data: CHANNEL_ROW, error: null }));
    serviceFrom.mockReturnValueOnce(
      videosSelectTable({
        data: [{ youtube_video_id: "old1", view_count: 10, published_at: recentIso(5) }],
        error: null,
      }),
    );
    // Fresh: still just 1 video in the window -> 0.25/week, same as before.
    getChannelVideos.mockResolvedValueOnce({
      ok: true,
      value: [
        makeVideo({ id: "old1", snippet: { ...makeVideo().snippet, publishedAt: recentIso(5) } }),
      ],
    });
    serviceFrom.mockReturnValueOnce(videosUpsertTable({ data: [], error: null }));

    const events = await syncChannelData(CHANNEL_ID);

    expect(events.find((e) => e.eventType === "cadence_change")).toBeUndefined();
  });

  it("throws when the tracked_events insert fails", async () => {
    serviceFrom.mockReturnValueOnce(channelsTable({ data: CHANNEL_ROW, error: null }));
    serviceFrom.mockReturnValueOnce(videosSelectTable({ data: [], error: null }));
    getChannelVideos.mockResolvedValueOnce({ ok: true, value: [makeVideo()] });
    serviceFrom.mockReturnValueOnce(
      videosUpsertTable({
        data: [{ id: "internal-vid-1", youtube_video_id: "vid1" }],
        error: null,
      }),
    );
    serviceFrom.mockReturnValueOnce(insertTable({ error: { message: "db down" } }));

    await expect(syncChannelData(CHANNEL_ID)).rejects.toThrow("tracked_events insert failed");
  });

  it("upserts the freshly-fetched channel via lib/services/channels", async () => {
    serviceFrom.mockReturnValueOnce(channelsTable({ data: CHANNEL_ROW, error: null }));
    serviceFrom.mockReturnValueOnce(videosSelectTable({ data: [], error: null }));
    const freshChannel = { id: "UC1", snippet: { title: "Sleep Sounds Daily" } };
    getChannelById.mockResolvedValueOnce({ ok: true, value: freshChannel });
    getChannelVideos.mockResolvedValueOnce({ ok: true, value: [] });

    await syncChannelData(CHANNEL_ID);

    expect(upsertChannels).toHaveBeenCalledWith([freshChannel]);
  });
});

describe("fanOutNotifications", () => {
  function trackedChannelsTable(result: { data: unknown[] | null; error: unknown }) {
    return {
      select: vi.fn(() => ({ eq: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve(result)) })) })),
    };
  }

  function overridesOrPrefsTable(result: { data: unknown[] | null; error: unknown }) {
    return {
      select: vi.fn(() => ({ eq: vi.fn(() => ({ in: vi.fn(() => Promise.resolve(result)) })) })),
    };
  }

  const NEW_VIDEO_EVENT = {
    channelId: CHANNEL_ID,
    channelName: "Sleep Sounds Daily",
    eventType: "new_video" as const,
    payload: { videoId: "v1", title: "Ep 1" },
  };

  it("does nothing (no queries) for an empty events array", async () => {
    await fanOutNotifications([]);
    expect(serviceFrom).not.toHaveBeenCalled();
  });

  it("does nothing when nobody tracks the channel", async () => {
    serviceFrom.mockReturnValueOnce(trackedChannelsTable({ data: [], error: null }));

    await fanOutNotifications([NEW_VIDEO_EVENT]);

    expect(serviceFrom).toHaveBeenCalledTimes(1);
  });

  it("inserts a notification per tracker when no preference/override rows exist (default enabled)", async () => {
    serviceFrom.mockReturnValueOnce(
      trackedChannelsTable({ data: [{ user_id: "u1" }, { user_id: "u2" }], error: null }),
    );
    serviceFrom.mockReturnValueOnce(overridesOrPrefsTable({ data: [], error: null }));
    serviceFrom.mockReturnValueOnce(overridesOrPrefsTable({ data: [], error: null }));
    const notificationsInsert = insertTable();
    serviceFrom.mockReturnValueOnce(notificationsInsert);

    await fanOutNotifications([NEW_VIDEO_EVENT]);

    expect(notificationsInsert.insert).toHaveBeenCalledWith([
      expect.objectContaining({ user_id: "u1", title: "New video from Sleep Sounds Daily" }),
      expect.objectContaining({ user_id: "u2", title: "New video from Sleep Sounds Daily" }),
    ]);
  });

  it("excludes a user with a per-channel override disabling notifications", async () => {
    serviceFrom.mockReturnValueOnce(
      trackedChannelsTable({ data: [{ user_id: "u1" }, { user_id: "u2" }], error: null }),
    );
    serviceFrom.mockReturnValueOnce(
      overridesOrPrefsTable({
        data: [{ user_id: "u1", notifications_enabled: false }],
        error: null,
      }),
    );
    serviceFrom.mockReturnValueOnce(overridesOrPrefsTable({ data: [], error: null }));
    const notificationsInsert = insertTable();
    serviceFrom.mockReturnValueOnce(notificationsInsert);

    await fanOutNotifications([NEW_VIDEO_EVENT]);

    expect(notificationsInsert.insert).toHaveBeenCalledWith([
      expect.objectContaining({ user_id: "u2" }),
    ]);
  });

  it("excludes a user whose general preference disables in_app, when no override exists", async () => {
    serviceFrom.mockReturnValueOnce(
      trackedChannelsTable({ data: [{ user_id: "u1" }, { user_id: "u2" }], error: null }),
    );
    serviceFrom.mockReturnValueOnce(overridesOrPrefsTable({ data: [], error: null }));
    serviceFrom.mockReturnValueOnce(
      overridesOrPrefsTable({ data: [{ user_id: "u1", in_app_enabled: false }], error: null }),
    );
    const notificationsInsert = insertTable();
    serviceFrom.mockReturnValueOnce(notificationsInsert);

    await fanOutNotifications([NEW_VIDEO_EVENT]);

    expect(notificationsInsert.insert).toHaveBeenCalledWith([
      expect.objectContaining({ user_id: "u2" }),
    ]);
  });

  it("lets a per-channel override win over a disabling general preference", async () => {
    serviceFrom.mockReturnValueOnce(
      trackedChannelsTable({ data: [{ user_id: "u1" }], error: null }),
    );
    serviceFrom.mockReturnValueOnce(
      overridesOrPrefsTable({
        data: [{ user_id: "u1", notifications_enabled: true }],
        error: null,
      }),
    );
    serviceFrom.mockReturnValueOnce(
      overridesOrPrefsTable({ data: [{ user_id: "u1", in_app_enabled: false }], error: null }),
    );
    const notificationsInsert = insertTable();
    serviceFrom.mockReturnValueOnce(notificationsInsert);

    await fanOutNotifications([NEW_VIDEO_EVENT]);

    expect(notificationsInsert.insert).toHaveBeenCalledWith([
      expect.objectContaining({ user_id: "u1" }),
    ]);
  });

  it("caps the tracker lookup at 1,000 and batches inserts in groups of 500", async () => {
    const trackers = Array.from({ length: 600 }, (_, i) => ({ user_id: `u${i}` }));
    const trackedTable = trackedChannelsTable({ data: trackers, error: null });
    serviceFrom.mockReturnValueOnce(trackedTable);
    serviceFrom.mockReturnValueOnce(overridesOrPrefsTable({ data: [], error: null }));
    serviceFrom.mockReturnValueOnce(overridesOrPrefsTable({ data: [], error: null }));
    const notificationsInsert = insertTable();
    serviceFrom.mockReturnValueOnce(notificationsInsert);
    serviceFrom.mockReturnValueOnce(notificationsInsert);

    await fanOutNotifications([NEW_VIDEO_EVENT]);

    expect(notificationsInsert.insert).toHaveBeenCalledTimes(2);
    expect(notificationsInsert.insert.mock.calls[0][0]).toHaveLength(500);
    expect(notificationsInsert.insert.mock.calls[1][0]).toHaveLength(100);
  });

  it("composes view_spike and cadence_change notification text correctly", async () => {
    serviceFrom.mockReturnValueOnce(
      trackedChannelsTable({ data: [{ user_id: "u1" }], error: null }),
    );
    serviceFrom.mockReturnValueOnce(overridesOrPrefsTable({ data: [], error: null }));
    serviceFrom.mockReturnValueOnce(overridesOrPrefsTable({ data: [], error: null }));
    const viewSpikeInsert = insertTable();
    serviceFrom.mockReturnValueOnce(viewSpikeInsert);

    await fanOutNotifications([
      {
        channelId: CHANNEL_ID,
        channelName: "Sleep Sounds Daily",
        eventType: "view_spike",
        payload: { videoId: "v1", title: "Ep 1", crossedThreshold: 100_000, viewCount: 105_000 },
      },
    ]);

    expect(viewSpikeInsert.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        title: "Sleep Sounds Daily crossed 100.0K views",
        body: "Ep 1",
        related_resource: "video:v1",
      }),
    ]);

    serviceFrom.mockReturnValueOnce(
      trackedChannelsTable({ data: [{ user_id: "u1" }], error: null }),
    );
    serviceFrom.mockReturnValueOnce(overridesOrPrefsTable({ data: [], error: null }));
    serviceFrom.mockReturnValueOnce(overridesOrPrefsTable({ data: [], error: null }));
    const cadenceInsert = insertTable();
    serviceFrom.mockReturnValueOnce(cadenceInsert);

    await fanOutNotifications([
      {
        channelId: CHANNEL_ID,
        channelName: "Sleep Sounds Daily",
        eventType: "cadence_change",
        payload: { previousPerWeek: 1, currentPerWeek: 3 },
      },
    ]);

    expect(cadenceInsert.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        title: "Sleep Sounds Daily changed upload cadence",
        body: "Was 1.0/week, now 3.0/week",
        related_resource: `channel:${CHANNEL_ID}`,
      }),
    ]);
  });

  it("throws when the tracker lookup fails", async () => {
    serviceFrom.mockReturnValueOnce(
      trackedChannelsTable({ data: null, error: { message: "db down" } }),
    );

    await expect(fanOutNotifications([NEW_VIDEO_EVENT])).rejects.toThrow("tracker lookup failed");
  });

  it("throws when the notification insert fails", async () => {
    serviceFrom.mockReturnValueOnce(
      trackedChannelsTable({ data: [{ user_id: "u1" }], error: null }),
    );
    serviceFrom.mockReturnValueOnce(overridesOrPrefsTable({ data: [], error: null }));
    serviceFrom.mockReturnValueOnce(overridesOrPrefsTable({ data: [], error: null }));
    serviceFrom.mockReturnValueOnce(insertTable({ error: { message: "db down" } }));

    await expect(fanOutNotifications([NEW_VIDEO_EVENT])).rejects.toThrow(
      "fanOutNotifications insert failed",
    );
  });
});
