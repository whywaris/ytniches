import { Button } from "@/components/ui/button";
import { ToastProvider, useToast } from "@/components/ui/toast-provider";
import type { ToastVariant } from "@/components/ui/toast";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta = {
  title: "ui/Toast",
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj;

const VARIANTS: { variant: ToastVariant; title: string; description: string }[] = [
  { variant: "info", title: "Sync scheduled", description: "Next refresh in 6 hours." },
  { variant: "success", title: "Channel saved", description: "Added to your tracking list." },
  {
    variant: "warning",
    title: "Approaching quota",
    description: "70% of daily YouTube API budget used.",
  },
  { variant: "error", title: "Generation failed", description: "Credit refunded automatically." },
];

function ToastDemo() {
  const { showToast } = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      {VARIANTS.map((item) => (
        <Button key={item.variant} variant="secondary" size="sm" onClick={() => showToast(item)}>
          Trigger {item.variant}
        </Button>
      ))}
    </div>
  );
}

export const Variants: Story = {
  render: () => <ToastDemo />,
};
