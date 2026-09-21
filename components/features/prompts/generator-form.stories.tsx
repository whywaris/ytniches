import {
  GeneratorForm,
  type GenerateErrorReason,
  type GeneratedPrompt,
  type VideoPickerVideo,
} from "@/components/features/prompts/generator-form";
import type { PromptOutput } from "@/components/features/prompts/types";
import { err, ok, type Result } from "@/lib/result";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof GeneratorForm> = {
  title: "features/prompts/GeneratorForm",
  component: GeneratorForm,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof GeneratorForm>;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const OUTPUT: PromptOutput = {
  title_variants: ["A", "B", "C", "D", "E"],
  thumbnail_concepts: ["X", "Y", "Z"],
  hook_variants: ["H1", "H2", "H3"],
  script_outline: { intro: "Intro", body_sections: ["Body 1", "Body 2"], outro: "Outro" },
  description_template: "Description template text.",
};

const CHANNELS = [
  { id: "chan-1", name: "Sleep Sounds Daily" },
  { id: "chan-2", name: "Tiny Tech Reviews" },
];

async function mockListTopVideos(): Promise<VideoPickerVideo[]> {
  await delay(400);
  return [
    { id: "vid-1", title: "8 Hours of Deep Sleep Music", viewCount: 1_200_000 },
    { id: "vid-2", title: "Rain Sounds for Studying", viewCount: 850_000 },
  ];
}

async function mockGenerateOk(): Promise<Result<GeneratedPrompt, GenerateErrorReason>> {
  await delay(2000);
  return ok({ id: "prompt-1", output: OUTPUT });
}

export const Default: Story = {
  render: () => (
    <GeneratorForm
      trackedChannels={CHANNELS}
      onListTopVideos={mockListTopVideos}
      onGenerate={mockGenerateOk}
      onDiscard={async () => {
        await delay(400);
      }}
      className="max-w-xl"
    />
  ),
};

export const InsufficientCredits: Story = {
  render: () => (
    <GeneratorForm
      trackedChannels={CHANNELS}
      onListTopVideos={mockListTopVideos}
      onGenerate={async () => {
        await delay(800);
        return err({ type: "insufficient_credits", balance: 2, required: 5 });
      }}
      className="max-w-xl"
    />
  ),
};

export const GenerationFailed: Story = {
  render: () => (
    <GeneratorForm
      trackedChannels={CHANNELS}
      onListTopVideos={mockListTopVideos}
      onGenerate={async () => {
        await delay(800);
        return err({ type: "failed", message: "The AI provider is temporarily overloaded." });
      }}
      className="max-w-xl"
    />
  ),
};
