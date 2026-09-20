import * as React from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof Modal> = {
  title: "ui/Modal",
  component: Modal,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Modal>;

function ModalDemo({ size }: { size: NonNullable<React.ComponentProps<typeof Modal>["size"]> }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open {size} modal</Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Track this channel"
        description="We'll check for new uploads based on your plan's refresh cadence."
        size={size}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Track channel</Button>
          </>
        }
      >
        <p>Modal body content goes here — forms, lists, or any composed UI.</p>
      </Modal>
    </>
  );
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <ModalDemo size="sm" />
      <ModalDemo size="md" />
      <ModalDemo size="lg" />
      <ModalDemo size="xl" />
      <ModalDemo size="full" />
    </div>
  ),
};
