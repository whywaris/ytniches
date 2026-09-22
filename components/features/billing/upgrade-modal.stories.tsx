import * as React from "react";

import { UpgradeModal } from "@/components/features/billing/upgrade-modal";
import { Button } from "@/components/ui/button";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof UpgradeModal> = {
  title: "features/billing/UpgradeModal",
  component: UpgradeModal,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof UpgradeModal>;

function Demo({ reason }: { reason?: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Upgrade</Button>
      <UpgradeModal open={open} onOpenChange={setOpen} reason={reason} />
    </>
  );
}

export const Default: Story = {
  render: () => <Demo />,
};

export const CreditsExhausted: Story = {
  render: () => <Demo reason="Only 4 credits left. Buy more or upgrade." />,
};

export const OpenByDefault: Story = {
  render: () => <UpgradeModal open onOpenChange={() => {}} />,
};
