import { ActivityFeedItem } from "@/components/features/tracking/activity-feed-item";
import type { ActivityFeedNotification } from "@/components/features/tracking/types";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof ActivityFeedItem> = {
  title: "features/tracking/ActivityFeedItem",
  component: ActivityFeedItem,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof ActivityFeedItem>;

const CHANNEL = { id: "chan-1", name: "Sleep Sounds Daily", avatarUrl: null };

function notification(overrides: Partial<ActivityFeedNotification> = {}): ActivityFeedNotification {
  return {
    id: "notif-1",
    notificationType: "new_video",
    title: "New video from Sleep Sounds Daily",
    body: "8 Hours of Deep Sleep Music",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    readAt: null,
    dismissedAt: null,
    channel: CHANNEL,
    ...overrides,
  };
}

export const Unread: Story = {
  render: () => <ActivityFeedItem notification={notification()} className="max-w-md" />,
};

export const Read: Story = {
  render: () => (
    <ActivityFeedItem
      notification={notification({ readAt: new Date().toISOString() })}
      className="max-w-md"
    />
  ),
};

export const Dismissed: Story = {
  render: () => (
    <ActivityFeedItem
      notification={notification({
        readAt: new Date().toISOString(),
        dismissedAt: new Date().toISOString(),
      })}
      className="max-w-md"
    />
  ),
};

export const ViewSpike: Story = {
  render: () => (
    <ActivityFeedItem
      notification={notification({
        id: "notif-2",
        notificationType: "view_spike",
        title: "Sleep Sounds Daily crossed 100.0K views",
        body: "8 Hours of Deep Sleep Music",
      })}
      className="max-w-md"
    />
  ),
};

export const CadenceChange: Story = {
  render: () => (
    <ActivityFeedItem
      notification={notification({
        id: "notif-3",
        notificationType: "cadence_change",
        title: "Sleep Sounds Daily changed upload cadence",
        body: "Was 1.0/week, now 3.0/week",
      })}
      className="max-w-md"
    />
  ),
};
