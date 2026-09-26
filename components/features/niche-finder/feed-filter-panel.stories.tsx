import { FeedFilterPanel } from "@/components/features/niche-finder/feed-filter-panel";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof FeedFilterPanel> = {
  title: "features/niche-finder/FeedFilterPanel",
  component: FeedFilterPanel,
  tags: ["autodocs"],
  parameters: { layout: "padded", nextjs: { appDirectory: true } },
};
export default meta;

type Story = StoryObj<typeof FeedFilterPanel>;

export const ChannelsTab: Story = {
  render: () => (
    <FeedFilterPanel
      tab="channels"
      values={{ faceless: "1", minSubs: "1000" }}
      fields={[
        {
          kind: "select",
          key: "niche",
          label: "Niche",
          options: [{ value: "mafia-history", label: "Mafia History" }],
        },
        { kind: "date", key: "after", label: "Started after" },
        { kind: "number", key: "minSubs", label: "Min subscribers" },
        { kind: "toggle", key: "faceless", label: "Faceless only" },
        { kind: "toggle", key: "monetized", label: "Likely monetized (est.)" },
        {
          kind: "select",
          key: "sort",
          label: "Sort by",
          defaultValue: "outlier_score",
          options: [
            { value: "outlier_score", label: "Outlier score" },
            { value: "avg_views", label: "Avg views" },
          ],
        },
      ]}
    />
  ),
};
