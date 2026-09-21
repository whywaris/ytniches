import { beforeEach, describe, expect, it, vi } from "vitest";

const sessionFrom = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ from: sessionFrom }),
}));

const { joinNotificationChannels } = await import("@/app/(app)/tracking/notification-refs");

function fromTable(result: { data: unknown[] | null; error: unknown }) {
  return {
    select: vi.fn(() => ({
      in: vi.fn(() => Promise.resolve(result)),
    })),
  };
}

function notification(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "notif-1",
    notificationType: "new_video",
    title: "New video from Sleep Sounds Daily",
    body: "Ep 1",
    relatedResource: "video:vid-1",
    createdAt: "2026-01-01T00:00:00Z",
    readAt: null,
    dismissedAt: null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("joinNotificationChannels", () => {
  it("returns [] without querying for an empty input", async () => {
    const result = await joinNotificationChannels([]);

    expect(result).toEqual([]);
    expect(sessionFrom).not.toHaveBeenCalled();
  });

  it("resolves a video-linked notification's channel via the videos table", async () => {
    sessionFrom.mockReturnValueOnce(
      fromTable({ data: [{ id: "vid-1", channel_id: "chan-1" }], error: null }),
    );
    sessionFrom.mockReturnValueOnce(
      fromTable({
        data: [{ id: "chan-1", name: "Sleep Sounds Daily", avatar_url: null }],
        error: null,
      }),
    );

    const result = await joinNotificationChannels([notification()]);

    expect(result).toEqual([
      {
        id: "notif-1",
        notificationType: "new_video",
        title: "New video from Sleep Sounds Daily",
        body: "Ep 1",
        createdAt: "2026-01-01T00:00:00Z",
        readAt: null,
        dismissedAt: null,
        channel: { id: "chan-1", name: "Sleep Sounds Daily", avatarUrl: null },
      },
    ]);
  });

  it("resolves a channel-linked notification directly, without a videos query", async () => {
    sessionFrom.mockReturnValueOnce(
      fromTable({
        data: [{ id: "chan-1", name: "Sleep Sounds Daily", avatar_url: null }],
        error: null,
      }),
    );

    const result = await joinNotificationChannels([
      notification({
        id: "notif-2",
        notificationType: "cadence_change",
        relatedResource: "channel:chan-1",
      }),
    ]);

    expect(sessionFrom).toHaveBeenCalledTimes(1);
    expect(result[0].channel).toEqual({
      id: "chan-1",
      name: "Sleep Sounds Daily",
      avatarUrl: null,
    });
  });

  it("falls back to an unknown-channel placeholder when the resource can't be resolved", async () => {
    sessionFrom.mockReturnValueOnce(fromTable({ data: [], error: null }));

    const result = await joinNotificationChannels([
      notification({ relatedResource: "video:deleted-video" }),
    ]);

    expect(result[0].channel).toEqual({ id: "", name: "Unknown channel", avatarUrl: null });
  });

  it("batches multiple notifications referencing the same channel into one channels query", async () => {
    sessionFrom.mockReturnValueOnce(
      fromTable({
        data: [
          { id: "vid-1", channel_id: "chan-1" },
          { id: "vid-2", channel_id: "chan-1" },
        ],
        error: null,
      }),
    );
    sessionFrom.mockReturnValueOnce(
      fromTable({
        data: [{ id: "chan-1", name: "Sleep Sounds Daily", avatar_url: null }],
        error: null,
      }),
    );

    const result = await joinNotificationChannels([
      notification({ id: "n1", relatedResource: "video:vid-1" }),
      notification({ id: "n2", relatedResource: "video:vid-2" }),
    ]);

    // 1 videos query + 1 channels query total, not one channels query per
    // notification even though both reference the same channel.
    expect(sessionFrom).toHaveBeenCalledTimes(2);
    expect(result.every((n) => n.channel.id === "chan-1")).toBe(true);
  });
});
