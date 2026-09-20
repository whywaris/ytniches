import { Textarea } from "@/components/ui/textarea";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof Textarea> = {
  title: "ui/Textarea",
  component: Textarea,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Textarea>;

export const States: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-4">
      <Textarea label="Notes" placeholder="Add a note about this channel" />
      <Textarea label="Description" helperText="Markdown supported" />
      <Textarea label="Feedback" errorMessage="Required" />
      <Textarea label="Disabled" disabled defaultValue="Locked" />
    </div>
  ),
};
