import { ErrorState } from "@/components/ui/error-state";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof ErrorState> = {
  title: "ui/ErrorState",
  component: ErrorState,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof ErrorState>;

export const Default: Story = {
  render: () => <ErrorState onRetry={() => {}} />,
};

export const CustomMessage: Story = {
  render: () => (
    <ErrorState message="Couldn't reach YouTube's API. Try again shortly." onRetry={() => {}} />
  ),
};
