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
  medianViewsRecent: 164_000,
  outlierScore: 4.7,
  youtubeCreatedAt: "2026-03-01T00:00:00Z",
  activeSince: "2026-03-04T00:00:00Z",
  daysSinceStart: 209,
  discoveredAt: "2026-09-20T00:00:00Z",
  isFaceless: true,
  likelyMonetized: true,
  contentType: "long",
  language: "en",
  country: "US",
  views30d: { kind: "uploads", value: 912_000 },
  niches: [
    { slug: "mafia-history", name: "Mafia History", isPrimary: true },
    { slug: "true-crime", name: "True Crime", isPrimary: false },
    { slug: "war-history", name: "War History", isPrimary: false },
  ],
  topVideos: [1, 2, 3].map((i) => ({
    videoId: `vid-${i}`,
    youtubeVideoId: `pv${i}`,
    title: `The Gambino story, part ${i}`,
    thumbnailUrl: "https://placehold.co/320x180/png",
    viewCount: 400_000 / i,
    publishedAt: "2026-09-01T00:00:00Z",
    isOutlier: i === 1,
    outlierMultiple: i === 1 ? 6.2 : 1.4,
  })),
  insights: [
    {
      id: "breakout",
      label: "Breakout",
      hint: "An upload reached 3× the channel's usual views in the last 30 days.",
    },
    { id: "new", label: "New channel", hint: "First upload within the last 12 months." },
    {
      id: "consistent",
      label: "Consistent uploads",
      hint: "At least one upload in each of the last 4 weeks.",
    },
    {
      id: "engaged",
      label: "Engaged audience",
      hint: "On recent uploads, likes plus comments are typically at least 4% of views.",
    },
    {
      id: "faceless",
      label: "Faceless (est.)",
      hint: "Our AI's estimate from titles and descriptions that the creator doesn't appear on camera.",
    },
  ],
  viewsToSubs: 20,
};

export const Default: Story = {
  render: () => <DiscoveryChannelCard channel={CHANNEL} onTrack={() => {}} />,
};

export const TrueThirtyDayViews: Story = {
  name: "True 30-day views (after 30 days of readings)",
  render: () => (
    <DiscoveryChannelCard
      channel={{ ...CHANNEL, views30d: { kind: "true", value: 486_000 } }}
      onTrack={() => {}}
    />
  ),
};

export const Tracked: Story = {
  render: () => <DiscoveryChannelCard channel={CHANNEL} onTrack={() => {}} tracked />,
};

export const Unclassified: Story = {
  name: "Unclassified, not enriched yet",
  render: () => (
    <DiscoveryChannelCard
      channel={{
        ...CHANNEL,
        niches: [],
        insights: [],
        topVideos: [],
        medianViewsRecent: null,
        contentType: null,
        viewsToSubs: null,
        views30d: { kind: "uploads", value: null },
      }}
    />
  ),
};
