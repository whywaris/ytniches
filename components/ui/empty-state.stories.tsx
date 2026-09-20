import { Compass } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof EmptyState> = {
  title: "ui/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof EmptyState>;

export const WithAction: Story = {
  render: () => (
    <EmptyState
      icon={<Compass />}
      message="You haven't saved any channels yet. Try Niche Finder to discover some."
      actionLabel="Open Niche Finder"
      onAction={() => {}}
    />
  ),
};

export const MessageOnly: Story = {
  render: () => <EmptyState message="No results match your filters." />,
};
