import { ToastProvider } from "@/components/ui/toast-provider";
import { FilterBar } from "@/components/features/niche-finder/filter-bar/filter-bar";
import {
  CHANNEL_FILTERS,
  CHANNEL_PRESETS,
  SORT_OPTIONS,
  withNicheOptions,
} from "@/lib/discovery/feed-filters";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof FilterBar> = {
  title: "features/niche-finder/FilterBar",
  component: FilterBar,
  tags: ["autodocs"],
  parameters: { layout: "padded", nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof FilterBar>;

const defs = withNicheOptions(CHANNEL_FILTERS, [
  { value: "mafia-history", label: "Mafia History" },
  { value: "true-crime", label: "True Crime" },
  { value: "rain-sleep-sounds", label: "Rain Sleep Sounds" },
]);

const unlock = async () => ({ ok: true as const, value: { charged: true } });

const base = {
  tab: "channels" as const,
  defs,
  unlock,
  unlocked: true,
  presets: CHANNEL_PRESETS,
  sortOptions: SORT_OPTIONS.channels,
  defaultSort: "outlier_score",
  searchKey: "q",
};

export const Default: Story = {
  name: "Channels, no filters (free)",
  render: () => <FilterBar {...base} values={{}} isPro />,
};

export const WithFilters: Story = {
  name: "Active filters (Starter: Pro filters locked)",
  render: () => (
    <FilterBar
      {...base}
      values={{ minSubs: "1000", maxSubs: "10000", lang: "en", content: "long" }}
      isPro={false}
    />
  ),
};

export const Preset: Story = {
  name: "Preset applied (free)",
  render: () => <FilterBar {...base} values={{ preset: "small-breakout" }} isPro />,
};

export const Mobile: Story = {
  name: "Mobile (Filters button opens the sheet)",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  globals: { viewport: { value: "mobile1" } },
  render: () => <FilterBar {...base} values={{ minSubs: "1000", lang: "en" }} isPro={false} />,
};
