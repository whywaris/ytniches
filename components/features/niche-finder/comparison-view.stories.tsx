import { ComparisonView } from "@/components/features/niche-finder/comparison-view";
import type { NicheChannelResult } from "@/components/features/niche-finder/types";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof ComparisonView> = {
  title: "features/niche-finder/ComparisonView",
  component: ComparisonView,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof ComparisonView>;

const CHANNELS: NicheChannelResult[] = [
  {
    id: "1",
    youtubeChannelId: "UC1",
    name: "Sleep Sounds Daily",
    avatarUrl: null,
    subscriberCount: 482_000,
    videoCount: 310,
    avgViewsLast30Days: 91_200,
    avgViewsLifetime: 64_500,
    uploadFrequencyPerWeek: 3,
    viewsStatus: "measured",
    isMonetized: true,
    language: "en",
    country: "US",
    youtubeCreatedAt: "2019-03-01T00:00:00Z",
    viewTrend: [],
  },
  {
    id: "2",
    youtubeChannelId: "UC2",
    name: "AI History Hub",
    avatarUrl: null,
    subscriberCount: 128_500,
    videoCount: 96,
    avgViewsLast30Days: 134_100,
    avgViewsLifetime: 28_900,
    uploadFrequencyPerWeek: 5,
    viewsStatus: "measured",
    isMonetized: true,
    language: "en",
    country: "CA",
    youtubeCreatedAt: "2021-07-01T00:00:00Z",
    viewTrend: [],
  },
  {
    id: "3",
    youtubeChannelId: "UC3",
    name: "Faceless Facts",
    avatarUrl: null,
    subscriberCount: 76_200,
    videoCount: 210,
    avgViewsLast30Days: 12_800,
    avgViewsLifetime: 9_400,
    uploadFrequencyPerWeek: 1,
    viewsStatus: "measured",
    isMonetized: null,
    language: "en",
    country: "GB",
    youtubeCreatedAt: "2020-01-01T00:00:00Z",
    viewTrend: [],
  },
];

export const TwoChannels: Story = {
  render: () => <ComparisonView channels={CHANNELS.slice(0, 2)} onRemove={() => {}} />,
};

export const ThreeChannels: Story = {
  render: () => <ComparisonView channels={CHANNELS} onRemove={() => {}} />,
};

export const WithoutRemove: Story = {
  render: () => <ComparisonView channels={CHANNELS.slice(0, 2)} />,
};

export const InvalidCountRendersNothing: Story = {
  name: "Invalid count (1 channel) renders nothing",
  render: () => <ComparisonView channels={CHANNELS.slice(0, 1)} />,
};
