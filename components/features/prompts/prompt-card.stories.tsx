import { PromptCard } from "@/components/features/prompts/prompt-card";
import type { PromptSummary } from "@/components/features/prompts/types";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof PromptCard> = {
  title: "features/prompts/PromptCard",
  component: PromptCard,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof PromptCard>;

const PROMPT: PromptSummary = {
  id: "prompt-1",
  sourceVideo: {
    id: "vid-1",
    title: "How I Grew to 1M Subscribers in a Year",
    thumbnailUrl: "",
  },
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
};

export const Default: Story = {
  render: () => <PromptCard prompt={PROMPT} className="max-w-sm" />,
};

export const WithThumbnail: Story = {
  render: () => (
    <PromptCard
      prompt={{
        ...PROMPT,
        sourceVideo: { ...PROMPT.sourceVideo, thumbnailUrl: "https://picsum.photos/id/237/160/90" },
      }}
      className="max-w-sm"
    />
  ),
};
