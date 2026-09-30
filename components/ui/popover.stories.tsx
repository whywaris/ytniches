import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof Popover> = {
  title: "ui/Popover",
  component: Popover,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover defaultOpen>
      <PopoverTrigger asChild>
        <Button variant="secondary">Subscribers</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="font-medium">Subscribers</p>
        <p className="mt-1 text-text-secondary">
          Any control can live here: presets, a range, a list.
        </p>
      </PopoverContent>
    </Popover>
  ),
};
