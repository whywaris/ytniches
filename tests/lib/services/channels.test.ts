import { beforeEach, describe, expect, it, vi } from "vitest";

const limitMock = vi.fn();
vi.mock("@upstash/ratelimit", () => {
  class MockRatelimit {
    static slidingWindow = vi.fn(() => "mock-limiter");
    limit = limitMock;
  }
  return { Ratelimit: MockRatelimit };
});

vi.mock("@/lib/cache/redis", () => ({
  getRedis: () => ({}),
}));

const getBalance = vi.fn();
const consume = vi.fn();
vi.mock("@/lib/credits", () => ({
  getBalance: (...args: unknown[]) => getBalance(...args),
  consume: (...args: unknown[]) => consume(...args),
}));

const getCachedSearchResult = vi.fn();
vi.mock("@/lib/youtube/cache", () => ({
  getCachedSearchResult: (...args: unknown[]) => getCachedSearchResult(...args),
}));

const searchChannelIds = vi.fn();
const getChannelsByIds = vi.fn();
vi.mock("@/lib/youtube", () => ({
  searchChannelIds: (...args: unknown[]) => searchChannelIds(...args),
  getChannelsByIds: (...args: unknown[]) => getChannelsByIds(...args),
}));

const sessionFrom = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ from: sessionFrom }),
}));

const serviceFrom = vi.fn();
vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({ from: serviceFrom }),
}));

const { searchNiches, saveChannelToTracking, getChannelDetail, listVideosForChannel } =
  await import("@/lib/services/channels");

const ctx = { userId: "user-1" };

function makeChannel(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "UC1",
    snippet: {
      title: "Sleep Sounds Daily",
      description: "",
      publishedAt: "2020-01-01T00:00:00Z",
      customUrl: "@sleepsounds",
      country: "US",
      defaultLanguage: "en",
    },
    statistics: {
      viewCount: 900_000,
      subscriberCount: 480_000,
      videoCount: 300,
      hiddenSubscriberCount: false,
    },
    brandingSettings: {},
    ...overrides,
  };
}

function defaultFilters(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    uploadFrequency: "any" as const,
    monetized: "any" as const,
    sort: "relevance" as const,
    page: 1,
    ...overrides,
  };
}

function channelsUpsertTable(result: { data: unknown[]; error: unknown }) {
  return {
    upsert: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve(result)),
    })),
  };
}

function videosTable(result: { data: unknown[]; error: unknown }) {
  return {
    select: vi.fn(() => ({
      in: vi.fn(() => Promise.resolve(result)),
    })),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  limitMock.mockResolvedValue({ success: true, reset: Date.now() + 60_000 });
});

describe("searchNiches", () => {
  it("returns rate_limited without touching credits or YouTube when the limiter blocks", async () => {
    limitMock.mockResolvedValueOnce({ success: false, reset: Date.now() + 5_000 });

    const result = await searchNiches(ctx, defaultFilters(), "key-1");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe("rate_limited");
    }
    expect(getBalance).not.toHaveBeenCalled();
    expect(searchChannelIds).not.toHaveBeenCalled();
  });

  it("returns insufficient_credits on a cache miss when the balance is too low", async () => {
    getCachedSearchResult.mockResolvedValueOnce(null);
    getBalance.mockResolvedValueOnce(0);

    const result = await searchNiches(ctx, defaultFilters(), "key-1");

    expect(result).toEqual({
      ok: false,
      error: { type: "insufficient_credits", balance: 0, required: 1 },
    });
    expect(searchChannelIds).not.toHaveBeenCalled();
  });

  it("maps a quota_exceeded YouTube error to quota_exhausted", async () => {
    getCachedSearchResult.mockResolvedValueOnce(null);
    getBalance.mockResolvedValueOnce(10);
    searchChannelIds.mockResolvedValueOnce({ ok: false, error: { type: "quota_exceeded" } });

    const result = await searchNiches(ctx, defaultFilters(), "key-1");

    expect(result).toEqual({ ok: false, error: { type: "quota_exhausted" } });
    expect(consume).not.toHaveBeenCalled();
  });

  it("on a cache hit, returns results without calling getBalance, consume, or hitting quota", async () => {
    getCachedSearchResult.mockResolvedValueOnce(["UC1"]);
    searchChannelIds.mockResolvedValueOnce({ ok: true, value: ["UC1"] });
    getChannelsByIds.mockResolvedValueOnce({ ok: true, value: [makeChannel()] });
    serviceFrom.mockReturnValueOnce(
      channelsUpsertTable({ data: [{ id: "internal-1", youtube_channel_id: "UC1" }], error: null }),
    );
    sessionFrom.mockReturnValueOnce(videosTable({ data: [], error: null }));

    const result = await searchNiches(ctx, defaultFilters(), "key-1");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveLength(1);
      expect(result.value[0].youtubeChannelId).toBe("UC1");
    }
    expect(getBalance).not.toHaveBeenCalled();
    expect(consume).not.toHaveBeenCalled();
  });

  it("on a cache miss, calls YouTube, upserts into channels, and consumes exactly one credit", async () => {
    getCachedSearchResult.mockResolvedValueOnce(null);
    getBalance.mockResolvedValueOnce(10);
    searchChannelIds.mockResolvedValueOnce({ ok: true, value: ["UC1"] });
    getChannelsByIds.mockResolvedValueOnce({ ok: true, value: [makeChannel()] });
    const upsertTable = channelsUpsertTable({
      data: [{ id: "internal-1", youtube_channel_id: "UC1" }],
      error: null,
    });
    serviceFrom.mockReturnValueOnce(upsertTable);
    sessionFrom.mockReturnValueOnce(videosTable({ data: [], error: null }));
    consume.mockResolvedValueOnce({ ok: true, value: undefined });

    const result = await searchNiches(ctx, defaultFilters(), "key-1");

    expect(result.ok).toBe(true);
    expect(upsertTable.upsert).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ youtube_channel_id: "UC1" })]),
      { onConflict: "youtube_channel_id" },
    );
    expect(consume).toHaveBeenCalledWith(ctx, 1, "Niche search", "key-1");
  });

  it("applies the avgViewsMin filter against DB video rows, excluding channels below it", async () => {
    getCachedSearchResult.mockResolvedValueOnce(null);
    getBalance.mockResolvedValueOnce(10);
    searchChannelIds.mockResolvedValueOnce({ ok: true, value: ["UC1", "UC2"] });
    getChannelsByIds.mockResolvedValueOnce({
      ok: true,
      value: [makeChannel({ id: "UC1" }), makeChannel({ id: "UC2" })],
    });
    serviceFrom.mockReturnValueOnce(
      channelsUpsertTable({
        data: [
          { id: "internal-1", youtube_channel_id: "UC1" },
          { id: "internal-2", youtube_channel_id: "UC2" },
        ],
        error: null,
      }),
    );
    const recentPublished = new Date().toISOString();
    sessionFrom.mockReturnValueOnce(
      videosTable({
        data: [
          // UC1: high recent views -> passes a high avgViewsMin
          { channel_id: "internal-1", view_count: 500_000, published_at: recentPublished },
          // UC2: low recent views -> fails the same filter
          { channel_id: "internal-2", view_count: 100, published_at: recentPublished },
        ],
        error: null,
      }),
    );
    consume.mockResolvedValueOnce({ ok: true, value: undefined });

    const result = await searchNiches(ctx, defaultFilters({ avgViewsMin: 10_000 }), "key-1");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.map((r) => r.youtubeChannelId)).toEqual(["UC1"]);
    }
  });

  it("returns viewTrend sorted oldest-to-newest regardless of DB row order", async () => {
    getCachedSearchResult.mockResolvedValueOnce(null);
    getBalance.mockResolvedValueOnce(10);
    searchChannelIds.mockResolvedValueOnce({ ok: true, value: ["UC1"] });
    getChannelsByIds.mockResolvedValueOnce({ ok: true, value: [makeChannel({ id: "UC1" })] });
    serviceFrom.mockReturnValueOnce(
      channelsUpsertTable({ data: [{ id: "internal-1", youtube_channel_id: "UC1" }], error: null }),
    );
    sessionFrom.mockReturnValueOnce(
      videosTable({
        data: [
          // Rows arrive out of chronological order.
          { channel_id: "internal-1", view_count: 300, published_at: "2024-03-01T00:00:00Z" },
          { channel_id: "internal-1", view_count: 100, published_at: "2024-01-01T00:00:00Z" },
          { channel_id: "internal-1", view_count: 200, published_at: "2024-02-01T00:00:00Z" },
        ],
        error: null,
      }),
    );
    consume.mockResolvedValueOnce({ ok: true, value: undefined });

    const result = await searchNiches(ctx, defaultFilters(), "key-1");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value[0].viewTrend).toEqual([100, 200, 300]);
    }
  });

  it("returns an empty viewTrend for a cold-cache channel with no video rows", async () => {
    getCachedSearchResult.mockResolvedValueOnce(null);
    getBalance.mockResolvedValueOnce(10);
    searchChannelIds.mockResolvedValueOnce({ ok: true, value: ["UC1"] });
    getChannelsByIds.mockResolvedValueOnce({ ok: true, value: [makeChannel({ id: "UC1" })] });
    serviceFrom.mockReturnValueOnce(
      channelsUpsertTable({ data: [{ id: "internal-1", youtube_channel_id: "UC1" }], error: null }),
    );
    sessionFrom.mockReturnValueOnce(videosTable({ data: [], error: null }));
    consume.mockResolvedValueOnce({ ok: true, value: undefined });

    const result = await searchNiches(ctx, defaultFilters(), "key-1");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value[0].viewTrend).toEqual([]);
    }
  });
});

describe("saveChannelToTracking", () => {
  function subscriptionsTable(result: { data: unknown; error: unknown }) {
    return {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({ maybeSingle: vi.fn(() => Promise.resolve(result)) })),
        })),
      })),
    };
  }

  function trackedChannelsTable(
    countResult: { count: number | null; error: unknown },
    insertResult: { error: unknown },
  ) {
    return {
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve(countResult)),
      })),
      insert: vi.fn(() => Promise.resolve(insertResult)),
    };
  }

  it("saves successfully when under the tier limit", async () => {
    sessionFrom.mockImplementation((table: string) => {
      if (table === "subscriptions")
        return subscriptionsTable({ data: { tier: "pro" }, error: null });
      if (table === "tracked_channels")
        return trackedChannelsTable({ count: 3, error: null }, { error: null });
      throw new Error(`unexpected table ${table}`);
    });

    const result = await saveChannelToTracking(ctx, "internal-1");

    expect(result).toEqual({ ok: true, value: undefined });
  });

  it("treats an already-tracked channel as an idempotent success, not an error", async () => {
    sessionFrom.mockImplementation((table: string) => {
      if (table === "subscriptions")
        return subscriptionsTable({ data: { tier: "pro" }, error: null });
      if (table === "tracked_channels")
        return trackedChannelsTable(
          { count: 3, error: null },
          { error: { message: "duplicate key value violates unique constraint", code: "23505" } },
        );
      throw new Error(`unexpected table ${table}`);
    });

    const result = await saveChannelToTracking(ctx, "internal-1");

    expect(result).toEqual({ ok: true, value: undefined });
  });

  it("returns a tier_limit error at the cap, without a subscription row defaulting to the trial limit of 10", async () => {
    sessionFrom.mockImplementation((table: string) => {
      if (table === "subscriptions") return subscriptionsTable({ data: null, error: null });
      if (table === "tracked_channels")
        return trackedChannelsTable({ count: 10, error: null }, { error: null });
      throw new Error(`unexpected table ${table}`);
    });

    const result = await saveChannelToTracking(ctx, "internal-1");

    expect(result).toEqual({ ok: false, error: { type: "tier_limit", limit: 10, current: 10 } });
  });
});

describe("getChannelDetail", () => {
  function channelsDetailTable(result: { data: unknown; error: unknown }) {
    return {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ maybeSingle: vi.fn(() => Promise.resolve(result)) })),
      })),
    };
  }

  it("returns not_found when no channel matches the ID", async () => {
    sessionFrom.mockReturnValueOnce(channelsDetailTable({ data: null, error: null }));

    const result = await getChannelDetail(ctx, "missing-id");

    expect(result).toEqual({ ok: false, error: { type: "not_found" } });
  });

  it("returns full channel detail on success", async () => {
    sessionFrom.mockReturnValueOnce(
      channelsDetailTable({
        data: {
          id: "internal-1",
          youtube_channel_id: "UC1",
          name: "Sleep Sounds Daily",
          avatar_url: null,
          subscriber_count: 480_000,
          video_count: 300,
          is_monetized: null,
          language: "en",
          country: "US",
          youtube_created_at: "2020-01-01T00:00:00Z",
          description: "A channel",
          banner_url: null,
          handle: "@sleepsounds",
        },
        error: null,
      }),
    );
    sessionFrom.mockReturnValueOnce(videosTable({ data: [], error: null }));

    const result = await getChannelDetail(ctx, "internal-1");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.youtubeUrl).toBe("https://www.youtube.com/@sleepsounds");
    }
  });
});

describe("listVideosForChannel", () => {
  function videosByChannelTable(result: { data: unknown[]; error: unknown }) {
    const builder = {
      select: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      order: vi.fn(() => builder),
      limit: vi.fn(() => builder),
      then: (resolve: (value: typeof result) => void) => resolve(result),
    };
    return builder;
  }

  it("reshapes cached video rows, newest first", async () => {
    sessionFrom.mockReturnValueOnce(
      videosByChannelTable({
        data: [
          {
            id: "vid-1",
            title: "How to pick a niche",
            thumbnail_url: "https://example.com/thumb.jpg",
            view_count: 91_200,
            published_at: "2026-01-01T00:00:00Z",
            duration_seconds: 605,
          },
        ],
        error: null,
      }),
    );

    const result = await listVideosForChannel("internal-1");

    expect(result).toEqual([
      {
        id: "vid-1",
        title: "How to pick a niche",
        thumbnailUrl: "https://example.com/thumb.jpg",
        viewCount: 91_200,
        publishedAt: "2026-01-01T00:00:00Z",
        durationSeconds: 605,
      },
    ]);
  });

  it("throws on a query failure", async () => {
    sessionFrom.mockReturnValueOnce(
      videosByChannelTable({ data: [], error: { message: "db down" } }),
    );

    await expect(listVideosForChannel("internal-1")).rejects.toThrow(
      "listVideosForChannel query failed",
    );
  });

  it("sorts by view_count when sortBy is 'views'", async () => {
    const builder = videosByChannelTable({ data: [], error: null });
    sessionFrom.mockReturnValueOnce(builder);

    await listVideosForChannel("internal-1", { sortBy: "views" });

    expect(builder.order).toHaveBeenCalledWith("view_count", { ascending: false });
  });

  it("applies a limit when given (e.g. top 10 by views for the prompt generator's video picker)", async () => {
    const builder = videosByChannelTable({ data: [], error: null });
    sessionFrom.mockReturnValueOnce(builder);

    await listVideosForChannel("internal-1", { sortBy: "views", limit: 10 });

    expect(builder.limit).toHaveBeenCalledWith(10);
  });

  it("does not call limit when none is given", async () => {
    const builder = videosByChannelTable({ data: [], error: null });
    sessionFrom.mockReturnValueOnce(builder);

    await listVideosForChannel("internal-1");

    expect(builder.limit).not.toHaveBeenCalled();
  });
});
