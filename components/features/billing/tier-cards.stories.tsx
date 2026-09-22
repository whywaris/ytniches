import * as React from "react";

import type { BillingFrequency } from "@/lib/billing";
import { TierCards } from "@/components/features/billing/tier-cards";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof TierCards> = {
  title: "features/billing/TierCards",
  component: TierCards,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof TierCards>;

function Demo() {
  const [billingFrequency, setBillingFrequency] = React.useState<BillingFrequency>("monthly");
  return (
    <TierCards
      billingFrequency={billingFrequency}
      onBillingFrequencyChange={setBillingFrequency}
      ctaLabel="Continue"
      onSelectTier={() => {}}
    />
  );
}

export const Default: Story = {
  render: () => <Demo />,
};
