import { ChannelCard } from "@/components/features/niche-finder/channel-card";
import type { NicheChannelResult } from "@/components/features/niche-finder/types";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof ChannelCard> = {
  title: "features/niche-finder/ChannelCard",
  component: ChannelCard,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof ChannelCard>;

const BASE_CHANNEL: NicheChannelResult = {
  id: "internal-1",
  youtubeChannelId: "UC-sleep-sounds",
  name: "Sleep Sounds Daily",
  avatarUrl: null,
  subscriberCount: 482_000,
  videoCount: 310,
  avgViewsLast30Days: 91_200,
  avgViewsLifetime: 64_500,
  uploadFrequencyPerWeek: 3,
  isMonetized: true,
  language: "en",
  country: "US",
  youtubeCreatedAt: "2019-03-01T00:00:00Z",
  viewTrend: [42_000, 58_000, 51_000, 73_000, 68_000, 91_200],
};

export const Default: Story = {
  render: () => <ChannelCard channel={BASE_CHANNEL} className="max-w-sm" />,
};

export const Saved: Story = {
  render: () => <ChannelCard channel={BASE_CHANNEL} saved className="max-w-sm" />,
};

export const ColdCacheNoSparkline: Story = {
  name: "Cold cache (no sparkline)",
  render: () => (
    <ChannelCard
      channel={{ ...BASE_CHANNEL, avgViewsLast30Days: 0, uploadFrequencyPerWeek: 0, viewTrend: [] }}
      className="max-w-sm"
    />
  ),
};

export const UnmonetizedNoAvatar: Story = {
  render: () => (
    <ChannelCard
      channel={{
        ...BASE_CHANNEL,
        name: "Tiny Tech Reviews",
        subscriberCount: 44_900,
        isMonetized: false,
        country: "AU",
        viewTrend: [3_000, 5_500, 4_200, 8_300],
      }}
      className="max-w-sm"
    />
  ),
};
