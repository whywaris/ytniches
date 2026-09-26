import { FreshnessLine } from "@/components/features/niche-finder/freshness-line";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof FreshnessLine> = {
  title: "features/niche-finder/FreshnessLine",
  component: FreshnessLine,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof FreshnessLine>;

export const Updated: Story = {
  args: {
    updatedAt: new Date(Date.now() - 3 * 3_600_000).toISOString(),
    newChannelsThisWeek: 1284,
  },
};

export const BeforeFirstRun: Story = {
  args: { updatedAt: null, newChannelsThisWeek: 0 },
};
