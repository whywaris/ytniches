import { PromptResults } from "@/components/features/prompts/prompt-results";
import type { PromptOutput } from "@/components/features/prompts/types";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof PromptResults> = {
  title: "features/prompts/PromptResults",
  component: PromptResults,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof PromptResults>;

const OUTPUT: PromptOutput = {
  title_variants: [
    "How I Grew to 1M Subscribers in a Year",
    "The Exact Strategy That Got Me 1M Subs",
    "1M Subscribers: What Actually Worked",
    "I Grew 1M Subs — Here's My Playbook",
    "From 0 to 1M: My Full Growth Breakdown",
  ],
  thumbnail_concepts: [
    "Big bold '1,000,000' number with a shocked face",
    "Before/after subscriber count split screen",
    "Creator pointing at a growth chart",
  ],
  hook_variants: [
    "Two years ago I had 200 subscribers. Today I have a million.",
    "Everyone told me this niche was too small. They were wrong.",
    "I almost quit three times before this happened.",
  ],
  script_outline: {
    intro: "Hook + quick preview of the growth timeline.",
    body_sections: [
      "The first mistake that cost me a year",
      "The pivot that changed everything",
      "The 3 systems that scaled the channel",
    ],
    outro: "Recap + call to action to subscribe.",
  },
  description_template:
    "In this video, I break down exactly how I grew from 0 to 1M subscribers...\n\nTimestamps:\n0:00 Intro\n...",
};

export const ReadOnly: Story = {
  render: () => <PromptResults output={OUTPUT} className="max-w-2xl" />,
};

export const Editable: Story = {
  render: () => <PromptResults output={OUTPUT} editable className="max-w-2xl" />,
};

export const EditableSaving: Story = {
  render: () => <PromptResults output={OUTPUT} editable saving className="max-w-2xl" />,
};
