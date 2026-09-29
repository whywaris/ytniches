import { BetaPricing } from "@/components/features/billing/beta-pricing";
import { Button } from "@/components/ui/button";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof BetaPricing> = {
  title: "features/billing/BetaPricing",
  component: BetaPricing,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof BetaPricing>;

// D-081: /pricing during the beta.
export const Pricing: Story = {
  args: { betaAction: <Button fullWidth>Start free</Button> },
};
