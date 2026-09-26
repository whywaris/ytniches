"use client";

import * as React from "react";

import Image from "next/image";

import { CREDIT_COSTS } from "@/lib/credits/costs";
import {
  generateThumbnailIdeasAction,
  regenerateThumbnailIdeasAction,
} from "@/app/(app)/outliers/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Modal } from "@/components/ui/modal";
import { CopyButton } from "@/components/features/prompts/prompt-results";

export interface ThumbnailIdeasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video: { id: string; title: string; thumbnailUrl: string };
}

type ModalState =
  | { status: "idle" }
  | { status: "generating" }
  | { status: "results"; setId: string; ideas: string[] }
  | { status: "insufficient_credits"; balance: number; required: number }
  | { status: "failed"; message: string };

// PRD.md §7.3. Self-contained, same pattern as UpgradeModal -- calls its
// own Server Actions directly rather than threading callback props through
// every OutlierCard call site (there are two: /outliers and
// /tracking/[channelId]). Opens idle (shows the source video + an explicit
// "Generate" button, so the credit spend is a deliberate in-modal action,
// not fired the instant the outer card's trigger button is clicked) then
// generating -> results | insufficient_credits | failed. "Generate
// another" reuses the same generating state and replaces the results in
// place.
function ThumbnailIdeasModal({ open, onOpenChange, video }: ThumbnailIdeasModalProps) {
  const [state, setState] = React.useState<ModalState>({ status: "idle" });

  function handleOpenChange(next: boolean) {
    if (!next) setState({ status: "idle" });
    onOpenChange(next);
  }

  async function runGenerate(action: () => ReturnType<typeof generateThumbnailIdeasAction>) {
    setState({ status: "generating" });
    const result = await action();
    if (!result.ok) {
      if (result.error.type === "insufficient_credits") {
        setState({
          status: "insufficient_credits",
          balance: result.error.balance,
          required: result.error.required,
        });
      } else if (result.error.type === "not_found") {
        setState({ status: "failed", message: "This video couldn't be found." });
      } else {
        setState({ status: "failed", message: result.error.message });
      }
      return;
    }
    setState({ status: "results", setId: result.value.id, ideas: result.value.ideas });
  }

  function handleGenerate() {
    void runGenerate(() => generateThumbnailIdeasAction(video.id, crypto.randomUUID()));
  }

  function handleRegenerate() {
    if (state.status !== "results") return;
    const { setId } = state;
    void runGenerate(() => regenerateThumbnailIdeasAction(setId, crypto.randomUUID()));
  }

  return (
    <Modal open={open} onOpenChange={handleOpenChange} title="Thumbnail ideas" size="md">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Image
            src={video.thumbnailUrl}
            alt=""
            width={96}
            height={54}
            className="h-[54px] w-24 shrink-0 rounded-xs object-cover"
            unoptimized
          />
          <p className="min-w-0 truncate text-body-sm text-text-secondary">{video.title}</p>
        </div>

        {state.status === "idle" ? (
          <Button onClick={handleGenerate}>
            Generate thumbnail ideas &middot; Uses {CREDIT_COSTS.thumbnailIdeas} credits
          </Button>
        ) : null}

        {state.status === "generating" ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <LoadingSkeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : null}

        {state.status === "insufficient_credits" ? (
          <div className="flex items-center justify-between rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-body-sm text-warning">
            <span>
              Not enough credits ({state.balance} of {state.required} needed).
            </span>
            <Button size="sm" variant="secondary" asChild>
              <a href="/settings/billing">Upgrade</a>
            </Button>
          </div>
        ) : null}

        {state.status === "failed" ? (
          <p role="alert" className="text-body-sm text-error">
            {state.message}
          </p>
        ) : null}

        {state.status === "results" ? (
          <>
            <div className="flex flex-col gap-2">
              {state.ideas.map((idea, index) => (
                <Card
                  key={index}
                  variant="base"
                  padding="md"
                  className="flex items-start justify-between gap-3"
                >
                  <p className="text-body-sm text-text-primary">{idea}</p>
                  <CopyButton text={idea} />
                </Card>
              ))}
            </div>
            <Button variant="secondary" onClick={handleRegenerate} className="self-start">
              Generate another &middot; Uses {CREDIT_COSTS.thumbnailIdeasRegenerate} credits
            </Button>
          </>
        ) : null}
      </div>
    </Modal>
  );
}

export { ThumbnailIdeasModal };
