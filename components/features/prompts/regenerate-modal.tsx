"use client";

import * as React from "react";

import { CREDIT_COSTS } from "@/lib/credits/costs";
import type { Result } from "@/lib/result";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import type { PromptOutput } from "@/components/features/prompts/types";

export interface RegenerateFeedback {
  tags: string[];
  freeText: string | null;
}

export type RegenerateErrorReason =
  | { type: "insufficient_credits"; balance: number; required: number }
  | { type: "failed"; message: string };

export interface RegenerateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegenerate: (
    feedback: RegenerateFeedback,
  ) => Promise<Result<PromptOutput, RegenerateErrorReason>>;
  onRegenerated?: (output: PromptOutput) => void;
}

const FEEDBACK_CHIPS: { value: string; label: string }[] = [
  { value: "more_casual", label: "More casual" },
  { value: "shorter", label: "Shorter" },
  { value: "less_clickbait", label: "Less clickbait" },
  { value: "more_educational", label: "More educational" },
  { value: "more_detail", label: "More detail" },
];

// UI-UX-Flow.md §7.5: feedback chips (multi-select) + optional free text,
// opens as a small modal above the current results.
function RegenerateModal({
  open,
  onOpenChange,
  onRegenerate,
  onRegenerated,
}: RegenerateModalProps) {
  const [tags, setTags] = React.useState<string[]>([]);
  const [freeText, setFreeText] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function toggleTag(value: string) {
    setTags((current) =>
      current.includes(value) ? current.filter((tag) => tag !== value) : [...current, value],
    );
  }

  function reset() {
    setTags([]);
    setFreeText("");
    setPending(false);
    setError(null);
  }

  async function handleRegenerate() {
    setPending(true);
    setError(null);
    const result = await onRegenerate({ tags, freeText: freeText.trim() || null });
    setPending(false);

    if (!result.ok) {
      setError(
        result.error.type === "insufficient_credits"
          ? `Not enough credits (${result.error.balance} of ${result.error.required} needed).`
          : result.error.message,
      );
      return;
    }

    onRegenerated?.(result.value);
    reset();
    onOpenChange(false);
  }

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
      title="Regenerate with feedback"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button loading={pending} onClick={() => void handleRegenerate()}>
            Regenerate &middot; Uses {CREDIT_COSTS.promptRegenerate} credits
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {error ? (
          <p role="alert" className="text-body-sm text-error">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-1.5">
          {FEEDBACK_CHIPS.map((chip) => (
            <Button
              key={chip.value}
              type="button"
              size="xs"
              variant={tags.includes(chip.value) ? "secondary" : "ghost"}
              aria-pressed={tags.includes(chip.value)}
              onClick={() => toggleTag(chip.value)}
            >
              {chip.label}
            </Button>
          ))}
        </div>
        <Textarea
          label="Additional feedback"
          placeholder="Anything else to guide the regeneration?"
          rows={3}
          value={freeText}
          onChange={(event) => setFreeText(event.target.value)}
        />
      </div>
    </Modal>
  );
}

export { RegenerateModal };
