import { beforeEach, describe, expect, it, vi } from "vitest";

const sessionFrom = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ from: sessionFrom }),
}));

const { listOutlierFeed, listTopOutliers, listChannelOutliers } =
  await import("@/lib/services/outliers");

const ctx = { userId: "user-1", workspaceId: null, tier: null };

// Same chainable/thenable double as tests/lib/services/tracking.test.ts.
function makeQueryBuilder(result: { data: unknown; error: unknown }) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    gte: vi.fn(() => builder),
    in: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    or: vi.fn((): unknown => builder),
    then: (resolve: (value: typeof result) => void) => resolve(result),
  };
  return builder;
}

function trackedChannelRows(channelIds: string[]) {
  return makeQueryBuilder({ data: channelIds.map((channel_id) => ({ channel_id })), error: null });
}

function outlierEventRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "e1",
    channel_id: "chan-1",
    event_type: "outlier_detected",
    // Detection-time snapshot -- deliberately different from the "live"
    // video row below, to prove live values win.
    payload: { videoId: "vid-1", title: "Stale title", viewCount: 4000, baseline: 1000 },
    detected_at: "2026-01-05T00:00:00Z",
    ...overrides,
  };
}

function videoRows(rows: Partial<Record<string, unknown>>[] = []) {
  return makeQueryBuilder({
    data: rows.map((overrides) => ({
      id: "vid-1",
      title: "Live title",
      thumbnail_url: "https://example.com/thumb.jpg",
      view_count: 6000,
      published_at: "2026-01-01T00:00:00Z",
      ...overrides,
    })),
    error: null,
  });
}

function channelRows(rows: Partial<Record<string, unknown>>[] = []) {
  return makeQueryBuilder({
    data: rows.map((overrides) => ({
      id: "chan-1",
      name: "Sleep Sounds Daily",
      avatar_url: "https://example.com/avatar.jpg",
      ...overrides,
    })),
    error: null,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("listOutlierFeed", () => {
  it("returns an empty page without querying tracked_events when the user tracks no channels", async () => {
    sessionFrom.mockReturnValueOnce(trackedChannelRows([]));

    const result = await listOutlierFeed(ctx, { published: "all" });

    expect(result).toEqual({ ok: true, value: { items: [], nextCursor: null } });
    expect(sessionFrom).toHaveBeenCalledTimes(1);
  });

  it("joins in live view_count/title over the detection-time payload snapshot", async () => {
    sessionFrom.mockReturnValueOnce(trackedChannelRows(["chan-1"]));
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: [outlierEventRow()], error: null }));
    sessionFrom.mockReturnValueOnce(videoRows([{}]));
    sessionFrom.mockReturnValueOnce(channelRows([{}]));

    const result = await listOutlierFeed(ctx, { published: "all" });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.items).toHaveLength(1);
    const item = result.value.items[0];
    expect(item.videoTitle).toBe("Live title");
    expect(item.viewCount).toBe(6000); // live, not the payload's stale 4,000
    expect(item.baseline).toBe(1000); // reused as-is from the detection payload
    // published_at is well over 90 days before "now" -> recency weight
    // floors at 0.1, so score = (6000 / 1000) * 0.1 = 0.6, deterministically.
    expect(item.outlierScore).toBeCloseTo(0.6, 5);
    // D-085: the card shows the true multiple, never the decayed score.
    expect(item.multiple).toBe(6);
    expect(item.channelName).toBe("Sleep Sounds Daily");
  });

  it("drops an outlier event whose video row is missing (e.g. purged from cache)", async () => {
    sessionFrom.mockReturnValueOnce(trackedChannelRows(["chan-1"]));
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: [outlierEventRow()], error: null }));
    sessionFrom.mockReturnValueOnce(videoRows([])); // no matching video row
    sessionFrom.mockReturnValueOnce(channelRows([{}]));

    const result = await listOutlierFeed(ctx, { published: "all" });

    expect(result).toEqual({ ok: true, value: { items: [], nextCursor: null } });
  });

  it("returns invalid_cursor for a malformed cursor, without querying", async () => {
    const result = await listOutlierFeed(ctx, { cursor: "not-valid-base64url-json" });

    expect(result).toEqual({ ok: false, error: { type: "invalid_cursor" } });
    expect(sessionFrom).not.toHaveBeenCalled();
  });

  it("returns a nextCursor when more rows exist beyond the page", async () => {
    sessionFrom.mockReturnValueOnce(trackedChannelRows(["chan-1"]));
    const rows = [
      outlierEventRow({ id: "e2", detected_at: "2026-01-06T00:00:00Z" }),
      outlierEventRow({ id: "e1", detected_at: "2026-01-05T00:00:00Z" }),
    ];
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: rows, error: null }));
    sessionFrom.mockReturnValueOnce(videoRows([{}, {}]));
    sessionFrom.mockReturnValueOnce(channelRows([{}]));

    const result = await listOutlierFeed(ctx, { limit: 1, published: "all" });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.items).toHaveLength(1);
    expect(result.value.nextCursor).not.toBeNull();
  });
});

describe("listTopOutliers", () => {
  it("returns [] without querying tracked_events when the user tracks no channels", async () => {
    sessionFrom.mockReturnValueOnce(trackedChannelRows([]));

    const items = await listTopOutliers(ctx, { view: "grid" });

    expect(items).toEqual([]);
    expect(sessionFrom).toHaveBeenCalledTimes(1);
  });

  it("ranks by live outlier score, highest first", async () => {
    sessionFrom.mockReturnValueOnce(trackedChannelRows(["chan-1"]));
    const rows = [
      outlierEventRow({
        id: "low",
        payload: { videoId: "vid-low", title: "Low", viewCount: 3000, baseline: 1000 },
      }),
      outlierEventRow({
        id: "high",
        payload: { videoId: "vid-high", title: "High", viewCount: 9000, baseline: 1000 },
      }),
    ];
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: rows, error: null }));
    sessionFrom.mockReturnValueOnce(
      videoRows([
        { id: "vid-low", view_count: 3000 },
        { id: "vid-high", view_count: 9000 },
      ]),
    );
    sessionFrom.mockReturnValueOnce(channelRows([{}]));

    const items = await listTopOutliers(ctx, { view: "grid", published: "all" });

    expect(items.map((item) => item.videoId)).toEqual(["vid-high", "vid-low"]);
  });

  it("caps results at the requested limit", async () => {
    sessionFrom.mockReturnValueOnce(trackedChannelRows(["chan-1"]));
    const rows = Array.from({ length: 3 }, (_, i) =>
      outlierEventRow({
        id: `e${i}`,
        payload: { videoId: `vid-${i}`, title: `V${i}`, viewCount: 3000, baseline: 1000 },
      }),
    );
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: rows, error: null }));
    sessionFrom.mockReturnValueOnce(
      videoRows(Array.from({ length: 3 }, (_, i) => ({ id: `vid-${i}` }))),
    );
    sessionFrom.mockReturnValueOnce(channelRows([{}]));

    const items = await listTopOutliers(ctx, { view: "trending", limit: 2, published: "all" });

    expect(items).toHaveLength(2);
  });
});

describe("publish-date window (D-085)", () => {
  const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();
  const threeVideos = () =>
    videoRows([
      { id: "vid-new", published_at: daysAgo(3) },
      { id: "vid-67", published_at: daysAgo(67) },
      { id: "vid-326", published_at: daysAgo(326) },
    ]);
  const threeEvents = () =>
    makeQueryBuilder({
      data: ["vid-new", "vid-67", "vid-326"].map((videoId, i) =>
        outlierEventRow({
          id: `e${i}`,
          payload: { videoId, title: videoId, viewCount: 5000, baseline: 1000 },
        }),
      ),
      error: null,
    });

  it.each([
    [undefined, ["vid-new"]],
    [90, ["vid-new", "vid-67"]],
    ["all", ["vid-new", "vid-67", "vid-326"]],
  ] as const)(
    "grid with published=%s keeps %j (default is 30 days)",
    async (published, expected) => {
      sessionFrom.mockReturnValueOnce(trackedChannelRows(["chan-1"]));
      sessionFrom.mockReturnValueOnce(threeEvents());
      sessionFrom.mockReturnValueOnce(threeVideos());
      sessionFrom.mockReturnValueOnce(channelRows([{}]));

      const items = await listTopOutliers(ctx, { view: "grid", published });

      expect(items.map((item) => item.videoId).sort()).toEqual([...expected].sort());
    },
  );

  it("shows an old outlier's true multiple, not its decayed score", async () => {
    sessionFrom.mockReturnValueOnce(trackedChannelRows(["chan-1"]));
    sessionFrom.mockReturnValueOnce(threeEvents());
    sessionFrom.mockReturnValueOnce(threeVideos());
    sessionFrom.mockReturnValueOnce(channelRows([{}]));

    const items = await listTopOutliers(ctx, { view: "grid", published: "all" });
    const old = items.find((item) => item.videoId === "vid-326")!;

    expect(old.multiple).toBeCloseTo(6, 5); // live 6,000 views / 1,000 baseline
    expect(old.outlierScore).toBeCloseTo(0.6, 5); // floored recency weight, ranking only
  });

  it("tops up a feed page from the next batch when old outliers are filtered out", async () => {
    sessionFrom.mockReturnValueOnce(trackedChannelRows(["chan-1"]));
    // Batch 1: one old outlier (filtered out), more rows exist.
    sessionFrom.mockReturnValueOnce(
      makeQueryBuilder({
        data: [
          outlierEventRow({
            id: "e2",
            detected_at: "2026-09-29T00:00:00Z",
            payload: { videoId: "vid-old", title: "old", viewCount: 5000, baseline: 1000 },
          }),
          outlierEventRow({ id: "e1", detected_at: "2026-09-28T00:00:00Z" }),
        ],
        error: null,
      }),
    );
    sessionFrom.mockReturnValueOnce(videoRows([{ id: "vid-old", published_at: daysAgo(200) }]));
    sessionFrom.mockReturnValueOnce(channelRows([{}]));
    // Batch 2: a recent one.
    sessionFrom.mockReturnValueOnce(
      makeQueryBuilder({
        data: [
          outlierEventRow({
            id: "e1",
            detected_at: "2026-09-28T00:00:00Z",
            payload: { videoId: "vid-recent", title: "recent", viewCount: 5000, baseline: 1000 },
          }),
        ],
        error: null,
      }),
    );
    sessionFrom.mockReturnValueOnce(videoRows([{ id: "vid-recent", published_at: daysAgo(2) }]));
    sessionFrom.mockReturnValueOnce(channelRows([{}]));

    const result = await listOutlierFeed(ctx, { limit: 1 });

    expect(result.ok && result.value.items.map((item) => item.videoId)).toEqual(["vid-recent"]);
    expect(result.ok && result.value.nextCursor).toBeNull();
  });
});

describe("listChannelOutliers", () => {
  it("returns invalid_cursor for a malformed cursor", async () => {
    const result = await listChannelOutliers(ctx, "chan-1", { cursor: "garbage" });

    expect(result).toEqual({ ok: false, error: { type: "invalid_cursor" } });
    expect(sessionFrom).not.toHaveBeenCalled();
  });

  it("returns this channel's outliers joined with live data", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: [outlierEventRow()], error: null }));
    sessionFrom.mockReturnValueOnce(videoRows([{}]));
    sessionFrom.mockReturnValueOnce(channelRows([{}]));

    const result = await listChannelOutliers(ctx, "chan-1");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.items).toHaveLength(1);
    expect(result.value.items[0].channelId).toBe("chan-1");
  });
});
