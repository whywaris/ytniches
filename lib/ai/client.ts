import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

import { err, ok, type Result } from "@/lib/result";
import { PromptOutputSchema, type PromptOutput } from "@/lib/ai/schemas";

// TRD.md §6.2 / D-029: single model for all 5 categories in Phase 1.
// claude-sonnet-5 does not accept temperature/top_p/top_k (400) -- omitted
// entirely, not set to a default.
const MODEL = "claude-sonnet-5";
// Non-streaming default per the model's own guidance: never lowball
// max_tokens (a truncated structured response can't be repaired), and the
// ceiling only bounds worst case -- billing is by tokens actually
// generated, not by this number.
const MAX_TOKENS = 16000;

export type AiClientError =
  | { type: "invalid_request"; message: string }
  | { type: "rate_limited" }
  | { type: "overloaded" }
  | { type: "network_error"; message: string }
  | { type: "api_error"; status: number; message: string }
  | { type: "invalid_response"; message: string };

let cachedClient: Anthropic | undefined;
function getClient(): Anthropic {
  cachedClient ??= new Anthropic();
  return cachedClient;
}

export async function generateStructuredOutput(
  system: string,
  user: string,
): Promise<Result<PromptOutput, AiClientError>> {
  try {
    const response = await getClient().messages.parse({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system,
      messages: [{ role: "user", content: user }],
      output_config: { format: zodOutputFormat(PromptOutputSchema) },
    });

    if (!response.parsed_output) {
      return err({
        type: "invalid_response",
        message: "AI response did not match the expected output schema",
      });
    }

    return ok(response.parsed_output);
  } catch (cause) {
    return err(toAiClientError(cause));
  }
}

// Most-specific-first per the SDK's own typed exception hierarchy --
// NotFoundError and RateLimitError are both APIError subclasses, so they
// have to be checked before the generic APIError branch.
function toAiClientError(cause: unknown): AiClientError {
  if (cause instanceof Anthropic.RateLimitError) {
    return { type: "rate_limited" };
  }
  if (cause instanceof Anthropic.APIConnectionError) {
    return { type: "network_error", message: cause.message };
  }
  if (cause instanceof Anthropic.BadRequestError) {
    return { type: "invalid_request", message: cause.message };
  }
  if (cause instanceof Anthropic.APIError) {
    if (cause.status === 529) {
      return { type: "overloaded" };
    }
    return { type: "api_error", status: cause.status ?? 500, message: cause.message };
  }
  return {
    type: "network_error",
    message: cause instanceof Error ? cause.message : "unknown AI client error",
  };
}
