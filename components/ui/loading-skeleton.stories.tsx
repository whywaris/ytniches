import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof LoadingSkeleton> = {
  title: "ui/LoadingSkeleton",
  component: LoadingSkeleton,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof LoadingSkeleton>;

export const TableRows: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-2">
      <LoadingSkeleton className="h-10 w-full" />
      <LoadingSkeleton className="h-10 w-full" />
      <LoadingSkeleton className="h-10 w-full" />
    </div>
  ),
};

export const Card: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-2">
      <LoadingSkeleton className="size-10 rounded-full" />
      <LoadingSkeleton className="h-4 w-3/4" />
      <LoadingSkeleton className="h-4 w-1/2" />
    </div>
  ),
};
