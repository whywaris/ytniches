import { getChannelById, getVideoById, resolveVideoUrl } from "@/lib/youtube";
import { fetchTranscript } from "@/lib/youtube/transcript";
import { generatePromptOutput, type AiError, type PromptOutput } from "@/lib/ai";
import { consume, refund } from "@/lib/credits";
import { upsertChannels } from "@/lib/services/channels";
import { upsertVideos } from "@/workers/channel-sync";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { err, ok, type Result } from "@/lib/result";
import type { InsufficientCreditsError } from "@/lib/credits";
import type { RequestContext } from "@/lib/context";
import type { Database } from "@/lib/supabase/database.types";

// Monetization.md §3.1.
const GENERATE_COST = 5;
const REGENERATE_COST = 3;

export type Tone = "neutral" | "casual" | "educational" | "dramatic" | "clickbait_lite";

export type InvalidUrlError = { type: "invalid_url" };
export type NotFoundError = { type: "not_found" };
export type GenerationFailedError = { type: "generation_failed"; message: string };

export type GeneratePromptsError =
  InsufficientCreditsError | InvalidUrlError | NotFoundError | GenerationFailedError;
export type RegeneratePromptsError =
  InsufficientCreditsError | NotFoundError | GenerationFailedError;

export interface PromptSourceVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
}

export interface PromptSummary {
  id: string;
  sourceVideo: PromptSourceVideo;
  createdAt: string;
}

export interface Prompt extends PromptSummary {
  targetAudience: string | null;
  tone: Tone;
  output: PromptOutput;
  regenerationOf: string | null;
  feedbackTags: string[];
  deletedAt: string | null;
}

interface VideoContext {
  id: string;
  youtubeVideoId: string;
  title: string;
  description: string;
  tags: string[];
  thumbnailUrl: string;
}

async function getVideoRow(videoId: string): Promise<VideoContext | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("videos")
    .select("id, youtube_video_id, title, description, tags, thumbnail_url")
    .eq("id", videoId)
    .maybeSingle();

  if (error) {
    throw new Error(`getVideoRow query failed: ${error.message}`);
  }
  if (!data) return null;

  return {
    id: data.id,
    youtubeVideoId: data.youtube_video_id,
    title: data.title,
    description: data.description ?? "",
    tags: data.tags,
    thumbnailUrl: data.thumbnail_url,
  };
}

// PRD.md §6.3 "Video URL ... pasted from YouTube" -- mirrors
// lib/services/tracking.ts's resolveAndCacheChannelFromUrl. A standalone
// video may reference a channel we've never cached either
// (videos.channel_id is a NOT NULL FK), so the channel is fetched and
// upserted first, then the video.
async function resolveAndCacheVideoFromUrl(
  url: string,
): Promise<Result<VideoContext, InvalidUrlError | NotFoundError>> {
  const resolved = resolveVideoUrl(url);
  if (!resolved.ok) {
    return err({ type: "invalid_url" });
  }

  const videoResult = await getVideoById(resolved.value);
  if (!videoResult.ok) {
    if (videoResult.error.type === "api_error" && videoResult.error.status === 404) {
      return err({ type: "not_found" });
    }
    // Any other transient failure (quota, network, bad response) means
    // "couldn't validate this URL right now" -- same invalid_url bucket
    // resolveAndCacheChannelFromUrl (tracking.ts) collapses into.
    return err({ type: "invalid_url" });
  }
  const video = videoResult.value;

  const channelResult = await getChannelById(video.snippet.channelId);
  if (!channelResult.ok) {
    return err({ type: "invalid_url" });
  }

  const channelIdByYoutubeId = await upsertChannels([channelResult.value]);
  const internalChannelId = channelIdByYoutubeId.get(video.snippet.channelId);
  if (!internalChannelId) {
    return err({ type: "invalid_url" });
  }

  const videoIdByYoutubeId = await upsertVideos(internalChannelId, [video]);
  const internalVideoId = videoIdByYoutubeId.get(video.id);
  if (!internalVideoId) {
    return err({ type: "invalid_url" });
  }

  return ok({
    id: internalVideoId,
    youtubeVideoId: video.id,
    title: video.snippet.title,
    description: video.snippet.description,
    tags: video.snippet.tags,
    thumbnailUrl:
      video.snippet.thumbnails?.high?.url ?? video.snippet.thumbnails?.medium?.url ?? "",
  });
}

async function resolveVideoContext(
  input: { videoId: string } | { videoUrl: string },
): Promise<Result<VideoContext, InvalidUrlError | NotFoundError>> {
  if ("videoId" in input) {
    const video = await getVideoRow(input.videoId);
    return video ? ok(video) : err({ type: "not_found" });
  }
  return resolveAndCacheVideoFromUrl(input.videoUrl);
}

// D-027: checks video_transcripts_cache first (service role -- no
// authenticated grant exists on that table), else fetches fresh via the
// unofficial timedtext endpoint and caches a hit. Never throws on a
// missing/unfetchable transcript -- returns null (soft-degrade, see
// UI-UX-Flow.md §7.6's deviation note).
async function getOrFetchTranscript(video: VideoContext): Promise<string | null> {
  const service = createServiceClient();
  const { data: cached, error: cacheError } = await service
    .from("video_transcripts_cache")
    .select("transcript_text")
    .eq("video_id", video.id)
    .maybeSingle();

  if (cacheError) {
    throw new Error(`getOrFetchTranscript cache query failed: ${cacheError.message}`);
  }
  if (cached) {
    return cached.transcript_text;
  }

  const fetched = await fetchTranscript(video.youtubeVideoId);
  if (!fetched) {
    return null;
  }

  const { error: insertError } = await service.from("video_transcripts_cache").insert({
    video_id: video.id,
    transcript_text: fetched.text,
    language: fetched.language,
    source: "youtube_captions",
  });
  if (insertError) {
    throw new Error(`getOrFetchTranscript cache insert failed: ${insertError.message}`);
  }

  const { error: updateError } = await service
    .from("videos")
    .update({ has_transcript: true })
    .eq("id", video.id);
  if (updateError) {
    throw new Error(`getOrFetchTranscript has_transcript update failed: ${updateError.message}`);
  }

  return fetched.text;
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

function toPrompt(
  row: Database["public"]["Tables"]["prompts"]["Row"],
  sourceVideo: PromptSourceVideo,
): Prompt {
  return {
    id: row.id,
    sourceVideo,
    createdAt: row.created_at,
    targetAudience: row.target_audience,
    tone: row.tone as Tone,
    output: row.output as unknown as PromptOutput,
    regenerationOf: row.regeneration_of,
    feedbackTags: row.feedback_tags,
    deletedAt: row.deleted_at,
  };
}

async function insertPromptRow(
  ctx: RequestContext,
  fields: {
    sourceVideoId: string;
    targetAudience: string | null;
    tone: Tone;
    output: PromptOutput;
    regenerationOf: string | null;
    feedbackTags: string[];
  },
): Promise<Database["public"]["Tables"]["prompts"]["Row"]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prompts")
    .insert({
      user_id: ctx.userId,
      source_video_id: fields.sourceVideoId,
      target_audience: fields.targetAudience,
      tone: fields.tone,
      output: fields.output,
      regeneration_of: fields.regenerationOf,
      feedback_tags: fields.feedbackTags,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`insertPromptRow failed: ${error.message}`);
  }
  return data;
}

// Application-Flow.md §4.3: idle -> analyzing -> generating -> results |
// failed | insufficient_credits. Resolving the video and its transcript
// (analyzing) never spends credits -- only the AI call (generating) does,
// via consume() immediately before it and refund() if it fails.
// D-028: one synchronous call, no background job -- the cosmetic
// progress checklist lives entirely in the UI (Phase 3D).
export async function generatePrompts(
  ctx: RequestContext,
  input: {
    targetAudience: string | null;
    tone: Tone;
  } & ({ videoId: string } | { videoUrl: string }),
  idempotencyKey: string,
): Promise<Result<Prompt, GeneratePromptsError>> {
  const videoResult = await resolveVideoContext(input);
  if (!videoResult.ok) {
    return err(videoResult.error);
  }
  const video = videoResult.value;

  const transcriptText = await getOrFetchTranscript(video);

  const consumeResult = await consume(ctx, GENERATE_COST, "Prompt generation", idempotencyKey);
  if (!consumeResult.ok) {
    return err(consumeResult.error);
  }

  const aiResult = await generatePromptOutput({
    videoTitle: video.title,
    videoDescription: video.description,
    videoTags: video.tags,
    transcriptText,
    targetAudience: input.targetAudience,
    tone: input.tone,
  });

  if (!aiResult.ok) {
    await refund(ctx, GENERATE_COST, "Prompt generation failed", idempotencyKey);
    return err({ type: "generation_failed", message: describeAiError(aiResult.error) });
  }

  const row = await insertPromptRow(ctx, {
    sourceVideoId: video.id,
    targetAudience: input.targetAudience,
    tone: input.tone,
    output: aiResult.value,
    regenerationOf: null,
    feedbackTags: [],
  });

  return ok(toPrompt(row, { id: video.id, title: video.title, thumbnailUrl: video.thumbnailUrl }));
}

async function getOwnPromptRow(
  ctx: RequestContext,
  promptId: string,
): Promise<Database["public"]["Tables"]["prompts"]["Row"] | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("id", promptId)
    .eq("user_id", ctx.userId)
    .maybeSingle();

  if (error) {
    throw new Error(`getOwnPromptRow query failed: ${error.message}`);
  }
  return data;
}

// UI-UX-Flow.md §7.5: always a NEW prompts row (regeneration_of = the
// original), the original stays untouched in the library as a version.
// Reuses the original's source video, target audience, and tone -- only
// the feedback is new. The transcript is reused from cache, never
// re-fetched.
export async function regeneratePrompts(
  ctx: RequestContext,
  promptId: string,
  feedback: { tags: string[]; freeText: string | null },
  idempotencyKey: string,
): Promise<Result<Prompt, RegeneratePromptsError>> {
  const original = await getOwnPromptRow(ctx, promptId);
  if (!original) {
    return err({ type: "not_found" });
  }

  const video = await getVideoRow(original.source_video_id);
  if (!video) {
    return err({ type: "not_found" });
  }

  const transcriptText = await getOrFetchTranscript(video);

  const consumeResult = await consume(ctx, REGENERATE_COST, "Prompt regeneration", idempotencyKey);
  if (!consumeResult.ok) {
    return err(consumeResult.error);
  }

  const aiResult = await generatePromptOutput({
    videoTitle: video.title,
    videoDescription: video.description,
    videoTags: video.tags,
    transcriptText,
    targetAudience: original.target_audience,
    tone: original.tone as Tone,
    feedback,
  });

  if (!aiResult.ok) {
    await refund(ctx, REGENERATE_COST, "Prompt regeneration failed", idempotencyKey);
    return err({ type: "generation_failed", message: describeAiError(aiResult.error) });
  }

  const row = await insertPromptRow(ctx, {
    sourceVideoId: video.id,
    targetAudience: original.target_audience,
    tone: original.tone as Tone,
    output: aiResult.value,
    regenerationOf: original.id,
    feedbackTags: feedback.tags,
  });

  return ok(toPrompt(row, { id: video.id, title: video.title, thumbnailUrl: video.thumbnailUrl }));
}

export async function getPrompt(ctx: RequestContext, promptId: string): Promise<Prompt | null> {
  const row = await getOwnPromptRow(ctx, promptId);
  if (!row) return null;

  const video = await getVideoRow(row.source_video_id);
  return toPrompt(row, {
    id: row.source_video_id,
    title: video?.title ?? "Unknown video",
    thumbnailUrl: video?.thumbnailUrl ?? "",
  });
}

// UI-UX-Flow.md §4.5's dashboard metric card. Same kind/deleted_at
// filtering as listPrompts, count-only.
export async function getPromptCount(ctx: RequestContext): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("prompts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", ctx.userId)
    .eq("kind", "prompt")
    .is("deleted_at", null);

  if (error) {
    throw new Error(`getPromptCount query failed: ${error.message}`);
  }
  return count ?? 0;
}

export async function listPrompts(
  ctx: RequestContext,
  options: { limit?: number; search?: string } = {},
): Promise<PromptSummary[]> {
  const limit = Math.min(Math.max(1, options.limit ?? 20), 100);

  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("user_id", ctx.userId)
    // Phase 2 Task 3: thumbnail-ideas rows share this table (kind =
    // 'thumbnail_ideas') but don't belong in the AI Prompts library.
    .eq("kind", "prompt")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`listPrompts query failed: ${error.message}`);
  }
  if (rows.length === 0) return [];

  const videoIds = [...new Set(rows.map((row) => row.source_video_id))];
  const { data: videos, error: videosError } = await supabase
    .from("videos")
    .select("id, title, thumbnail_url")
    .in("id", videoIds);

  if (videosError) {
    throw new Error(`listPrompts videos query failed: ${videosError.message}`);
  }
  const videoById = new Map(videos.map((video) => [video.id, video]));

  const summaries = rows.map((row) => {
    const video = videoById.get(row.source_video_id);
    return {
      id: row.id,
      sourceVideo: {
        id: row.source_video_id,
        title: video?.title ?? "Unknown video",
        thumbnailUrl: video?.thumbnail_url ?? "",
      },
      createdAt: row.created_at,
    };
  });

  if (!options.search?.trim()) {
    return summaries;
  }
  const needle = options.search.trim().toLowerCase();
  return summaries.filter((summary) => summary.sourceVideo.title.toLowerCase().includes(needle));
}

// UI-UX-Flow.md §7.4 "Edit inline (any prompt is editable)". Session client
// -- prompts' own RLS already scopes UPDATE to the owner's rows.
export async function updatePromptOutput(
  ctx: RequestContext,
  promptId: string,
  output: PromptOutput,
): Promise<Result<void, NotFoundError>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prompts")
    .update({ output })
    .eq("id", promptId)
    .eq("user_id", ctx.userId)
    .select("id");

  if (error) {
    throw new Error(`updatePromptOutput update failed: ${error.message}`);
  }
  if (data.length === 0) {
    return err({ type: "not_found" });
  }
  return ok(undefined);
}

export async function deletePrompt(
  ctx: RequestContext,
  promptId: string,
): Promise<Result<void, NotFoundError>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prompts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", promptId)
    .eq("user_id", ctx.userId)
    .select("id");

  if (error) {
    throw new Error(`deletePrompt update failed: ${error.message}`);
  }
  if (data.length === 0) {
    return err({ type: "not_found" });
  }
  return ok(undefined);
}
