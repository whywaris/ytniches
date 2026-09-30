import { SignalBars } from "@/components/features/niche-finder/signal-bars";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof SignalBars> = {
  title: "features/niche-finder/SignalBars",
  component: SignalBars,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof SignalBars>;

export const Default: Story = {
  render: () => (
    <div className="max-w-sm">
      <SignalBars
        signals={{
          accessibility: 0.9,
          demand: 0.7,
          momentum: 0.8,
          outlierDensity: 0.55,
          supply: 0.4,
        }}
      />
    </div>
  ),
};
