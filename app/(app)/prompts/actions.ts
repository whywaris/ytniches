"use server";

import { getRequestContext } from "@/lib/context";
import {
  deletePrompt,
  generatePrompts,
  getPrompt,
  listPrompts,
  regeneratePrompts,
  updatePromptOutput,
  type GeneratePromptsError,
  type NotFoundError,
  type Prompt,
  type PromptSummary,
  type RegeneratePromptsError,
} from "@/lib/services/prompts";
import { listVideosForChannel, type VideoSummary } from "@/lib/services/channels";
import {
  GeneratePromptsInputSchema,
  RegeneratePromptsInputSchema,
} from "@/lib/services/prompts.schema";
import { err, type Result } from "@/lib/result";

export type GeneratePromptsActionError =
  GeneratePromptsError | { type: "validation_error"; message: string };

// Thin per CLAUDE.md's Server Action pattern (same as tracking/actions.ts,
// niches/actions.ts): validate input, get the caller's context, delegate to
// the service, return its Result untouched.
//
// idempotencyKey is a separate parameter, not part of the Zod-validated
// input -- TRD.md §3.4 says the client generates it so a genuine retry of
// the same submit reuses the same key.
export async function generatePromptsAction(
  input: unknown,
  idempotencyKey: string,
): Promise<Result<Prompt, GeneratePromptsActionError>> {
  const parsed = GeneratePromptsInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      type: "validation_error",
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    });
  }

  const ctx = await getRequestContext();
  const { targetAudience, tone, videoId, videoUrl } = parsed.data;
  return generatePrompts(
    ctx,
    videoId ? { targetAudience, tone, videoId } : { targetAudience, tone, videoUrl: videoUrl! },
    idempotencyKey,
  );
}

export type RegeneratePromptsActionError =
  RegeneratePromptsError | { type: "validation_error"; message: string };

export async function regeneratePromptsAction(
  promptId: string,
  feedback: unknown,
  idempotencyKey: string,
): Promise<Result<Prompt, RegeneratePromptsActionError>> {
  const parsed = RegeneratePromptsInputSchema.safeParse(feedback);
  if (!parsed.success) {
    return err({
      type: "validation_error",
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    });
  }

  const ctx = await getRequestContext();
  return regeneratePrompts(ctx, promptId, parsed.data, idempotencyKey);
}

export async function getPromptAction(promptId: string): Promise<Prompt | null> {
  const ctx = await getRequestContext();
  return getPrompt(ctx, promptId);
}

export async function listPromptsAction(
  options: { limit?: number; search?: string } = {},
): Promise<PromptSummary[]> {
  const ctx = await getRequestContext();
  return listPrompts(ctx, options);
}

export async function updatePromptOutputAction(
  promptId: string,
  output: Prompt["output"],
): Promise<Result<void, NotFoundError>> {
  const ctx = await getRequestContext();
  return updatePromptOutput(ctx, promptId, output);
}

export async function deletePromptAction(promptId: string): Promise<Result<void, NotFoundError>> {
  const ctx = await getRequestContext();
  return deletePrompt(ctx, promptId);
}

export async function listTopVideosForChannelAction(channelId: string): Promise<VideoSummary[]> {
  return listVideosForChannel(channelId, { sortBy: "views", limit: 10 });
}
