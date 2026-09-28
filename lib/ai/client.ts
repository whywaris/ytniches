import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

import { err, ok, type Result } from "@/lib/result";

import type { z } from "zod";

// TRD.md §6.2 / D-029: single model for all 5 categories in Phase 1.
// D-032: switched from claude-sonnet-5 to gpt-4o (Anthropic billing
// unavailable) -- this is the only file that needed to change.
const MODEL = "gpt-4o";
// D-074: background niche classification is high-volume and low-stakes,
// so it runs on the mini model; user-facing generation stays on MODEL.
export const CLASSIFY_MODEL = "gpt-4o-mini";
export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536; // niches.embedding vector(1536)
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

// One structured line per call, so a job's OpenAI cost can be totalled from
// the server log (grep "ai_usage"). `job` is the schema name for structured
// output, or the caller's label for embeddings.
export function logAiUsage(
  job: string,
  model: string,
  usage: { prompt_tokens: number; completion_tokens?: number } | undefined,
): void {
  if (!usage) return;
  console.info(
    JSON.stringify({
      event: "ai_usage",
      job,
      model,
      input_tokens: usage.prompt_tokens,
      output_tokens: usage.completion_tokens ?? 0,
    }),
  );
}

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
  options: { model?: string } = {},
): Promise<Result<T, AiClientError>> {
  const model = options.model ?? MODEL;
  try {
    const completion = await getClient().chat.completions.parse({
      model,
      max_completion_tokens: MAX_TOKENS,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: zodResponseFormat(schema, schemaName),
    });
    logAiUsage(schemaName, model, completion.usage);

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

export async function createEmbedding(
  text: string,
  job = "embedding",
): Promise<Result<number[], AiClientError>> {
  try {
    const response = await getClient().embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
      dimensions: EMBEDDING_DIMENSIONS,
    });
    logAiUsage(job, EMBEDDING_MODEL, response.usage);
    const embedding = response.data[0]?.embedding;
    if (!embedding || embedding.length !== EMBEDDING_DIMENSIONS) {
      return err({ type: "invalid_response", message: "embedding missing or wrong size" });
    }
    return ok(embedding);
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
