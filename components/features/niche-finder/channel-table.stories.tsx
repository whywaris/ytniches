import * as React from "react";

import { Button } from "@/components/ui/button";
import { ChannelTable } from "@/components/features/niche-finder/channel-table";
import type { NicheChannelResult } from "@/components/features/niche-finder/types";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof ChannelTable> = {
  title: "features/niche-finder/ChannelTable",
  component: ChannelTable,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof ChannelTable>;

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
    avgViewsLast30Days: 34_100,
    avgViewsLifetime: 28_900,
    uploadFrequencyPerWeek: 5,
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
    isMonetized: null,
    language: "en",
    country: "GB",
    youtubeCreatedAt: "2020-01-01T00:00:00Z",
    viewTrend: [],
  },
];

export const Default: Story = {
  render: () => (
    <ChannelTable
      channels={CHANNELS}
      savedChannelIds={new Set(["2"])}
      onSave={() => {}}
      onOpen={() => {}}
    />
  ),
};

export const WithBulkActions: Story = {
  render: function Render() {
    return (
      <ChannelTable
        channels={CHANNELS}
        savedChannelIds={new Set()}
        onSave={() => {}}
        onOpen={() => {}}
        onSelectionChange={() => {}}
        renderBulkActions={(rows, clear) => (
          <>
            <Button size="sm" variant="secondary" onClick={clear}>
              Save {rows.length} to tracking
            </Button>
            <Button size="sm" variant="ghost" onClick={clear}>
              Export
            </Button>
          </>
        )}
      />
    );
  },
};

export const Loading: Story = {
  render: () => (
    <ChannelTable
      channels={[]}
      savedChannelIds={new Set()}
      onSave={() => {}}
      onOpen={() => {}}
      loading
    />
  ),
};

export const Empty: Story = {
  render: () => (
    <ChannelTable channels={[]} savedChannelIds={new Set()} onSave={() => {}} onOpen={() => {}} />
  ),
};

export const ErrorState: Story = {
  name: "Error state",
  render: () => (
    <ChannelTable
      channels={[]}
      savedChannelIds={new Set()}
      onSave={() => {}}
      onOpen={() => {}}
      error
      onRetry={() => {}}
    />
  ),
};
