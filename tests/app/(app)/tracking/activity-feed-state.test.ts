import { describe, expect, it } from "vitest";

import { toActivityFeedState } from "@/app/(app)/tracking/activity-feed-state";
import type { ActivityFeedNotification } from "@/components/features/tracking/types";

function makeNotification(id: string): ActivityFeedNotification {
  return {
    id,
    notificationType: "new_video",
    title: `Notification ${id}`,
    body: null,
    createdAt: "2026-01-01T00:00:00Z",
    readAt: null,
    dismissedAt: null,
    channel: { id: "chan-1", name: "Sleep Sounds Daily", avatarUrl: null },
  };
}

describe("toActivityFeedState", () => {
  it("maps a non-empty result to populated", () => {
    const notifications = [makeNotification("1"), makeNotification("2")];
    expect(
      toActivityFeedState({ ok: true, value: { notifications, nextCursor: "cursor-1" } }),
    ).toEqual({
      status: "populated",
      notifications,
      nextCursor: "cursor-1",
    });
  });

  it("maps an empty result to empty", () => {
    expect(
      toActivityFeedState({ ok: true, value: { notifications: [], nextCursor: null } }),
    ).toEqual({
      status: "empty",
    });
  });

  it("maps any service error to a generic error state", () => {
    expect(toActivityFeedState({ ok: false, error: { type: "invalid_cursor" } })).toEqual({
      status: "error",
      message: "Something went wrong loading your activity feed.",
    });
  });
});
