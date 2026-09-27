import * as React from "react";

import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof Sheet> = {
  title: "ui/Sheet",
  component: Sheet,
  tags: ["autodocs"],
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
export default meta;

type Story = StoryObj<typeof Sheet>;

function SheetDemo() {
  const [open, setOpen] = React.useState(true);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open sheet</Button>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        title="Filters"
        footer={<Button fullWidth>Show results</Button>}
      >
        <p>Sheet body scrolls; the footer stays pinned.</p>
      </Sheet>
    </>
  );
}

export const Default: Story = { render: () => <SheetDemo /> };
