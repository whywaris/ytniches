import { DiscoveryChannelCard } from "@/components/features/niche-finder/discovery-channel-card";
import type { FeedChannel } from "@/lib/services/niche-feed";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof DiscoveryChannelCard> = {
  title: "features/niche-finder/DiscoveryChannelCard",
  component: DiscoveryChannelCard,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof DiscoveryChannelCard>;

const CHANNEL: FeedChannel = {
  id: "c1",
  youtubeChannelId: "UC1",
  name: "Mafia Tales",
  avatarUrl: null,
  subscriberCount: 8_200,
  videoCount: 41,
  avgViewsRecent: 38_500,
  outlierScore: 4.7,
  youtubeCreatedAt: "2026-03-01T00:00:00Z",
  daysSinceStart: 209,
  isFaceless: true,
  likelyMonetized: true,
  hasShorts: false,
  language: "en",
  niche: { slug: "mafia-history", name: "Mafia History" },
  popularVideos: [1, 2, 3, 4].map((i) => ({
    youtubeVideoId: `pv${i}`,
    title: `The Gambino story, part ${i}`,
    thumbnailUrl: "https://placehold.co/320x180/png",
    viewCount: 400_000 / i,
    publishedAt: "2026-09-01T00:00:00Z",
  })),
};

export const Default: Story = {
  render: () => <DiscoveryChannelCard channel={CHANNEL} onTrack={() => {}} className="max-w-md" />,
};

export const Tracked: Story = {
  render: () => (
    <DiscoveryChannelCard channel={CHANNEL} onTrack={() => {}} tracked className="max-w-md" />
  ),
};

export const Unclassified: Story = {
  name: "Unclassified, no estimates yet",
  render: () => (
    <DiscoveryChannelCard
      channel={{
        ...CHANNEL,
        niche: null,
        isFaceless: null,
        likelyMonetized: null,
        outlierScore: null,
        popularVideos: [],
      }}
      className="max-w-md"
    />
  ),
};
