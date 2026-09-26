import {
  DAY_MS,
  DISCOVERY_PREFILTER_MIN_LIFETIME_AVG_VIEWS,
  DISCOVERY_PUBLISHED_WITHIN_DAYS,
} from "@/lib/discovery/config";
import { upsertChannels } from "@/lib/services/channels";
import { markSeedRun, type DiscoverySeed } from "@/lib/services/discovery/seeds";
import { createServiceClient } from "@/lib/supabase/service";
import {
  discoverChannelIdsForKeyword,
  fetchChannelsFresh,
  type DiscoveryYouTubeError,
} from "@/lib/youtube/discovery";
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

function isBudgetStop(error: DiscoveryYouTubeError): boolean {
  return error.type === "budget_exhausted" || error.type === "quota_exceeded";
}

// One search per seed, in order, until the job budget runs out. A seed is
// marked run even when it finds nothing, so a dead keyword rotates to the
// back instead of being retried every night.
export async function searchSeeds(
  seeds: DiscoverySeed[],
  now: Date = new Date(),
): Promise<DiscoverSeedsResult> {
  const publishedAfter = new Date(
    now.getTime() - DISCOVERY_PUBLISHED_WITHIN_DAYS * DAY_MS,
  ).toISOString();
  const searched: SeedSearchOutcome[] = [];

  for (const seed of seeds) {
    const result = await discoverChannelIdsForKeyword(seed.keyword, publishedAfter);
    if (!result.ok) {
      if (isBudgetStop(result.error)) return { searched, stoppedForBudget: true };
      // A bad response for one keyword shouldn't sink the whole run.
      console.error("discovery search failed", seed.keyword, result.error);
      continue;
    }
    await markSeedRun(seed.id, now);
    searched.push({ seedId: seed.id, channelIds: result.value });
  }

  return { searched, stoppedForBudget: false };
}

export function passesPrefilter(channel: YouTubeChannelItem): boolean {
  const { viewCount, videoCount } = channel.statistics;
  if (videoCount <= 0) return false;
  return viewCount / videoCount >= DISCOVERY_PREFILTER_MIN_LIFETIME_AVG_VIEWS;
}

async function existingYoutubeIds(youtubeChannelIds: string[]): Promise<Set<string>> {
  if (youtubeChannelIds.length === 0) return new Set();
  const { data, error } = await createServiceClient()
    .from("channels")
    .select("youtube_channel_id")
    .in("youtube_channel_id", youtubeChannelIds);
  if (error) throw new Error(`existingYoutubeIds failed: ${error.message}`);
  return new Set(data.map((row) => row.youtube_channel_id));
}

export interface IngestResult {
  /** Internal channels.id of newly stored channels, ready for enrichment. */
  newChannelIds: string[];
  skippedExisting: number;
  rejectedByPrefilter: number;
  stoppedForBudget: boolean;
}

export async function ingestDiscoveredChannels(
  searched: SeedSearchOutcome[],
  now: Date = new Date(),
): Promise<IngestResult> {
  // First seed to surface a channel gets the credit for it.
  const seedByYoutubeId = new Map<string, string>();
  for (const outcome of searched) {
    for (const id of outcome.channelIds) {
      if (!seedByYoutubeId.has(id)) seedByYoutubeId.set(id, outcome.seedId);
    }
  }

  const candidates = [...seedByYoutubeId.keys()];
  const existing = await existingYoutubeIds(candidates);
  const fresh = candidates.filter((id) => !existing.has(id));
  const empty = {
    newChannelIds: [],
    skippedExisting: existing.size,
    rejectedByPrefilter: 0,
  };
  if (fresh.length === 0) return { ...empty, stoppedForBudget: false };

  const fetched = await fetchChannelsFresh(fresh);
  if (!fetched.ok) {
    if (isBudgetStop(fetched.error)) return { ...empty, stoppedForBudget: true };
    throw new Error(`ingestDiscoveredChannels fetch failed: ${fetched.error.type}`);
  }

  const kept = fetched.value.filter(passesPrefilter);
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
    skippedExisting: existing.size,
    rejectedByPrefilter: fetched.value.length - kept.length,
    stoppedForBudget: false,
  };
}
