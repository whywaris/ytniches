import { generateStructuredOutput, type AiClientError } from "@/lib/ai/client";
import { buildPrompt, type PromptGenerationContext } from "@/lib/ai/prompt";
import type { PromptOutput } from "@/lib/ai/schemas";
import type { Result } from "@/lib/result";

export type AiError = AiClientError;
export type { PromptGenerationContext } from "@/lib/ai/prompt";
export type { PromptOutput } from "@/lib/ai/schemas";

// TRD.md §6.2: "Interface abstracts provider so Claude <-> OpenAI swap is
// one config change." The Anthropic SDK is only ever imported by
// lib/ai/client.ts -- callers of this function see no provider-specific
// types, so swapping the implementation inside client.ts is the whole
// migration.
export async function generatePromptOutput(
  context: PromptGenerationContext,
): Promise<Result<PromptOutput, AiError>> {
  const { system, user } = buildPrompt(context);
  return generateStructuredOutput(system, user);
}
