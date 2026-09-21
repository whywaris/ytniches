"use client";

import * as React from "react";

import { Check, Copy, ThumbsDown, ThumbsUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { TextInput } from "@/components/ui/text-input";
import { Textarea } from "@/components/ui/textarea";
import type { PromptOutput } from "@/components/features/prompts/types";

// UI-UX-Flow.md §7.3/§7.4's five category cards. Shared between the
// generator's inline results (read-only, editable=false) and the detail
// page (editable=true, UI-UX-Flow.md §7.4 "Edit inline"). Like/dislike is
// a local-only, ephemeral affordance -- Backend-Schema.md's prompts table
// has no per-item vote column, so it's never persisted, only shown while
// reviewing.
export interface PromptResultsProps {
  output: PromptOutput;
  editable?: boolean;
  onSave?: (output: PromptOutput) => void;
  saving?: boolean;
  className?: string;
}

function updateAt<T>(array: T[], index: number, value: T): T[] {
  return array.map((item, i) => (i === index ? value : item));
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can be unavailable (permissions, insecure context) --
      // silently no-op rather than showing a broken error for a convenience action.
    }
  }

  return (
    <Button
      variant="ghost"
      size="xs"
      iconOnly
      aria-label={copied ? "Copied" : "Copy"}
      onClick={() => void handleCopy()}
    >
      {copied ? <Check className="text-success" aria-hidden="true" /> : <Copy aria-hidden="true" />}
    </Button>
  );
}

function LikeDislike() {
  const [vote, setVote] = React.useState<"like" | "dislike" | null>(null);
  return (
    <div className="flex items-center gap-0.5">
      <Button
        variant="ghost"
        size="xs"
        iconOnly
        aria-label="Like"
        aria-pressed={vote === "like"}
        onClick={() => setVote((current) => (current === "like" ? null : "like"))}
      >
        <ThumbsUp className={cn(vote === "like" && "text-accent")} aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="xs"
        iconOnly
        aria-label="Dislike"
        aria-pressed={vote === "dislike"}
        onClick={() => setVote((current) => (current === "dislike" ? null : "dislike"))}
      >
        <ThumbsDown className={cn(vote === "dislike" && "text-error")} aria-hidden="true" />
      </Button>
    </div>
  );
}

function PromptResults({
  output,
  editable = false,
  onSave,
  saving = false,
  className,
}: PromptResultsProps) {
  // `draft` only re-derives from a new `output` if this component remounts
  // -- callers switching to a different prompt's output must key this
  // component by the prompt's id, per React's own guidance against
  // syncing props to state with an effect (react-hooks/set-state-in-effect).
  const [draft, setDraft] = React.useState(output);

  const shown = editable ? draft : output;
  const isDirty = editable && JSON.stringify(draft) !== JSON.stringify(output);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <Card padding="md">
        <CardHeader>
          <h3 className="text-h4 text-text-primary">Title variants</h3>
        </CardHeader>
        <ul className="flex flex-col gap-2">
          {shown.title_variants.map((title, index) => (
            <li key={index} className="flex items-center gap-2">
              {editable ? (
                <TextInput
                  aria-label={`Title variant ${index + 1}`}
                  value={title}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      title_variants: updateAt(current.title_variants, index, event.target.value),
                    }))
                  }
                  className="flex-1"
                />
              ) : (
                <span className="flex-1 text-body text-text-primary">{title}</span>
              )}
              <CopyButton text={title} />
              {!editable ? <LikeDislike /> : null}
            </li>
          ))}
        </ul>
      </Card>

      <Card padding="md">
        <CardHeader>
          <h3 className="text-h4 text-text-primary">Thumbnail concepts</h3>
        </CardHeader>
        <ul className="flex flex-col gap-2">
          {shown.thumbnail_concepts.map((concept, index) => (
            <li key={index} className="flex items-center gap-2">
              {editable ? (
                <TextInput
                  aria-label={`Thumbnail concept ${index + 1}`}
                  value={concept}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      thumbnail_concepts: updateAt(
                        current.thumbnail_concepts,
                        index,
                        event.target.value,
                      ),
                    }))
                  }
                  className="flex-1"
                />
              ) : (
                <span className="flex-1 text-body-sm text-text-secondary">{concept}</span>
              )}
              <CopyButton text={concept} />
            </li>
          ))}
        </ul>
      </Card>

      <Card padding="md">
        <CardHeader>
          <h3 className="text-h4 text-text-primary">Hook variants</h3>
        </CardHeader>
        <ul className="flex flex-col gap-2">
          {shown.hook_variants.map((hook, index) => (
            <li key={index} className="flex items-center gap-2">
              {editable ? (
                <TextInput
                  aria-label={`Hook variant ${index + 1}`}
                  value={hook}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      hook_variants: updateAt(current.hook_variants, index, event.target.value),
                    }))
                  }
                  className="flex-1"
                />
              ) : (
                <span className="flex-1 text-body-sm text-text-secondary">{hook}</span>
              )}
              <CopyButton text={hook} />
            </li>
          ))}
        </ul>
      </Card>

      <Card padding="md">
        <CardHeader>
          <h3 className="text-h4 text-text-primary">Script outline</h3>
          <CopyButton
            text={[
              `Intro: ${shown.script_outline.intro}`,
              ...shown.script_outline.body_sections.map((section, i) => `${i + 1}. ${section}`),
              `Outro: ${shown.script_outline.outro}`,
            ].join("\n")}
          />
        </CardHeader>
        {editable ? (
          <div className="flex flex-col gap-3">
            <Textarea
              label="Intro"
              rows={2}
              value={draft.script_outline.intro}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  script_outline: { ...current.script_outline, intro: event.target.value },
                }))
              }
            />
            <Textarea
              label="Body sections (one per line)"
              rows={4}
              value={draft.script_outline.body_sections.join("\n")}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  script_outline: {
                    ...current.script_outline,
                    body_sections: event.target.value.split("\n"),
                  },
                }))
              }
            />
            <Textarea
              label="Outro"
              rows={2}
              value={draft.script_outline.outro}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  script_outline: { ...current.script_outline, outro: event.target.value },
                }))
              }
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2 text-body-sm text-text-secondary">
            <p>
              <strong className="text-text-primary">Intro:</strong> {output.script_outline.intro}
            </p>
            <ol className="list-decimal pl-5">
              {output.script_outline.body_sections.map((section, index) => (
                <li key={index}>{section}</li>
              ))}
            </ol>
            <p>
              <strong className="text-text-primary">Outro:</strong> {output.script_outline.outro}
            </p>
          </div>
        )}
      </Card>

      <Card padding="md">
        <CardHeader>
          <h3 className="text-h4 text-text-primary">Description template</h3>
          <CopyButton text={shown.description_template} />
        </CardHeader>
        {editable ? (
          <Textarea
            aria-label="Description template"
            rows={4}
            value={draft.description_template}
            onChange={(event) =>
              setDraft((current) => ({ ...current, description_template: event.target.value }))
            }
          />
        ) : (
          <p className="whitespace-pre-wrap text-body-sm text-text-secondary">
            {output.description_template}
          </p>
        )}
      </Card>

      {editable ? (
        <div className="flex justify-end">
          <Button onClick={() => onSave?.(draft)} disabled={!isDirty} loading={saving}>
            Save changes
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export { PromptResults };
