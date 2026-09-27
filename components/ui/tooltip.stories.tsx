import { Tag } from "@/components/ui/tag";
import { Tooltip } from "@/components/ui/tooltip";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof Tooltip> = {
  title: "ui/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

export const OnAChip: Story = {
  render: () => (
    <div className="p-16">
      <Tooltip content="An upload hit 3× the channel's usual views in the last 30 days.">
        <button type="button" className="rounded-sm">
          <Tag tone="info">Breakout</Tag>
        </button>
      </Tooltip>
    </div>
  ),
};
