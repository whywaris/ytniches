import * as React from "react";

import { RegenerateModal } from "@/components/features/prompts/regenerate-modal";
import type { PromptOutput } from "@/components/features/prompts/types";
import { Button } from "@/components/ui/button";
import { err, ok } from "@/lib/result";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof RegenerateModal> = {
  title: "features/prompts/RegenerateModal",
  component: RegenerateModal,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof RegenerateModal>;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const OUTPUT: PromptOutput = {
  title_variants: ["A", "B", "C", "D", "E"],
  thumbnail_concepts: ["X", "Y", "Z"],
  hook_variants: ["H1", "H2", "H3"],
  script_outline: { intro: "Intro", body_sections: ["Body"], outro: "Outro" },
  description_template: "Description",
};

function Demo({ fails = false }: { fails?: boolean }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Regenerate</Button>
      <RegenerateModal
        open={open}
        onOpenChange={setOpen}
        onRegenerate={async () => {
          await delay(800);
          return fails
            ? err({ type: "insufficient_credits", balance: 1, required: 3 })
            : ok(OUTPUT);
        }}
      />
    </>
  );
}

export const Default: Story = {
  render: () => <Demo />,
};

export const InsufficientCredits: Story = {
  render: () => <Demo fails />,
};

export const OpenByDefault: Story = {
  render: () => (
    <RegenerateModal open onOpenChange={() => {}} onRegenerate={async () => ok(OUTPUT)} />
  ),
};
