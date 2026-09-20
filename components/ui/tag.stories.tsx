import { Tag } from "@/components/ui/tag";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof Tag> = {
  title: "ui/Tag",
  component: Tag,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Tag>;

export const Semantic: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Tag tone="neutral">Draft</Tag>
      <Tag tone="success">Active</Tag>
      <Tag tone="warning">Pending</Tag>
      <Tag tone="error">Failed</Tag>
      <Tag tone="info">New</Tag>
    </div>
  ),
};

export const ObjectTypes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Tag tone="niches">Niche</Tag>
      <Tag tone="channels">Channel</Tag>
      <Tag tone="videos">Video</Tag>
      <Tag tone="prompts">Prompt</Tag>
      <Tag tone="calendar">Calendar</Tag>
      <Tag tone="tasks">Task</Tag>
      <Tag tone="outliers">Outlier</Tag>
    </div>
  ),
};
