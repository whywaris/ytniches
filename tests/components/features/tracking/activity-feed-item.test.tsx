import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { ActivityFeedItem } from "@/components/features/tracking/activity-feed-item";
import type { ActivityFeedNotification } from "@/components/features/tracking/types";

function makeNotification(
  overrides: Partial<ActivityFeedNotification> = {},
): ActivityFeedNotification {
  return {
    id: "notif-1",
    notificationType: "new_video",
    title: "New video from Sleep Sounds Daily",
    body: "8 Hours of Deep Sleep Music",
    createdAt: "2026-01-01T10:00:00Z",
    readAt: null,
    dismissedAt: null,
    channel: { id: "chan-1", name: "Sleep Sounds Daily", avatarUrl: null },
    ...overrides,
  };
}

describe("ActivityFeedItem", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<ActivityFeedItem notification={makeNotification()} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows the event label matching the notification type", () => {
    render(
      <ActivityFeedItem notification={makeNotification({ notificationType: "view_spike" })} />,
    );
    expect(screen.getByText("View spike")).toBeInTheDocument();
  });

  it("falls back to a generic label for an unrecognized notification type", () => {
    render(
      <ActivityFeedItem notification={makeNotification({ notificationType: "something_new" })} />,
    );
    expect(screen.getByText("Activity")).toBeInTheDocument();
  });

  it("calls onGoToChannel with the channel id", async () => {
    const user = userEvent.setup();
    const onGoToChannel = vi.fn();
    render(<ActivityFeedItem notification={makeNotification()} onGoToChannel={onGoToChannel} />);

    await user.click(screen.getByRole("button", { name: "Go to channel" }));

    expect(onGoToChannel).toHaveBeenCalledWith("chan-1");
  });

  it("calls onDismiss with the notification id", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<ActivityFeedItem notification={makeNotification()} onDismiss={onDismiss} />);

    await user.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(onDismiss).toHaveBeenCalledWith("notif-1");
  });

  it("hides the action row for a dismissed notification", () => {
    render(
      <ActivityFeedItem notification={makeNotification({ dismissedAt: "2026-01-01T12:00:00Z" })} />,
    );
    expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Go to channel" })).not.toBeInTheDocument();
  });

  it("shows actions for a read (but not dismissed) notification", () => {
    render(
      <ActivityFeedItem notification={makeNotification({ readAt: "2026-01-01T11:00:00Z" })} />,
    );
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
  });
});
