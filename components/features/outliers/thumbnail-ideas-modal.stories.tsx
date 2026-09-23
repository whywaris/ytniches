import * as React from "react";

import { ThumbnailIdeasModal } from "@/components/features/outliers/thumbnail-ideas-modal";
import { Button } from "@/components/ui/button";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof ThumbnailIdeasModal> = {
  title: "features/outliers/ThumbnailIdeasModal",
  component: ThumbnailIdeasModal,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof ThumbnailIdeasModal>;

const VIDEO = {
  id: "vid-1",
  title: "8 Hours of Deep Sleep Music — Fall Asleep Fast",
  thumbnailUrl: "https://placehold.co/320x180",
};

function Demo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Get thumbnail ideas</Button>
      <ThumbnailIdeasModal open={open} onOpenChange={setOpen} video={VIDEO} />
    </>
  );
}

export const Default: Story = {
  render: () => <Demo />,
};

export const OpenByDefault: Story = {
  render: () => <ThumbnailIdeasModal open onOpenChange={() => {}} video={VIDEO} />,
};
