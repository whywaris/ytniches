import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

import { err, ok, type Result } from "@/lib/result";

import type { z } from "zod";

// TRD.md §6.2 / D-029: single model for all 5 categories in Phase 1.
// D-032: switched from claude-sonnet-5 to gpt-4o (Anthropic billing
// unavailable) -- this is the only file that needed to change.
const MODEL = "gpt-4o";
// Non-streaming default: never lowball max_tokens (a truncated structured
// response can't be repaired), and the ceiling only bounds worst case --
// billing is by tokens actually generated, not by this number.
const MAX_TOKENS = 16000;

export type AiClientError =
  | { type: "invalid_request"; message: string }
  | { type: "rate_limited" }
  | { type: "overloaded" }
  | { type: "network_error"; message: string }
  | { type: "api_error"; status: number; message: string }
  | { type: "invalid_response"; message: string };

let cachedClient: OpenAI | undefined;
function getClient(): OpenAI {
  cachedClient ??= new OpenAI();
  return cachedClient;
}

// Generic over the Zod schema (Phase 2 Task 3): callers get proper return-
// type inference from `schema` itself (z.ZodType<T>), not a hardcoded
// PromptOutput -- lib/ai/index.ts's generatePromptOutput and
// generateThumbnailIdeaOutput both funnel through this one call site.
export async function generateStructuredOutput<T>(
  system: string,
  user: string,
  schema: z.ZodType<T>,
  schemaName: string,
): Promise<Result<T, AiClientError>> {
  try {
    const completion = await getClient().chat.completions.parse({
      model: MODEL,
      max_completion_tokens: MAX_TOKENS,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: zodResponseFormat(schema, schemaName),
    });

    const parsed = completion.choices[0]?.message.parsed;
    if (!parsed) {
      return err({
        type: "invalid_response",
        message: "AI response did not match the expected output schema",
      });
    }

    return ok(parsed);
  } catch (cause) {
    return err(toAiClientError(cause));
  }
}

// Most-specific-first per the SDK's own typed exception hierarchy --
// RateLimitError and BadRequestError are both APIError subclasses, so they
// have to be checked before the generic APIError branch.
function toAiClientError(cause: unknown): AiClientError {
  if (cause instanceof OpenAI.RateLimitError) {
    return { type: "rate_limited" };
  }
  if (cause instanceof OpenAI.APIConnectionError) {
    return { type: "network_error", message: cause.message };
  }
  if (cause instanceof OpenAI.BadRequestError) {
    return { type: "invalid_request", message: cause.message };
  }
  if (cause instanceof OpenAI.APIError) {
    if (cause.status === 503) {
      return { type: "overloaded" };
    }
    return { type: "api_error", status: cause.status ?? 500, message: cause.message };
  }
  return {
    type: "network_error",
    message: cause instanceof Error ? cause.message : "unknown AI client error",
  };
}
