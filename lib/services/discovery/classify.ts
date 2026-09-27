import { z } from "zod";

import { CLASSIFY_MODEL, createEmbedding, generateStructuredOutput } from "@/lib/ai/client";
import {
  CLASSIFY_STALE_DAYS,
  DAY_MS,
  MAX_NICHES_PER_CHANNEL,
  NICHE_MATCH_MIN_SIMILARITY,
  SECONDARY_NICHE_MIN_CONFIDENCE,
  RESERVED_NICHE_SLUGS,
} from "@/lib/discovery/config";
import { addExpansionSeeds } from "@/lib/services/discovery/seeds";
import { createServiceClient } from "@/lib/supabase/service";

// Niche-Discovery-Engine.md §6 classify-run (D-074). gpt-4o-mini labels a
// batch of channels from their name, description and recent titles; each
// label is embedded and joined to the nearest existing niche (cosine >=
// 0.85) or becomes a new one.

const TITLES_PER_CHANNEL = 10;
const DESCRIPTION_CHARS = 400;

export const ChannelClassificationSchema = z.object({
  channels: z.array(
    z.object({
      channelId: z.string(),
      niche: z.string(),
      nicheDescription: z.string(),
      isFaceless: z.boolean(),
      language: z.string().nullable(),
      confidence: z.number(),
      // D-077: other niches the channel clearly also fits (tags/filtering).
      secondaryNiches: z.array(
        z.object({ niche: z.string(), nicheDescription: z.string(), confidence: z.number() }),
      ),
      relatedKeywords: z.array(z.string()),
    }),
  ),
});
export type ChannelClassification = z.infer<typeof ChannelClassificationSchema>["channels"][number];

const SYSTEM_PROMPT = `You classify YouTube channels into content niches for a niche research tool.
For each channel return:
- niche: a specific, reusable niche name of 2-4 words in Title Case (e.g. "Mafia History", "Stoic Philosophy", "Rain Sleep Sounds"). Be specific enough to be useful, general enough that similar channels share it. Never use the channel's own name.
- nicheDescription: one short sentence describing the niche (not the channel).
- isFaceless: true if the creator does not appear on camera (voiceover, stock footage, animation, slideshows, ambient/music, screen recordings).
- language: ISO 639-1 code of the content language, or null if unclear.
- confidence: 0 to 1, how sure you are about the niche.
- secondaryNiches: up to ${MAX_NICHES_PER_CHANNEL - 1} OTHER niches the channel clearly also belongs to (same naming rules, each with its own description and 0-1 confidence). Use an empty array when the channel fits one niche.
- relatedKeywords: up to 3 YouTube search keywords for adjacent faceless niches worth exploring.
Return every input channel exactly once, using its channelId.`;

export interface ChannelToClassify {
  id: string;
  name: string;
  description: string | null;
  language: string | null;
  titles: string[];
}

export function buildClassificationPrompt(channels: ChannelToClassify[]): string {
  return JSON.stringify(
    channels.map((channel) => ({
      channelId: channel.id,
      name: channel.name,
      description: (channel.description ?? "").slice(0, DESCRIPTION_CHARS),
      recentTitles: channel.titles,
    })),
  );
}

export function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  if (!slug) return "niche";
  return (RESERVED_NICHE_SLUGS as readonly string[]).includes(slug) ? `${slug}-niche` : slug;
}

function clampConfidence(value: number): number {
  return Math.max(0, Math.min(1, value));
}

// Unclassified first, then those whose label is older than the stale
// window. Only enriched channels: the titles are the main signal.
export async function listChannelsToClassify(
  limit: number,
  now: Date = new Date(),
): Promise<ChannelToClassify[]> {
  const supabase = createServiceClient();
  const staleBefore = new Date(now.getTime() - CLASSIFY_STALE_DAYS * DAY_MS).toISOString();
  const { data, error } = await supabase
    .from("channels")
    .select("id, name, description, language")
    .not("enriched_at", "is", null)
    .is("unavailable_since", null)
    .or(`classified_at.is.null,classified_at.lt.${staleBefore}`)
    .order("classified_at", { ascending: true, nullsFirst: true })
    .limit(limit);
  if (error) throw new Error(`listChannelsToClassify failed: ${error.message}`);
  if (data.length === 0) return [];

  const { data: videos, error: videosError } = await supabase
    .from("videos")
    .select("channel_id, title, published_at")
    .in(
      "channel_id",
      data.map((row) => row.id),
    )
    .order("published_at", { ascending: false })
    .limit(data.length * 30);
  if (videosError) throw new Error(`listChannelsToClassify videos failed: ${videosError.message}`);

  const titles = new Map<string, string[]>();
  for (const video of videos) {
    const list = titles.get(video.channel_id) ?? [];
    if (list.length < TITLES_PER_CHANNEL) list.push(video.title);
    titles.set(video.channel_id, list);
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    language: row.language,
    titles: titles.get(row.id) ?? [],
  }));
}

function vectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

// Returns the niche id for an AI label: exact slug hit first (free), then
// nearest embedding, else a new niche. `cache` dedupes within one batch.
export async function resolveNiche(
  name: string,
  description: string,
  cache: Map<string, string>,
): Promise<string | null> {
  const slug = slugify(name);
  const cached = cache.get(slug);
  if (cached) return cached;

  const supabase = createServiceClient();
  const existing = await supabase.from("niches").select("id").eq("slug", slug).maybeSingle();
  if (existing.error) throw new Error(`resolveNiche lookup failed: ${existing.error.message}`);
  if (existing.data) {
    cache.set(slug, existing.data.id);
    return existing.data.id;
  }

  const embedding = await createEmbedding(`${name}: ${description}`);
  if (!embedding.ok) {
    console.error("resolveNiche embedding failed", name, embedding.error);
    return null;
  }
  const literal = vectorLiteral(embedding.value);

  const match = await supabase.rpc("match_niche", {
    p_embedding: literal,
    p_min_similarity: NICHE_MATCH_MIN_SIMILARITY,
  });
  if (match.error) throw new Error(`resolveNiche match failed: ${match.error.message}`);
  const nearest = match.data[0];
  if (nearest) {
    cache.set(slug, nearest.niche_id);
    return nearest.niche_id;
  }

  // Upsert on slug (ignoring duplicates) so two concurrent batches that
  // invent the same niche converge on one row without clobbering it.
  const created = await supabase
    .from("niches")
    .upsert(
      { slug, name: name.trim(), description: description.trim(), embedding: literal },
      { onConflict: "slug", ignoreDuplicates: true },
    )
    .select("id")
    .maybeSingle();
  if (created.error) throw new Error(`resolveNiche create failed: ${created.error.message}`);
  if (created.data) {
    cache.set(slug, created.data.id);
    return created.data.id;
  }
  const raced = await supabase.from("niches").select("id").eq("slug", slug).single();
  if (raced.error) throw new Error(`resolveNiche reread failed: ${raced.error.message}`);
  cache.set(slug, raced.data.id);
  return raced.data.id;
}

// D-077: extra niches the model is confident about, resolved like the
// primary, deduped, capped at MAX_NICHES_PER_CHANNEL - 1.
async function resolveSecondaryNiches(
  secondary: ChannelClassification["secondaryNiches"],
  primaryId: string,
  cache: Map<string, string>,
): Promise<{ nicheId: string; confidence: number }[]> {
  const picked: { nicheId: string; confidence: number }[] = [];
  for (const extra of secondary) {
    if (picked.length >= MAX_NICHES_PER_CHANNEL - 1) break;
    const confidence = clampConfidence(extra.confidence);
    if (confidence < SECONDARY_NICHE_MIN_CONFIDENCE) continue;
    const nicheId = await resolveNiche(extra.niche, extra.nicheDescription, cache);
    if (!nicheId || nicheId === primaryId || picked.some((p) => p.nicheId === nicheId)) continue;
    picked.push({ nicheId, confidence });
  }
  return picked;
}

// Replaces the channel's niche tags: one primary plus the extras.
async function writeChannelNiches(
  channelId: string,
  primary: { nicheId: string; confidence: number },
  extras: { nicheId: string; confidence: number }[],
): Promise<void> {
  const supabase = createServiceClient();
  const { error: clearError } = await supabase
    .from("channel_niches")
    .delete()
    .eq("channel_id", channelId);
  if (clearError) throw new Error(`writeChannelNiches clear failed: ${clearError.message}`);
  const { error } = await supabase.from("channel_niches").insert([
    {
      channel_id: channelId,
      niche_id: primary.nicheId,
      confidence: primary.confidence,
      is_primary: true,
    },
    ...extras.map((extra) => ({
      channel_id: channelId,
      niche_id: extra.nicheId,
      confidence: extra.confidence,
      is_primary: false,
    })),
  ]);
  if (error) throw new Error(`writeChannelNiches insert failed: ${error.message}`);
}

export interface ClassifyResult {
  classified: number;
  failed: boolean;
  expansionSeeds: number;
}

export async function classifyBatch(
  channels: ChannelToClassify[],
  nicheCache: Map<string, string> = new Map(),
  now: Date = new Date(),
): Promise<ClassifyResult> {
  if (channels.length === 0) return { classified: 0, failed: false, expansionSeeds: 0 };

  const output = await generateStructuredOutput(
    SYSTEM_PROMPT,
    buildClassificationPrompt(channels),
    ChannelClassificationSchema,
    "channel_classification",
    { model: CLASSIFY_MODEL },
  );
  if (!output.ok) {
    // Transient AI errors are retried by the job runner; a bad response
    // just leaves these channels unclassified for the next run.
    if (output.error.type === "rate_limited" || output.error.type === "overloaded") {
      throw new Error(`classifyBatch AI unavailable: ${output.error.type}`);
    }
    console.error("classifyBatch AI failed", output.error);
    return { classified: 0, failed: true, expansionSeeds: 0 };
  }

  const supabase = createServiceClient();
  const known = new Map(channels.map((channel) => [channel.id, channel]));
  const related: string[] = [];
  let classified = 0;

  for (const item of output.value.channels) {
    const channel = known.get(item.channelId);
    if (!channel) continue; // Hallucinated id.
    known.delete(item.channelId);

    const nicheId = await resolveNiche(item.niche, item.nicheDescription, nicheCache);
    if (!nicheId) continue;

    const { error } = await supabase
      .from("channels")
      .update({
        niche_id: nicheId,
        is_faceless: item.isFaceless,
        classification_confidence: clampConfidence(item.confidence),
        classified_at: now.toISOString(),
        // Never overwrite a language YouTube itself reported.
        ...(channel.language === null && item.language ? { language: item.language } : {}),
      })
      .eq("id", channel.id);
    if (error) throw new Error(`classifyBatch update failed: ${error.message}`);

    const { error: feedError } = await supabase
      .from("outliers_feed")
      .update({ niche_id: nicheId })
      .eq("channel_id", channel.id);
    if (feedError) throw new Error(`classifyBatch feed update failed: ${feedError.message}`);

    await writeChannelNiches(
      channel.id,
      { nicheId, confidence: clampConfidence(item.confidence) },
      await resolveSecondaryNiches(item.secondaryNiches, nicheId, nicheCache),
    );

    related.push(...item.relatedKeywords.slice(0, 3));
    classified += 1;
  }

  const expansionSeeds = related.length > 0 ? await addExpansionSeeds(related, now) : 0;
  return { classified, failed: false, expansionSeeds };
}
