"use client";

import * as React from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { Trash2, Video } from "lucide-react";

import {
  deletePromptAction,
  regeneratePromptsAction,
  updatePromptOutputAction,
} from "@/app/(app)/prompts/actions";
import { err, ok, type Result } from "@/lib/result";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast-provider";
import { PromptResults } from "@/components/features/prompts/prompt-results";
import {
  RegenerateModal,
  type RegenerateErrorReason,
} from "@/components/features/prompts/regenerate-modal";
import type { PromptDetail, PromptOutput } from "@/components/features/prompts/types";

export interface PromptDetailClientProps {
  prompt: PromptDetail;
}

// UI-UX-Flow.md §7.4: full editable output, regenerate (opens §7.5's
// feedback modal), delete with confirmation.
function PromptDetailClient({ prompt: initialPrompt }: PromptDetailClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [prompt, setPrompt] = React.useState(initialPrompt);
  const [saving, setSaving] = React.useState(false);
  const [showRegenerate, setShowRegenerate] = React.useState(false);
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  async function handleSave(output: PromptOutput) {
    setSaving(true);
    const result = await updatePromptOutputAction(prompt.id, output);
    setSaving(false);
    if (result.ok) {
      setPrompt((current) => ({ ...current, output }));
      showToast({ title: "Changes saved", variant: "success" });
    } else {
      showToast({ title: "Couldn't save changes", variant: "error" });
    }
  }

  async function handleRegenerate(feedback: {
    tags: string[];
    freeText: string | null;
  }): Promise<Result<PromptOutput, RegenerateErrorReason>> {
    const result = await regeneratePromptsAction(prompt.id, feedback, crypto.randomUUID());
    if (!result.ok) {
      return result.error.type === "insufficient_credits"
        ? err(result.error)
        : err({ type: "failed", message: describeRegenerateError(result.error) });
    }
    return ok(result.value.output);
  }

  function handleRegenerated(output: PromptOutput) {
    setPrompt((current) => ({ ...current, output }));
    showToast({ title: "Regenerated with feedback", variant: "success" });
  }

  async function handleDelete() {
    setDeleting(true);
    await deletePromptAction(prompt.id);
    setDeleting(false);
    router.push("/prompts");
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-6">
      <div className="flex items-center gap-3">
        {prompt.sourceVideo.thumbnailUrl ? (
          <Image
            src={prompt.sourceVideo.thumbnailUrl}
            alt=""
            width={120}
            height={68}
            className="h-[68px] w-[120px] shrink-0 rounded-sm object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-[68px] w-[120px] shrink-0 items-center justify-center rounded-sm bg-bg-surface-2">
            <Video className="size-5 text-text-tertiary" aria-hidden="true" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-h3 text-text-primary">{prompt.sourceVideo.title}</h1>
          <p className="text-body-sm text-text-tertiary">
            Generated {formatRelativeTime(prompt.createdAt)}
          </p>
        </div>
        <Button variant="secondary" onClick={() => setShowRegenerate(true)}>
          Regenerate
        </Button>
        <Button
          variant="ghost"
          iconOnly
          aria-label="Delete prompt"
          onClick={() => setConfirmingDelete(true)}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </div>

      <PromptResults
        key={JSON.stringify(prompt.output)}
        output={prompt.output}
        editable
        onSave={(output) => void handleSave(output)}
        saving={saving}
      />

      <RegenerateModal
        open={showRegenerate}
        onOpenChange={setShowRegenerate}
        onRegenerate={handleRegenerate}
        onRegenerated={handleRegenerated}
      />

      <ConfirmDialog
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        title="Delete this prompt?"
        description="This removes it from your library. This can't be undone."
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}

function describeRegenerateError(error: { type: string; message?: string }): string {
  return error.type === "not_found"
    ? "This prompt no longer exists."
    : (error.message ?? "Something went wrong. Your credit was not charged.");
}

export { PromptDetailClient };
