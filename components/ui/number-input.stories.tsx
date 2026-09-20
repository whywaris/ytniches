import { NumberInput } from "@/components/ui/number-input";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof NumberInput> = {
  title: "ui/NumberInput",
  component: NumberInput,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof NumberInput>;

export const Default: Story = {
  render: () => (
    <div className="w-56">
      <NumberInput label="Credits per cycle" min={0} max={1000} defaultValue={100} />
    </div>
  ),
};
