"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { Sparkles } from "lucide-react";

import {
  deletePromptAction,
  generatePromptsAction,
  listPromptsAction,
  listTopVideosForChannelAction,
} from "@/app/(app)/prompts/actions";
import { err, ok, type Result } from "@/lib/result";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { TextInput } from "@/components/ui/text-input";
import {
  GeneratorForm,
  type GenerateErrorReason,
  type GeneratedPrompt,
  type GenerateInput,
  type VideoPickerChannel,
  type VideoPickerVideo,
} from "@/components/features/prompts/generator-form";
import { PromptCard } from "@/components/features/prompts/prompt-card";
import type { PromptSummary } from "@/components/features/prompts/types";

export interface PromptsClientProps {
  initialPrompts: PromptSummary[];
  trackedChannels: VideoPickerChannel[];
  preselect?: { channelId: string; videoId: string; videos: VideoPickerVideo[] };
}

function toGenerateErrorReason(error: {
  type: string;
  balance?: number;
  required?: number;
  message?: string;
}): GenerateErrorReason {
  if (error.type === "insufficient_credits") {
    return { type: "insufficient_credits", balance: error.balance!, required: error.required! };
  }
  if (error.type === "generation_failed") {
    return { type: "failed", message: error.message! };
  }
  // invalid_url / not_found / validation_error: the video itself couldn't
  // be resolved or analyzed -- UI-UX-Flow.md §7.6's "Video unsupported".
  return {
    type: "unsupported",
    message: error.message ?? "This video can't be analyzed. Try a different one.",
  };
}

// UI-UX-Flow.md §7.1's two-panel landing. Server-rendered initial library
// comes from page.tsx; everything below is the interactive layer -- search,
// generation, and discard, all wired to real Server Actions.
function PromptsClient({ initialPrompts, trackedChannels, preselect }: PromptsClientProps) {
  const router = useRouter();
  const [prompts, setPrompts] = React.useState(initialPrompts);
  const [search, setSearch] = React.useState("");
  const [searching, setSearching] = React.useState(false);

  async function runSearch(query: string) {
    setSearching(true);
    const results = await listPromptsAction({ search: query || undefined });
    setPrompts(results);
    setSearching(false);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    void runSearch(value);
  }

  async function handleGenerate(
    input: GenerateInput,
  ): Promise<Result<GeneratedPrompt, GenerateErrorReason>> {
    const result = await generatePromptsAction(input, crypto.randomUUID());
    if (!result.ok) return err(toGenerateErrorReason(result.error));
    return ok({ id: result.value.id, output: result.value.output });
  }

  function handleGenerated() {
    void runSearch(search);
  }

  async function handleDiscard(promptId: string) {
    await deletePromptAction(promptId);
    void runSearch(search);
  }

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-6 py-6 lg:flex-row lg:px-10">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <h1 className="text-h3 text-text-primary">Your library</h1>
        <TextInput
          label="Search"
          placeholder="Search your prompts…"
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
        />

        {searching ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <LoadingSkeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : prompts.length === 0 ? (
          <EmptyState
            icon={<Sparkles aria-hidden="true" />}
            message={
              search
                ? "No prompts match your search."
                : "You haven't generated any prompts yet. Extract from a video to start."
            }
          />
        ) : (
          <div className="flex flex-col gap-2">
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onOpen={(id) => router.push(`/prompts/${id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="lg:w-[420px] lg:shrink-0">
        <GeneratorForm
          trackedChannels={trackedChannels}
          onListTopVideos={(channelId) =>
            listTopVideosForChannelAction(channelId).then((videos) =>
              videos.map((video) => ({
                id: video.id,
                title: video.title,
                viewCount: video.viewCount,
              })),
            )
          }
          onGenerate={handleGenerate}
          onGenerated={handleGenerated}
          onDiscard={handleDiscard}
          initialSelection={preselect}
        />
      </div>
    </div>
  );
}

export { PromptsClient };
