import * as React from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof ConfirmDialog> = {
  title: "ui/ConfirmDialog",
  component: ConfirmDialog,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof ConfirmDialog>;

export const Destructive: Story = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Delete account
        </Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title="Delete account"
          description="This cannot be undone. All your data will be permanently removed after 30 days."
          confirmLabel="Delete account"
          destructive
          onConfirm={() => setOpen(false)}
        />
      </>
    );
  },
};

export const Standard: Story = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Publish</Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title="Publish now?"
          description="This will make the calendar entry visible to your team."
          confirmLabel="Publish"
          onConfirm={() => setOpen(false)}
        />
      </>
    );
  },
};
