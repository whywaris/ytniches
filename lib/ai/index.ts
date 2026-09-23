import { generateStructuredOutput, type AiClientError } from "@/lib/ai/client";
import { buildPrompt, type PromptGenerationContext } from "@/lib/ai/prompt";
import {
  buildThumbnailIdeaPrompt,
  type ThumbnailIdeaPromptContext,
} from "@/lib/ai/thumbnail-idea-prompt";
import {
  PromptOutputSchema,
  ThumbnailIdeaOutputSchema,
  type PromptOutput,
  type ThumbnailIdeaOutput,
} from "@/lib/ai/schemas";
import type { Result } from "@/lib/result";

export type AiError = AiClientError;
export type { PromptGenerationContext } from "@/lib/ai/prompt";
export type { ThumbnailIdeaPromptContext } from "@/lib/ai/thumbnail-idea-prompt";
export type { PromptOutput, ThumbnailIdeaOutput } from "@/lib/ai/schemas";

// TRD.md §6.2: "Interface abstracts provider so Claude <-> OpenAI swap is
// one config change" (D-032 exercised this: the OpenAI SDK is only ever
// imported by lib/ai/client.ts -- callers of this function see no
// provider-specific types, so swapping the implementation inside client.ts
// was the whole migration).
export async function generatePromptOutput(
  context: PromptGenerationContext,
): Promise<Result<PromptOutput, AiError>> {
  const { system, user } = buildPrompt(context);
  return generateStructuredOutput(system, user, PromptOutputSchema, "prompt_output");
}

// Phase 2 Task 3 / D-041: text-only, same as generatePromptOutput's own
// thumbnail_concepts category -- concepts informed by why this type of
// video/thumbnail pattern works, not literal image analysis (lib/ai/client
// has no vision capability).
export async function generateThumbnailIdeaOutput(
  context: ThumbnailIdeaPromptContext,
): Promise<Result<ThumbnailIdeaOutput, AiError>> {
  const { system, user } = buildThumbnailIdeaPrompt(context);
  return generateStructuredOutput(system, user, ThumbnailIdeaOutputSchema, "thumbnail_idea_output");
}
