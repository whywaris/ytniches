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
const getEffectivePlans = vi.fn<(userIds: string[]) => Promise<Map<string, unknown>>>(
  async () => new Map(),
);
vi.mock("@/lib/billing/effective-plan", () => ({
  getEffectivePlans: (userIds: string[]) => getEffectivePlans(userIds),
}));

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({ from: serviceFrom }),
}));

const sendNewVideoEmail = vi.fn();
const sendViewSpikeEmail = vi.fn();
const sendCadenceChangeEmail = vi.fn();
const sendOutlierEmail = vi.fn();
vi.mock("@/lib/email/notifications", () => ({
  sendNewVideoEmail: (...args: unknown[]) => sendNewVideoEmail(...args),
  sendViewSpikeEmail: (...args: unknown[]) => sendViewSpikeEmail(...args),
  sendCadenceChangeEmail: (...args: unknown[]) => sendCadenceChangeEmail(...args),
  sendOutlierEmail: (...args: unknown[]) => sendOutlierEmail(...args),
}));

const { syncChannelData, fanOutNotifications, isNotifiable } =
  await import("@/workers/channel-sync");

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

// Dual-purpose: syncChannelData's tracked_events insert just awaits
// .insert(rows) directly, while fanOutNotifications' notifications insert
// chains .select() after it to get inserted rows back -- the returned
// object is both thenable itself and exposes a chainable .select().
function insertTable(result: { error: unknown; data?: unknown[] | null } = { error: null }) {
  const insertResult = {
    select: vi.fn(() => Promise.resolve({ data: result.data ?? null, error: result.error })),
    then: (resolve: (value: typeof result) => unknown, reject?: (reason: unknown) => unknown) =>
      Promise.resolve(result).then(resolve, reject),
  };
  return {
    insert: vi.fn<(rows: unknown[]) => typeof insertResult>(() => insertResult),
  };
}

// The outlier-detection dedup lookup: .select("payload").eq(channel_id).eq(event_type).
function outlierEventsTable(result: { data: unknown[] | null; error: unknown }) {
  return {
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve(result)),
      })),
    })),
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
    serviceFrom.mockReturnValueOnce(outlierEventsTable({ data: [], error: null }));
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
    serviceFrom.mockReturnValueOnce(outlierEventsTable({ data: [], error: null }));
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
    serviceFrom.mockReturnValueOnce(outlierEventsTable({ data: [], error: null }));

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
    serviceFrom.mockReturnValueOnce(outlierEventsTable({ data: [], error: null }));
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
    serviceFrom.mockReturnValueOnce(outlierEventsTable({ data: [], error: null }));
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
    serviceFrom.mockReturnValueOnce(outlierEventsTable({ data: [], error: null }));

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
    serviceFrom.mockReturnValueOnce(outlierEventsTable({ data: [], error: null }));
    serviceFrom.mockReturnValueOnce(insertTable({ error: { message: "db down" } }));

    await expect(syncChannelData(CHANNEL_ID)).rejects.toThrow("tracked_events insert failed");
  });

  function buildOutlierFixture() {
    const now = Date.now();
    const daysAgoIso = (days: number) => new Date(now - days * 86_400_000).toISOString();

    // 5 priors at 1,000 views each -> baseline 1,000. Candidate at 5,000
    // views (5x baseline) clears the 3x threshold.
    const priors = Array.from({ length: 5 }, (_, i) =>
      makeVideo({
        id: `prior${i}`,
        snippet: { ...makeVideo().snippet, publishedAt: daysAgoIso(10 - i) },
        statistics: { viewCount: 1000 },
      }),
    );
    const candidate = makeVideo({
      id: "outlier1",
      snippet: { ...makeVideo().snippet, publishedAt: daysAgoIso(1) },
      statistics: { viewCount: 5000 },
    });
    const freshVideos = [...priors, candidate];
    const upsertData = freshVideos.map((video) => ({
      id: `internal-${video.id}`,
      youtube_video_id: video.id,
    }));

    return { freshVideos, upsertData };
  }

  it("emits outlier_detected when a video clears 3x baseline with 5+ prior videos", async () => {
    const { freshVideos, upsertData } = buildOutlierFixture();

    serviceFrom.mockReturnValueOnce(channelsTable({ data: CHANNEL_ROW, error: null }));
    serviceFrom.mockReturnValueOnce(videosSelectTable({ data: [], error: null }));
    getChannelVideos.mockResolvedValueOnce({ ok: true, value: freshVideos });
    serviceFrom.mockReturnValueOnce(videosUpsertTable({ data: upsertData, error: null }));
    serviceFrom.mockReturnValueOnce(outlierEventsTable({ data: [], error: null }));
    serviceFrom.mockReturnValueOnce(insertTable());

    const events = await syncChannelData(CHANNEL_ID);
    const outlierEvent = events.find((e) => e.eventType === "outlier_detected");

    expect(outlierEvent).toBeDefined();
    expect(outlierEvent?.payload.videoId).toBe("internal-outlier1");
    expect(outlierEvent?.payload.viewCount).toBe(5000);
    expect(outlierEvent?.payload.baseline).toBe(1000);
    // D-085: stored so notifications can skip back-catalogue outliers.
    expect(outlierEvent?.payload.publishedAt).toEqual(expect.any(String));
    expect(outlierEvent?.payload.outlierScore as number).toBeCloseTo(
      (5000 / 1000) * (1 - 1 / 90),
      2,
    );
  });

  it("also writes a tracked channel's new outlier into the global outliers_feed", async () => {
    const { freshVideos } = buildOutlierFixture();
    const uuidFor = (i: number) => `00000000-0000-4000-8000-00000000000${i}`;
    const upsertData = freshVideos.map((video, i) => ({
      id: uuidFor(i),
      youtube_video_id: video.id,
    }));
    const feedUpsert = vi.fn(() => Promise.resolve({ error: null }));

    serviceFrom.mockReturnValueOnce(
      channelsTable({ data: { ...CHANNEL_ROW, niche_id: "niche-1" }, error: null }),
    );
    serviceFrom.mockReturnValueOnce(videosSelectTable({ data: [], error: null }));
    getChannelVideos.mockResolvedValueOnce({ ok: true, value: freshVideos });
    serviceFrom.mockReturnValueOnce(videosUpsertTable({ data: upsertData, error: null }));
    serviceFrom.mockReturnValueOnce(outlierEventsTable({ data: [], error: null }));
    serviceFrom.mockReturnValueOnce(insertTable());
    serviceFrom.mockReturnValueOnce({ upsert: feedUpsert });

    await syncChannelData(CHANNEL_ID);

    expect(serviceFrom).toHaveBeenLastCalledWith("outliers_feed");
    expect(feedUpsert).toHaveBeenCalledWith(
      [
        {
          video_id: uuidFor(5),
          channel_id: CHANNEL_ID,
          niche_id: "niche-1",
          outlier_multiple: 5,
        },
      ],
      { onConflict: "video_id" },
    );
  });

  it("does not re-emit outlier_detected for a video that already has one (fire-once dedup)", async () => {
    const { freshVideos, upsertData } = buildOutlierFixture();

    serviceFrom.mockReturnValueOnce(channelsTable({ data: CHANNEL_ROW, error: null }));
    serviceFrom.mockReturnValueOnce(videosSelectTable({ data: [], error: null }));
    getChannelVideos.mockResolvedValueOnce({ ok: true, value: freshVideos });
    serviceFrom.mockReturnValueOnce(videosUpsertTable({ data: upsertData, error: null }));
    // This video already got an outlier_detected event in a prior sync.
    serviceFrom.mockReturnValueOnce(
      outlierEventsTable({ data: [{ payload: { videoId: "internal-outlier1" } }], error: null }),
    );
    serviceFrom.mockReturnValueOnce(insertTable());

    const events = await syncChannelData(CHANNEL_ID);

    expect(events.find((e) => e.eventType === "outlier_detected")).toBeUndefined();
  });

  // Edges of the shared scoring rule (lib/outliers/scoring.ts
  // evaluateAgainstChannel). These pin the worker's behaviour from before
  // the logic moved out of this file: they pass against both versions.
  function buildEdgeFixture(priorCount: number, priorViews: number, candidateViews: number) {
    const now = Date.now();
    const daysAgoIso = (days: number) => new Date(now - days * 86_400_000).toISOString();
    const priors = Array.from({ length: priorCount }, (_, i) =>
      makeVideo({
        id: `prior${i}`,
        snippet: { ...makeVideo().snippet, publishedAt: daysAgoIso(20 - i) },
        statistics: { viewCount: priorViews },
      }),
    );
    const candidate = makeVideo({
      id: "candidate",
      snippet: { ...makeVideo().snippet, publishedAt: daysAgoIso(1) },
      statistics: { viewCount: candidateViews },
    });
    const freshVideos = [...priors, candidate];
    return {
      freshVideos,
      upsertData: freshVideos.map((video) => ({
        id: `internal-${video.id}`,
        youtube_video_id: video.id,
      })),
    };
  }

  async function outlierVideoIds(priorCount: number, priorViews: number, candidateViews: number) {
    const { freshVideos, upsertData } = buildEdgeFixture(priorCount, priorViews, candidateViews);
    serviceFrom.mockReturnValueOnce(channelsTable({ data: CHANNEL_ROW, error: null }));
    serviceFrom.mockReturnValueOnce(videosSelectTable({ data: [], error: null }));
    getChannelVideos.mockResolvedValueOnce({ ok: true, value: freshVideos });
    serviceFrom.mockReturnValueOnce(videosUpsertTable({ data: upsertData, error: null }));
    serviceFrom.mockReturnValueOnce(outlierEventsTable({ data: [], error: null }));
    serviceFrom.mockReturnValueOnce(insertTable());
    const events = await syncChannelData(CHANNEL_ID);
    return events
      .filter((event) => event.eventType === "outlier_detected")
      .map((event) => event.payload.videoId);
  }

  it("flags nothing with only 4 earlier videos (cold start), however big the video", async () => {
    expect(await outlierVideoIds(4, 1000, 50_000)).toEqual([]);
  });

  it("does not flag a video just under 3x its baseline", async () => {
    expect(await outlierVideoIds(5, 1000, 2999)).toEqual([]);
  });

  it("flags a video at exactly 3x its baseline", async () => {
    expect(await outlierVideoIds(5, 1000, 3000)).toEqual(["internal-candidate"]);
  });

  it("flags any video when the earlier uploads all have 0 views (baseline 0)", async () => {
    expect(await outlierVideoIds(5, 0, 10)).toContain("internal-candidate");
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

  // profiles' time_zone lookup: .select("id, time_zone").in("id", userIds) --
  // one fewer .eq() than overridesOrPrefsTable's shape.
  function selectInTable(result: { data: unknown[] | null; error: unknown }) {
    return {
      select: vi.fn(() => ({ in: vi.fn(() => Promise.resolve(result)) })),
    };
  }

  // The Promise.all order in fanOutNotifications is fixed: overrides,
  // prefs, subscriptions, profiles. subscriptions shares
  // overridesOrPrefsTable's .select().eq().in() shape.
  function queueDefaultPreferenceLookups() {
    serviceFrom.mockReturnValueOnce(overridesOrPrefsTable({ data: [], error: null })); // overrides
    serviceFrom.mockReturnValueOnce(overridesOrPrefsTable({ data: [], error: null })); // prefs
    serviceFrom.mockReturnValueOnce(overridesOrPrefsTable({ data: [], error: null })); // subscriptions
    serviceFrom.mockReturnValueOnce(selectInTable({ data: [], error: null })); // profiles
  }

  const NEW_VIDEO_EVENT = {
    channelId: CHANNEL_ID,
    channelName: "Sleep Sounds Daily",
    eventType: "new_video" as const,
    payload: { videoId: "v1", title: "Ep 1" },
  };

  describe("back-catalogue outliers (D-085)", () => {
    const outlier = (publishedAt?: string) => ({
      channelId: CHANNEL_ID,
      channelName: "Sleep Sounds Daily",
      eventType: "outlier_detected" as const,
      payload: {
        videoId: "v1",
        title: "Ep 1",
        viewCount: 5000,
        baseline: 1000,
        outlierScore: 5,
        ...(publishedAt ? { publishedAt } : {}),
      },
    });
    const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();

    it("notifies outliers on videos published in the last 30 days", () => {
      expect(isNotifiable(outlier(daysAgo(29)))).toBe(true);
    });

    it("records but never notifies older ones, or ones without a publish date", () => {
      expect(isNotifiable(outlier(daysAgo(31)))).toBe(false);
      expect(isNotifiable(outlier())).toBe(false);
    });

    it("leaves other event types alone", () => {
      expect(isNotifiable(NEW_VIDEO_EVENT)).toBe(true);
    });

    it("sends nothing (no queries) when every event is a back-catalogue outlier", async () => {
      await fanOutNotifications([outlier(daysAgo(326))]);
      expect(serviceFrom).not.toHaveBeenCalled();
    });
  });

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
    queueDefaultPreferenceLookups();
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
    serviceFrom.mockReturnValueOnce(overridesOrPrefsTable({ data: [], error: null })); // prefs
    serviceFrom.mockReturnValueOnce(overridesOrPrefsTable({ data: [], error: null })); // subscriptions
    serviceFrom.mockReturnValueOnce(selectInTable({ data: [], error: null })); // profiles
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
    serviceFrom.mockReturnValueOnce(overridesOrPrefsTable({ data: [], error: null })); // overrides
    serviceFrom.mockReturnValueOnce(
      overridesOrPrefsTable({ data: [{ user_id: "u1", in_app_enabled: false }], error: null }),
    );
    serviceFrom.mockReturnValueOnce(overridesOrPrefsTable({ data: [], error: null })); // subscriptions
    serviceFrom.mockReturnValueOnce(selectInTable({ data: [], error: null })); // profiles
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
    serviceFrom.mockReturnValueOnce(overridesOrPrefsTable({ data: [], error: null })); // subscriptions
    serviceFrom.mockReturnValueOnce(selectInTable({ data: [], error: null })); // profiles
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
    queueDefaultPreferenceLookups();
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
    queueDefaultPreferenceLookups();
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
    queueDefaultPreferenceLookups();
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

    serviceFrom.mockReturnValueOnce(
      trackedChannelsTable({ data: [{ user_id: "u1" }], error: null }),
    );
    queueDefaultPreferenceLookups();
    const outlierInsert = insertTable();
    serviceFrom.mockReturnValueOnce(outlierInsert);

    await fanOutNotifications([
      {
        channelId: CHANNEL_ID,
        channelName: "Sleep Sounds Daily",
        eventType: "outlier_detected",
        payload: {
          videoId: "v1",
          title: "Ep 1",
          viewCount: 5000,
          baseline: 1000,
          outlierScore: 4.94,
          publishedAt: new Date().toISOString(),
        },
      },
    ]);

    expect(outlierInsert.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        title: "Outlier detected on Sleep Sounds Daily",
        body: "Ep 1",
        related_resource: "video:v1",
      }),
    ]);
  });

  function updateTable(result: { error: unknown } = { error: null }) {
    return {
      update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve(result)) })),
    };
  }

  it("sends an email and marks delivered_channels for a Pro-tier, opted-in user", async () => {
    serviceFrom.mockReturnValueOnce(
      trackedChannelsTable({ data: [{ user_id: "u1" }], error: null }),
    );
    serviceFrom.mockReturnValueOnce(overridesOrPrefsTable({ data: [], error: null })); // overrides
    serviceFrom.mockReturnValueOnce(
      overridesOrPrefsTable({
        data: [
          {
            user_id: "u1",
            in_app_enabled: true,
            email_enabled: true,
            quiet_hours_start: null,
            quiet_hours_end: null,
          },
        ],
        error: null,
      }),
    ); // prefs
    serviceFrom.mockReturnValueOnce(
      overridesOrPrefsTable({ data: [{ user_id: "u1", tier: "pro" }], error: null }),
    ); // subscriptions
    serviceFrom.mockReturnValueOnce(
      selectInTable({ data: [{ id: "u1", time_zone: "UTC" }], error: null }),
    ); // profiles
    const notificationsInsert = insertTable({
      error: null,
      data: [{ id: "notif-1", user_id: "u1" }],
    });
    serviceFrom.mockReturnValueOnce(notificationsInsert);
    sendNewVideoEmail.mockResolvedValueOnce(true);
    const updateResult = updateTable();
    serviceFrom.mockReturnValueOnce(updateResult);

    await fanOutNotifications([NEW_VIDEO_EVENT]);

    expect(sendNewVideoEmail).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({ channelId: CHANNEL_ID }),
    );
    expect(updateResult.update).toHaveBeenCalledWith({ delivered_channels: ["in_app", "email"] });
  });

  it("does not email a Starter/trial-tier user even with email_enabled true", async () => {
    serviceFrom.mockReturnValueOnce(
      trackedChannelsTable({ data: [{ user_id: "u1" }], error: null }),
    );
    serviceFrom.mockReturnValueOnce(overridesOrPrefsTable({ data: [], error: null })); // overrides
    serviceFrom.mockReturnValueOnce(
      overridesOrPrefsTable({
        data: [{ user_id: "u1", in_app_enabled: true, email_enabled: true }],
        error: null,
      }),
    ); // prefs
    serviceFrom.mockReturnValueOnce(overridesOrPrefsTable({ data: [], error: null })); // subscriptions: no row = trial
    serviceFrom.mockReturnValueOnce(selectInTable({ data: [], error: null })); // profiles
    serviceFrom.mockReturnValueOnce(
      insertTable({ error: null, data: [{ id: "notif-1", user_id: "u1" }] }),
    );

    await fanOutNotifications([NEW_VIDEO_EVENT]);

    expect(sendNewVideoEmail).not.toHaveBeenCalled();
  });

  it("emails a Team workspace member who has no subscription of their own (D-059)", async () => {
    getEffectivePlans.mockResolvedValueOnce(
      new Map([["u1", { tier: "team", status: "active", teamWorkspaceId: "ws-1" }]]),
    );
    serviceFrom.mockReturnValueOnce(
      trackedChannelsTable({ data: [{ user_id: "u1" }], error: null }),
    );
    serviceFrom.mockReturnValueOnce(overridesOrPrefsTable({ data: [], error: null })); // overrides
    serviceFrom.mockReturnValueOnce(
      overridesOrPrefsTable({
        data: [
          {
            user_id: "u1",
            in_app_enabled: true,
            email_enabled: true,
            quiet_hours_start: null,
            quiet_hours_end: null,
          },
        ],
        error: null,
      }),
    ); // prefs
    serviceFrom.mockReturnValueOnce(overridesOrPrefsTable({ data: [], error: null })); // no own subscription
    serviceFrom.mockReturnValueOnce(
      selectInTable({ data: [{ id: "u1", time_zone: "UTC" }], error: null }),
    ); // profiles
    serviceFrom.mockReturnValueOnce(
      insertTable({ error: null, data: [{ id: "notif-1", user_id: "u1" }] }),
    );
    sendNewVideoEmail.mockResolvedValueOnce(true);
    serviceFrom.mockReturnValueOnce(updateTable());

    await fanOutNotifications([NEW_VIDEO_EVENT]);

    expect(sendNewVideoEmail).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({ channelId: CHANNEL_ID }),
    );
  });

  it("does not email when email_enabled is false", async () => {
    serviceFrom.mockReturnValueOnce(
      trackedChannelsTable({ data: [{ user_id: "u1" }], error: null }),
    );
    serviceFrom.mockReturnValueOnce(overridesOrPrefsTable({ data: [], error: null })); // overrides
    serviceFrom.mockReturnValueOnce(
      overridesOrPrefsTable({
        data: [{ user_id: "u1", in_app_enabled: true, email_enabled: false }],
        error: null,
      }),
    ); // prefs
    serviceFrom.mockReturnValueOnce(
      overridesOrPrefsTable({ data: [{ user_id: "u1", tier: "pro" }], error: null }),
    ); // subscriptions
    serviceFrom.mockReturnValueOnce(selectInTable({ data: [], error: null })); // profiles
    serviceFrom.mockReturnValueOnce(
      insertTable({ error: null, data: [{ id: "notif-1", user_id: "u1" }] }),
    );

    await fanOutNotifications([NEW_VIDEO_EVENT]);

    expect(sendNewVideoEmail).not.toHaveBeenCalled();
  });

  it("does not email a Pro user currently in their quiet hours", async () => {
    const now = new Date();
    const nowUtcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    // A window that always contains "now" in UTC, regardless of when the
    // test runs: [now-1h, now+1h), formatted as HH:MM:SS.
    const toHms = (totalMinutes: number) => {
      const wrapped = ((totalMinutes % 1440) + 1440) % 1440;
      const h = String(Math.floor(wrapped / 60)).padStart(2, "0");
      const m = String(wrapped % 60).padStart(2, "0");
      return `${h}:${m}:00`;
    };

    serviceFrom.mockReturnValueOnce(
      trackedChannelsTable({ data: [{ user_id: "u1" }], error: null }),
    );
    serviceFrom.mockReturnValueOnce(overridesOrPrefsTable({ data: [], error: null })); // overrides
    serviceFrom.mockReturnValueOnce(
      overridesOrPrefsTable({
        data: [
          {
            user_id: "u1",
            in_app_enabled: true,
            email_enabled: true,
            quiet_hours_start: toHms(nowUtcMinutes - 60),
            quiet_hours_end: toHms(nowUtcMinutes + 60),
          },
        ],
        error: null,
      }),
    ); // prefs
    serviceFrom.mockReturnValueOnce(
      overridesOrPrefsTable({ data: [{ user_id: "u1", tier: "pro" }], error: null }),
    ); // subscriptions
    serviceFrom.mockReturnValueOnce(
      selectInTable({ data: [{ id: "u1", time_zone: "UTC" }], error: null }),
    ); // profiles
    serviceFrom.mockReturnValueOnce(
      insertTable({ error: null, data: [{ id: "notif-1", user_id: "u1" }] }),
    );

    await fanOutNotifications([NEW_VIDEO_EVENT]);

    expect(sendNewVideoEmail).not.toHaveBeenCalled();
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
    queueDefaultPreferenceLookups();
    serviceFrom.mockReturnValueOnce(insertTable({ error: { message: "db down" } }));

    await expect(fanOutNotifications([NEW_VIDEO_EVENT])).rejects.toThrow(
      "fanOutNotifications insert failed",
    );
  });
});
