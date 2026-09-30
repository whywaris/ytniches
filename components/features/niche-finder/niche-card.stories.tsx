import { NicheCard } from "@/components/features/niche-finder/niche-card";
import type { NicheFeedItem } from "@/lib/services/niche-feed";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof NicheCard> = {
  title: "features/niche-finder/NicheCard",
  component: NicheCard,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof NicheCard>;

const NICHE: NicheFeedItem = {
  id: "n1",
  slug: "mafia-history",
  name: "Mafia History",
  description: null,
  status: "rising",
  score: 84,
  label: "low",
  trend: 12,
  whyChips: ["62% small channels ranking", "4 new channels breaking out"],
  channelCount: 38,
  newChannels30d: 4,
  medianViews: 18_400,
  thumbnails: [1, 2, 3].map((i) => ({
    videoId: `vid-${i}`,
    channelId: "c1",
    youtubeVideoId: `yt${i}`,
    title: `Breakout video ${i}`,
    thumbnailUrl: "https://placehold.co/320x180/png",
  })),
};

export const LowCompetition: Story = {
  render: () => <NicheCard niche={NICHE} onTrack={() => {}} className="max-w-sm" />,
};

export const Declining: Story = {
  render: () => (
    <NicheCard
      niche={{ ...NICHE, status: "declining", score: 41, label: "high", trend: -14 }}
      onTrack={() => {}}
      className="max-w-sm"
    />
  ),
};

export const NewNoThumbnails: Story = {
  name: "New niche (no history, no outliers yet)",
  render: () => (
    <NicheCard niche={{ ...NICHE, trend: null, thumbnails: [] }} className="max-w-sm" />
  ),
};

export const Tracking: Story = {
  render: () => <NicheCard niche={NICHE} onTrack={() => {}} tracking className="max-w-sm" />,
};
