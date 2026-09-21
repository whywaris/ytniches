import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();
vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({ rpc }),
}));

const { dispatchDueChannelSyncs } = await import("@/workers/cron");

function fakeStep() {
  return {
    run: vi.fn((...args: [string, () => unknown]) => Promise.resolve(args[1]())),
    sendEvent: vi.fn(() => Promise.resolve()),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("dispatchDueChannelSyncs", () => {
  it("dispatches 0 events when no channels are due", async () => {
    rpc.mockResolvedValueOnce({ data: [], error: null });
    const step = fakeStep();

    const result = await dispatchDueChannelSyncs(step);

    expect(step.sendEvent).not.toHaveBeenCalled();
    expect(result).toEqual({ dispatched: 0 });
  });

  it("dispatches one channel/sync.requested event per due channel, in a single batched call", async () => {
    rpc.mockResolvedValueOnce({
      data: [{ channel_id: "c1" }, { channel_id: "c2" }, { channel_id: "c3" }],
      error: null,
    });
    const step = fakeStep();

    const result = await dispatchDueChannelSyncs(step);

    expect(step.sendEvent).toHaveBeenCalledTimes(1);
    expect(step.sendEvent).toHaveBeenCalledWith("dispatch-sync-events", [
      { name: "channel/sync.requested", data: { channelId: "c1" } },
      { name: "channel/sync.requested", data: { channelId: "c2" } },
      { name: "channel/sync.requested", data: { channelId: "c3" } },
    ]);
    expect(result).toEqual({ dispatched: 3 });
  });

  it("throws when the due-channels query fails, without dispatching anything", async () => {
    rpc.mockResolvedValueOnce({ data: null, error: { message: "db down" } });
    const step = fakeStep();

    await expect(dispatchDueChannelSyncs(step)).rejects.toThrow("findDueChannelIds failed");
    expect(step.sendEvent).not.toHaveBeenCalled();
  });

  it("only includes channels the due-channels query actually returned", async () => {
    // The due-ness filter (not-yet-due channels excluded) lives in the SQL
    // function itself (find_due_channel_ids, mocked here via rpc) -- this
    // confirms the cron applies no additional filtering of its own on top.
    rpc.mockResolvedValueOnce({ data: [{ channel_id: "due-channel" }], error: null });
    const step = fakeStep();

    await dispatchDueChannelSyncs(step);

    expect(step.sendEvent).toHaveBeenCalledWith("dispatch-sync-events", [
      { name: "channel/sync.requested", data: { channelId: "due-channel" } },
    ]);
  });
});
