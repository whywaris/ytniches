import {
  DAY_MS,
  DISCOVERY_PREFILTER_MIN_LIFETIME_AVG_VIEWS,
  DISCOVERY_PUBLISHED_WITHIN_DAYS,
  type SearchVariant,
} from "@/lib/discovery/config";
import { upsertChannels } from "@/lib/services/channels";
import type { DiscoverySeed } from "@/lib/services/discovery/seeds";
import { createServiceClient } from "@/lib/supabase/service";
import {
  budgetStopOrThrow,
  inStep,
  isBudgetStop,
  runDirect,
  type StepRunner,
} from "@/lib/discovery/steps";
import { BATCH_SIZE } from "@/lib/youtube/client";
import { discoverChannelIdsForKeyword, fetchChannelsFresh } from "@/lib/youtube/discovery";
import type { YouTubeChannelItem } from "@/lib/youtube/schemas";

// Niche-Discovery-Engine.md §6 discovery-run: seed keyword -> recent
// breakout videos -> their channels. Only channels we don't already have
// are fetched and stored; qualification (§6.2) needs recent-video averages,
// so it happens at first enrichment, with a cheap lifetime-average
// pre-filter here so obvious misses never reach the table.

export interface SeedSearchOutcome {
  seedId: string;
  channelIds: string[];
}

export interface DiscoverSeedsResult {
  searched: SeedSearchOutcome[];
  stoppedForBudget: boolean;
}

// One search per seed, in order, until the job budget runs out. Seeds are
// not marked run here: the caller marks them only once what they found is
// stored (D-078), so a failed ingest retries them instead of losing paid
// searches. A seed that finds nothing is still marked, so a dead keyword
// rotates to the back.
export async function searchSeeds(
  seeds: DiscoverySeed[],
  now: Date = new Date(),
  variant: SearchVariant = {},
): Promise<DiscoverSeedsResult> {
  const publishedAfter = new Date(
    now.getTime() - DISCOVERY_PUBLISHED_WITHIN_DAYS * DAY_MS,
  ).toISOString();
  const searched: SeedSearchOutcome[] = [];

  for (const seed of seeds) {
    const result = await discoverChannelIdsForKeyword(seed.keyword, publishedAfter, variant);
    if (!result.ok) {
      if (isBudgetStop(result.error)) return { searched, stoppedForBudget: true };
      // A bad response for one keyword shouldn't sink the whole run.
      console.error("discovery search failed", seed.keyword, result.error);
      continue;
    }
    searched.push({ seedId: seed.id, channelIds: result.value });
  }

  return { searched, stoppedForBudget: false };
}

export function passesPrefilter(channel: YouTubeChannelItem): boolean {
  const { viewCount, videoCount } = channel.statistics;
  if (videoCount <= 0) return false;
  return viewCount / videoCount >= DISCOVERY_PREFILTER_MIN_LIFETIME_AVG_VIEWS;
}

// PostgREST puts .in() lists in the URL; a whole run's candidates (1,000+
// 24-char IDs) make it too long and come back as "Bad Request".
const EXISTING_LOOKUP_CHUNK = 100;

async function existingYoutubeIds(youtubeChannelIds: string[]): Promise<Set<string>> {
  const existing = new Set<string>();
  const supabase = createServiceClient();
  for (let i = 0; i < youtubeChannelIds.length; i += EXISTING_LOOKUP_CHUNK) {
    const { data, error } = await supabase
      .from("channels")
      .select("youtube_channel_id")
      .in("youtube_channel_id", youtubeChannelIds.slice(i, i + EXISTING_LOOKUP_CHUNK));
    if (error) throw new Error(`existingYoutubeIds failed: ${error.message}`);
    for (const row of data) existing.add(row.youtube_channel_id);
  }
  return existing;
}

export interface IngestResult {
  /** Internal channels.id of newly stored channels, ready for enrichment. */
  newChannelIds: string[];
  skippedExisting: number;
  rejectedByPrefilter: number;
  stoppedForBudget: boolean;
}

// D-078: the existence check, each channels.list call (50 IDs) and the
// store are separate steps, so a retry never re-pays a lookup.
export async function ingestDiscoveredChannels(
  searched: SeedSearchOutcome[],
  now: Date = new Date(),
  run: StepRunner = runDirect,
): Promise<IngestResult> {
  // First seed to surface a channel gets the credit for it.
  const seedByYoutubeId = new Map<string, string>();
  for (const outcome of searched) {
    for (const id of outcome.channelIds) {
      if (!seedByYoutubeId.has(id)) seedByYoutubeId.set(id, outcome.seedId);
    }
  }

  const candidates = [...seedByYoutubeId.keys()];
  const existing = new Set(
    await inStep(run, "ingest-existing", async () => [...(await existingYoutubeIds(candidates))]),
  );
  const fresh = candidates.filter((id) => !existing.has(id));
  const empty = {
    newChannelIds: [],
    skippedExisting: existing.size,
    rejectedByPrefilter: 0,
  };
  if (fresh.length === 0) return { ...empty, stoppedForBudget: false };

  const fetched: YouTubeChannelItem[] = [];
  for (let i = 0; i < fresh.length; i += BATCH_SIZE) {
    const chunk = fresh.slice(i, i + BATCH_SIZE);
    const result = await inStep(run, `ingest-fetch-${i / BATCH_SIZE}`, async () =>
      budgetStopOrThrow(await fetchChannelsFresh(chunk), "ingestDiscoveredChannels fetch"),
    );
    // Nothing is stored, so the seeds stay due and retry next run.
    if (!result.ok) return { ...empty, stoppedForBudget: true };
    fetched.push(...result.value);
  }

  return inStep(run, "ingest-store", () =>
    storeDiscoveredChannels(fetched, seedByYoutubeId, existing.size, now),
  );
}

async function storeDiscoveredChannels(
  fetched: YouTubeChannelItem[],
  seedByYoutubeId: Map<string, string>,
  skippedExisting: number,
  now: Date,
): Promise<IngestResult> {
  const kept = fetched.filter(passesPrefilter);
  const idByYoutubeId = await upsertChannels(kept);

  // Provenance, grouped per seed so it's one update per seed, not per row.
  // `discovered_at is null` keeps the first discovery time on a re-run.
  const bySeed = new Map<string, string[]>();
  for (const channel of kept) {
    const seedId = seedByYoutubeId.get(channel.id);
    const internalId = idByYoutubeId.get(channel.id);
    if (!seedId || !internalId) continue;
    bySeed.set(seedId, [...(bySeed.get(seedId) ?? []), internalId]);
  }
  const supabase = createServiceClient();
  for (const [seedId, ids] of bySeed) {
    const { error } = await supabase
      .from("channels")
      .update({ discovered_at: now.toISOString(), discovered_via_seed: seedId })
      .in("id", ids)
      .is("discovered_at", null);
    if (error) throw new Error(`ingestDiscoveredChannels provenance failed: ${error.message}`);
  }

  return {
    newChannelIds: [...idByYoutubeId.values()],
    skippedExisting,
    rejectedByPrefilter: fetched.length - kept.length,
    stoppedForBudget: false,
  };
}
