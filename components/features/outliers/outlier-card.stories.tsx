import { OutlierCard } from "@/components/features/outliers/outlier-card";
import type { OutlierItem } from "@/lib/services/outliers";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof OutlierCard> = {
  title: "features/outliers/OutlierCard",
  component: OutlierCard,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof OutlierCard>;

function outlier(overrides: Partial<OutlierItem> = {}): OutlierItem {
  return {
    id: "e1",
    channelId: "chan-1",
    channelName: "Sleep Sounds Daily",
    channelAvatarUrl: null,
    videoId: "vid-1",
    videoTitle: "8 Hours of Deep Sleep Music — Fall Asleep Fast",
    videoThumbnailUrl: "https://placehold.co/320x180",
    viewCount: 500_000,
    baseline: 100_000,
    outlierScore: 5,
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

// PRD.md §7.1's card + Phase 2 Task 3's second entry point ("Get thumbnail
// ideas" -> ThumbnailIdeasModal). Storybook can't drive ThumbnailIdeasModal
// past its idle state here -- it directly calls a "use server" action
// (same pattern as UpgradeModal), and Storybook's Vite build can't bundle
// that action's transitive server-only dependencies (confirmed: this is a
// Storybook-only limitation, not a real app bug, same as
// upgrade-modal.stories.tsx). This story still verifies the card itself,
// the modal opening, and the idle state's a11y tree.
export const Default: Story = {
  args: { outlier: outlier() },
};

export const WithoutChannel: Story = {
  args: { outlier: outlier(), showChannel: false },
};

export const HighScore: Story = {
  args: { outlier: outlier({ outlierScore: 9.2, viewCount: 2_100_000, baseline: 220_000 }) },
};
