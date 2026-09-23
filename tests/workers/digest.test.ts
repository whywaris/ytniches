import { beforeEach, describe, expect, it, vi } from "vitest";

const serviceFrom = vi.fn();
const rpc = vi.fn();
vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({ from: serviceFrom, rpc }),
}));

const buildOutlierItems = vi.fn();
vi.mock("@/lib/services/outliers", () => ({
  buildOutlierItems: (...args: unknown[]) => buildOutlierItems(...args),
}));

const sendWeeklyDigestEmail = vi.fn();
vi.mock("@/lib/email/notifications", () => ({
  sendWeeklyDigestEmail: (...args: unknown[]) => sendWeeklyDigestEmail(...args),
}));

const { dispatchDueDigests, buildDigestData, sendDigestForUser } = await import("@/workers/digest");

// Chainable/thenable double: every filter/order/select method returns the
// same object (any call order works), and awaiting it directly resolves to
// `result` -- same pattern as tests/lib/services/outliers.test.ts.
function makeQueryBuilder(result: { data: unknown; error: unknown }) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    in: vi.fn(() => builder),
    gte: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    then: (resolve: (value: typeof result) => void) => resolve(result),
  };
  return builder;
}

function fakeStep() {
  return {
    run: vi.fn((...args: [string, () => unknown]) => Promise.resolve(args[1]())),
    sendEvent: vi.fn(() => Promise.resolve()),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("dispatchDueDigests", () => {
  it("dispatches 0 events when no users are due", async () => {
    rpc.mockResolvedValueOnce({ data: [], error: null });

    const result = await dispatchDueDigests(fakeStep());

    expect(result).toEqual({ dispatched: 0 });
  });

  it("dispatches one digest/send.requested event per due user, in a single batched call", async () => {
    rpc.mockResolvedValueOnce({
      data: [
        { user_id: "u1", cadence: "daily" },
        { user_id: "u2", cadence: "weekly" },
      ],
      error: null,
    });
    const step = fakeStep();

    const result = await dispatchDueDigests(step);

    expect(step.sendEvent).toHaveBeenCalledTimes(1);
    expect(step.sendEvent).toHaveBeenCalledWith("dispatch-digest-events", [
      { name: "digest/send.requested", data: { userId: "u1", cadence: "daily" } },
      { name: "digest/send.requested", data: { userId: "u2", cadence: "weekly" } },
    ]);
    expect(result).toEqual({ dispatched: 2 });
  });

  it("throws when the due-users query fails, without dispatching anything", async () => {
    rpc.mockResolvedValueOnce({ data: null, error: { message: "db down" } });
    const step = fakeStep();

    await expect(dispatchDueDigests(step)).rejects.toThrow("findDueDigestUsers failed");
    expect(step.sendEvent).not.toHaveBeenCalled();
  });
});

describe("buildDigestData", () => {
  it("returns an empty digest without further queries when the user tracks no channels", async () => {
    serviceFrom.mockReturnValueOnce(makeQueryBuilder({ data: [], error: null })); // tracked_channels

    const data = await buildDigestData("user-1", "daily");

    expect(data).toEqual({ cadence: "daily", topOutliers: [], newVideos: [] });
    expect(serviceFrom).toHaveBeenCalledTimes(1);
  });

  it("maps top outliers from buildOutlierItems, sorted by score and capped at 5, with a prompt deep link", async () => {
    serviceFrom.mockReturnValueOnce(
      makeQueryBuilder({ data: [{ channel_id: "chan-1" }], error: null }),
    ); // tracked_channels
    serviceFrom.mockReturnValueOnce(makeQueryBuilder({ data: [{ id: "e1" }], error: null })); // tracked_events
    serviceFrom.mockReturnValueOnce(makeQueryBuilder({ data: [], error: null })); // videos (new videos)
    // channels query is skipped: no new-video rows -> no channel ids to join.

    buildOutlierItems.mockResolvedValueOnce(
      Array.from({ length: 7 }, (_, i) => ({
        id: `e${i}`,
        channelId: "chan-1",
        channelName: "Sleep Sounds Daily",
        videoId: `vid-${i}`,
        videoTitle: `Video ${i}`,
        viewCount: 1000,
        outlierScore: i, // ascending, so sort must reverse this
      })),
    );

    const data = await buildDigestData("user-1", "weekly");

    expect(data.topOutliers).toHaveLength(5);
    expect(data.topOutliers[0]).toEqual({
      title: "Video 6",
      channelName: "Sleep Sounds Daily",
      url: "http://localhost:3000/prompts?channelId=chan-1&videoId=vid-6",
      viewCount: 1000,
    });
    // Sorted descending by score: 6,5,4,3,2 (0 and 1 dropped by the cap).
    expect(data.topOutliers.map((item) => item.title)).toEqual([
      "Video 6",
      "Video 5",
      "Video 4",
      "Video 3",
      "Video 2",
    ]);
  });

  it("maps new videos with channel names joined in, capped at 5", async () => {
    serviceFrom.mockReturnValueOnce(
      makeQueryBuilder({ data: [{ channel_id: "chan-1" }], error: null }),
    ); // tracked_channels
    serviceFrom.mockReturnValueOnce(makeQueryBuilder({ data: [], error: null })); // tracked_events
    serviceFrom.mockReturnValueOnce(
      makeQueryBuilder({
        data: Array.from({ length: 6 }, (_, i) => ({
          title: `New video ${i}`,
          channel_id: "chan-1",
          published_at: new Date(Date.now() - i * 1000).toISOString(),
        })),
        error: null,
      }),
    ); // videos
    buildOutlierItems.mockResolvedValueOnce([]);
    serviceFrom.mockReturnValueOnce(
      makeQueryBuilder({ data: [{ id: "chan-1", name: "Sleep Sounds Daily" }], error: null }),
    ); // channels

    const data = await buildDigestData("user-1", "daily");

    expect(data.newVideos).toHaveLength(5);
    expect(data.newVideos[0]).toEqual({
      title: "New video 0",
      channelName: "Sleep Sounds Daily",
      url: "http://localhost:3000/tracking/chan-1",
    });
  });
});

describe("sendDigestForUser", () => {
  it("sends the digest when it has at least one item", async () => {
    serviceFrom.mockReturnValueOnce(
      makeQueryBuilder({ data: [{ channel_id: "chan-1" }], error: null }),
    );
    serviceFrom.mockReturnValueOnce(makeQueryBuilder({ data: [{ id: "e1" }], error: null }));
    serviceFrom.mockReturnValueOnce(makeQueryBuilder({ data: [], error: null }));
    buildOutlierItems.mockResolvedValueOnce([
      {
        id: "e1",
        channelId: "chan-1",
        channelName: "Chan",
        videoId: "v1",
        videoTitle: "T",
        viewCount: 100,
        outlierScore: 4,
      },
    ]);
    sendWeeklyDigestEmail.mockResolvedValueOnce(true);

    const sent = await sendDigestForUser("user-1", "daily");

    expect(sent).toBe(true);
    expect(sendWeeklyDigestEmail).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ cadence: "daily" }),
    );
  });

  it("does not send when both lists are empty", async () => {
    serviceFrom.mockReturnValueOnce(makeQueryBuilder({ data: [], error: null })); // no tracked channels

    const sent = await sendDigestForUser("user-1", "daily");

    expect(sent).toBe(false);
    expect(sendWeeklyDigestEmail).not.toHaveBeenCalled();
  });
});
