import { z } from "zod";

import { CLASSIFY_MODEL, generateStructuredOutput } from "@/lib/ai/client";
import {
  CLASSIFY_STALE_DAYS,
  DAY_MS,
  MAX_NICHES_PER_CHANNEL,
  SECONDARY_NICHE_MIN_CONFIDENCE,
  RESERVED_NICHE_SLUGS,
} from "@/lib/discovery/config";
import { addExpansionSeeds } from "@/lib/services/discovery/seeds";
import { createServiceClient } from "@/lib/supabase/service";

// Niche-Discovery-Engine.md §6 classify-run. D-080: gpt-4o-mini (D-074)
// picks up to MAX_NICHES_PER_CHANNEL niches for each channel from the
// curated taxonomy (the niches table), or none -- "unclassified". It never
// creates a niche; it may suggest a missing one for super-admin review
// (niche_suggestions, /admin/discovery).

const TITLES_PER_CHANNEL = 10;
const DESCRIPTION_CHARS = 400;

export const ChannelClassificationSchema = z.object({
  channels: z.array(
    z.object({
      channelId: z.string(),
      // Slugs from the list, best fit first. Empty = unclassified.
      niches: z.array(z.object({ slug: z.string(), confidence: z.number() })),
      isFaceless: z.boolean(),
      language: z.string().nullable(),
      // A niche the list is missing, for review. Null when the list fits.
      suggestion: z.object({ name: z.string(), description: z.string() }).nullable(),
      relatedKeywords: z.array(z.string()),
    }),
  ),
});
export type ChannelClassification = z.infer<typeof ChannelClassificationSchema>["channels"][number];

export interface TaxonomyNiche {
  id: string;
  slug: string;
  name: string;
  description: string | null;
}

export function buildSystemPrompt(taxonomy: TaxonomyNiche[]): string {
  const list = taxonomy
    .map((niche) => `${niche.slug} | ${niche.name} | ${niche.description ?? ""}`)
    .join("\n");
  return `You classify YouTube channels into content niches for a niche research tool.
Use ONLY these niches (slug | name | description):
${list}

For each channel return:
- niches: up to ${MAX_NICHES_PER_CHANNEL} slugs from the list above that the channel clearly belongs to, best fit first, each with a 0-1 confidence. Judge the topic only: language and format (Shorts or long videos) never decide the niche. Return an empty array when no niche on the list fits.
- isFaceless: true if the creator does not appear on camera (voiceover, stock footage, animation, slideshows, ambient/music, screen recordings).
- language: ISO 639-1 code of the content language, or null if unclear.
- suggestion: only when the channel's topic is clearly missing from the list, a new niche a creator could start a channel in: a 1-4 word Title Case name without language or format words, and a one-sentence description. Otherwise null.
- relatedKeywords: up to 3 YouTube search keywords for adjacent faceless niches worth exploring.
Return every input channel exactly once, using its channelId.`;
}

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

export async function loadTaxonomy(): Promise<TaxonomyNiche[]> {
  const { data, error } = await createServiceClient()
    .from("niches")
    .select("id, slug, name, description")
    .order("slug");
  if (error) throw new Error(`loadTaxonomy failed: ${error.message}`);
  return data;
}

// The model's picks, kept only if they're on the list: the first is the
// primary; extras need SECONDARY_NICHE_MIN_CONFIDENCE.
export function pickNiches(
  picks: ChannelClassification["niches"],
  idBySlug: Map<string, string>,
): { nicheId: string; confidence: number }[] {
  const picked: { nicheId: string; confidence: number }[] = [];
  for (const pick of picks) {
    if (picked.length >= MAX_NICHES_PER_CHANNEL) break;
    const nicheId = idBySlug.get(pick.slug.trim().toLowerCase());
    if (!nicheId || picked.some((p) => p.nicheId === nicheId)) continue;
    const confidence = clampConfidence(pick.confidence);
    if (picked.length > 0 && confidence < SECONDARY_NICHE_MIN_CONFIDENCE) continue;
    picked.push({ nicheId, confidence });
  }
  return picked;
}

// Replaces the channel's niche tags: the first pick is the primary.
async function writeChannelNiches(
  channelId: string,
  picks: { nicheId: string; confidence: number }[],
): Promise<void> {
  const supabase = createServiceClient();
  const { error: clearError } = await supabase
    .from("channel_niches")
    .delete()
    .eq("channel_id", channelId);
  if (clearError) throw new Error(`writeChannelNiches clear failed: ${clearError.message}`);
  if (picks.length === 0) return;
  const { error } = await supabase.from("channel_niches").insert(
    picks.map((pick, index) => ({
      channel_id: channelId,
      niche_id: pick.nicheId,
      confidence: pick.confidence,
      is_primary: index === 0,
    })),
  );
  if (error) throw new Error(`writeChannelNiches insert failed: ${error.message}`);
}

async function suggestNiche(
  suggestion: NonNullable<ChannelClassification["suggestion"]>,
  channelId: string,
  idBySlug: Map<string, string>,
): Promise<boolean> {
  const name = suggestion.name.trim();
  const slug = slugify(name);
  if (!name || slug === "niche" || idBySlug.has(slug)) return false;
  const { error } = await createServiceClient().rpc("suggest_niche", {
    p_slug: slug,
    p_name: name,
    p_description: suggestion.description.trim(),
    p_channel_id: channelId,
  });
  if (error) throw new Error(`suggestNiche failed: ${error.message}`);
  return true;
}

export interface ClassifyResult {
  classified: number;
  unclassified: number;
  suggestions: number;
  failed: boolean;
  expansionSeeds: number;
}

export async function classifyBatch(
  channels: ChannelToClassify[],
  now: Date = new Date(),
): Promise<ClassifyResult> {
  const result: ClassifyResult = {
    classified: 0,
    unclassified: 0,
    suggestions: 0,
    failed: false,
    expansionSeeds: 0,
  };
  if (channels.length === 0) return result;

  const taxonomy = await loadTaxonomy();
  const idBySlug = new Map(taxonomy.map((niche) => [niche.slug, niche.id]));

  const output = await generateStructuredOutput(
    buildSystemPrompt(taxonomy),
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
    return { ...result, failed: true };
  }

  const supabase = createServiceClient();
  const known = new Map(channels.map((channel) => [channel.id, channel]));
  const related: string[] = [];

  for (const item of output.value.channels) {
    const channel = known.get(item.channelId);
    if (!channel) continue; // Hallucinated id.
    known.delete(item.channelId);

    const picks = pickNiches(item.niches, idBySlug);
    const primary = picks[0] ?? null;

    // classified_at is set either way, so an unclassified channel waits for
    // the stale window (or an approved suggestion) instead of every run.
    const { error } = await supabase
      .from("channels")
      .update({
        niche_id: primary?.nicheId ?? null,
        is_faceless: item.isFaceless,
        classification_confidence: primary?.confidence ?? null,
        classified_at: now.toISOString(),
        // Never overwrite a language YouTube itself reported.
        ...(channel.language === null && item.language ? { language: item.language } : {}),
      })
      .eq("id", channel.id);
    if (error) throw new Error(`classifyBatch update failed: ${error.message}`);

    const { error: feedError } = await supabase
      .from("outliers_feed")
      .update({ niche_id: primary?.nicheId ?? null })
      .eq("channel_id", channel.id);
    if (feedError) throw new Error(`classifyBatch feed update failed: ${feedError.message}`);

    await writeChannelNiches(channel.id, picks);

    if (item.suggestion && (await suggestNiche(item.suggestion, channel.id, idBySlug))) {
      result.suggestions += 1;
    }
    related.push(...item.relatedKeywords.slice(0, 3));
    if (primary) result.classified += 1;
    else result.unclassified += 1;
  }

  result.expansionSeeds = related.length > 0 ? await addExpansionSeeds(related, now) : 0;
  return result;
}
