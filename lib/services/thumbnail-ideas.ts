import { generateThumbnailIdeaOutput, type AiError } from "@/lib/ai";
import { consume, refund } from "@/lib/credits";
import { createClient } from "@/lib/supabase/server";
import { err, ok, type Result } from "@/lib/result";
import type { InsufficientCreditsError } from "@/lib/credits";
import { CREDIT_COSTS } from "@/lib/credits/costs";
import type { RequestContext } from "@/lib/context";
import type { Database } from "@/lib/supabase/database.types";

// Monetization.md §3.1: same flat cost for a first generation and
// "Generate another" -- no cheaper-regeneration discount like prompts'
// own REGENERATE_COST (this feature has no feedback step to make a
// regeneration partial-reuse).
const GENERATE_COST = CREDIT_COSTS.thumbnailIdeas;

export type NotFoundError = { type: "not_found" };
export type GenerationFailedError = { type: "generation_failed"; message: string };
export type GenerateThumbnailIdeasError =
  InsufficientCreditsError | NotFoundError | GenerationFailedError;

export interface ThumbnailIdeaSourceVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
}

export interface ThumbnailIdeaSet {
  id: string;
  sourceVideo: ThumbnailIdeaSourceVideo;
  ideas: string[];
  regenerationOf: string | null;
  createdAt: string;
}

interface VideoContext {
  id: string;
  title: string;
  description: string;
  tags: string[];
  thumbnailUrl: string;
}

// Deliberately not lib/services/prompts.ts's own getVideoRow (that module
// keeps its helpers private, and this feature's inputs are a strict subset
// -- no transcript, no youtube_video_id -- so a small local duplicate is
// clearer than exporting cross-module internals for one field difference.
async function getVideoRow(videoId: string): Promise<VideoContext | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("videos")
    .select("id, title, description, tags, thumbnail_url")
    .eq("id", videoId)
    .maybeSingle();

  if (error) {
    throw new Error(`getVideoRow query failed: ${error.message}`);
  }
  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    description: data.description ?? "",
    tags: data.tags,
    thumbnailUrl: data.thumbnail_url,
  };
}

function describeAiError(error: AiError): string {
  switch (error.type) {
    case "rate_limited":
      return "The AI provider is rate-limiting requests right now.";
    case "overloaded":
      return "The AI provider is temporarily overloaded.";
    case "invalid_request":
    case "network_error":
    case "api_error":
    case "invalid_response":
      return error.message;
  }
}

interface ThumbnailIdeaOutputJson {
  ideas: string[];
}

function toThumbnailIdeaSet(
  row: Database["public"]["Tables"]["prompts"]["Row"],
  sourceVideo: ThumbnailIdeaSourceVideo,
): ThumbnailIdeaSet {
  const output = row.output as unknown as ThumbnailIdeaOutputJson;
  return {
    id: row.id,
    sourceVideo,
    ideas: output.ideas,
    regenerationOf: row.regeneration_of,
    createdAt: row.created_at,
  };
}

// Backend-Schema.md §3.4 / D-041's gap 2: kind='thumbnail_ideas' is what
// disambiguates this row from a regular AI Prompt sharing the same table.
// tone has no meaning here -- 'neutral' is a harmless placeholder rather
// than a second migration to relax that column's NOT NULL constraint.
async function insertThumbnailIdeaRow(
  ctx: RequestContext,
  fields: { sourceVideoId: string; ideas: string[]; regenerationOf: string | null },
): Promise<Database["public"]["Tables"]["prompts"]["Row"]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prompts")
    .insert({
      user_id: ctx.userId,
      source_video_id: fields.sourceVideoId,
      kind: "thumbnail_ideas",
      tone: "neutral",
      target_audience: null,
      output: { ideas: fields.ideas },
      regeneration_of: fields.regenerationOf,
      feedback_tags: [],
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`insertThumbnailIdeaRow failed: ${error.message}`);
  }
  return data;
}

// PRD.md §7.3. Same consume-before-generate, refund-on-failure pattern as
// lib/services/prompts.ts's generatePrompts -- no transcript fetch (not in
// this feature's inputs) and no URL-resolution branch (always an existing
// tracked video, entered from an OutlierCard, never a pasted URL).
export async function generateThumbnailIdeas(
  ctx: RequestContext,
  videoId: string,
  idempotencyKey: string,
): Promise<Result<ThumbnailIdeaSet, GenerateThumbnailIdeasError>> {
  const video = await getVideoRow(videoId);
  if (!video) {
    return err({ type: "not_found" });
  }

  const consumeResult = await consume(
    ctx,
    GENERATE_COST,
    "Thumbnail idea generation",
    idempotencyKey,
  );
  if (!consumeResult.ok) {
    return err(consumeResult.error);
  }

  const aiResult = await generateThumbnailIdeaOutput({
    videoTitle: video.title,
    videoDescription: video.description,
    videoTags: video.tags,
  });

  if (!aiResult.ok) {
    await refund(ctx, GENERATE_COST, "Thumbnail idea generation failed", idempotencyKey);
    return err({ type: "generation_failed", message: describeAiError(aiResult.error) });
  }

  const row = await insertThumbnailIdeaRow(ctx, {
    sourceVideoId: video.id,
    ideas: aiResult.value.ideas,
    regenerationOf: null,
  });

  return ok(
    toThumbnailIdeaSet(row, { id: video.id, title: video.title, thumbnailUrl: video.thumbnailUrl }),
  );
}

async function getOwnThumbnailIdeaRow(
  ctx: RequestContext,
  thumbnailIdeaSetId: string,
): Promise<Database["public"]["Tables"]["prompts"]["Row"] | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("id", thumbnailIdeaSetId)
    .eq("user_id", ctx.userId)
    .eq("kind", "thumbnail_ideas")
    .maybeSingle();

  if (error) {
    throw new Error(`getOwnThumbnailIdeaRow query failed: ${error.message}`);
  }
  return data;
}

// "Generate another" (ThumbnailIdeasModal) -- same regeneration_of-chains-
// to-the-original pattern as prompts' regeneratePrompts, but no feedback
// step (PRD.md §7.3 names none, and the task's own spec confirms: "uses 5
// more credits, same as RegenerateModal pattern" -- flat cost, not the
// prompts feature's cheaper-with-feedback discount).
export async function regenerateThumbnailIdeas(
  ctx: RequestContext,
  thumbnailIdeaSetId: string,
  idempotencyKey: string,
): Promise<Result<ThumbnailIdeaSet, GenerateThumbnailIdeasError>> {
  const original = await getOwnThumbnailIdeaRow(ctx, thumbnailIdeaSetId);
  if (!original) {
    return err({ type: "not_found" });
  }

  const video = await getVideoRow(original.source_video_id);
  if (!video) {
    return err({ type: "not_found" });
  }

  const consumeResult = await consume(
    ctx,
    GENERATE_COST,
    "Thumbnail idea regeneration",
    idempotencyKey,
  );
  if (!consumeResult.ok) {
    return err(consumeResult.error);
  }

  const aiResult = await generateThumbnailIdeaOutput({
    videoTitle: video.title,
    videoDescription: video.description,
    videoTags: video.tags,
  });

  if (!aiResult.ok) {
    await refund(ctx, GENERATE_COST, "Thumbnail idea regeneration failed", idempotencyKey);
    return err({ type: "generation_failed", message: describeAiError(aiResult.error) });
  }

  const row = await insertThumbnailIdeaRow(ctx, {
    sourceVideoId: video.id,
    ideas: aiResult.value.ideas,
    regenerationOf: original.id,
  });

  return ok(
    toThumbnailIdeaSet(row, { id: video.id, title: video.title, thumbnailUrl: video.thumbnailUrl }),
  );
}
