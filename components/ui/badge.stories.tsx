import { Badge } from "@/components/ui/badge";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof Badge> = {
  title: "ui/Badge",
  component: Badge,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Tones: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge tone="neutral">3</Badge>
      <Badge tone="accent">9</Badge>
      <Badge tone="success">1</Badge>
      <Badge tone="warning">2</Badge>
      <Badge tone="error">4</Badge>
      <Badge tone="info">5</Badge>
    </div>
  ),
};

export const Shapes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge shape="circle">3</Badge>
      <Badge shape="rounded">99+</Badge>
    </div>
  ),
};
