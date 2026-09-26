import { z } from "zod";

import {
  CLASSIFY_BATCH_SIZE,
  CLASSIFY_BATCHES_PER_RUN,
  ENRICHMENT_BATCH_SIZE,
  ENRICHMENT_BATCHES_PER_TICK,
  SEEDS_PER_RUN,
  SNAPSHOT_DAILY_RETENTION_DAYS,
  STALE_DATA_DAYS,
  TIER_INTERVAL_DAYS,
  VIDEOS_KEPT_PER_CHANNEL,
} from "@/lib/discovery/config";
import { ENRICH_EVENT, MANUAL_EVENTS } from "@/lib/discovery/events";
import { inngest } from "@/lib/inngest/client";
import { classifyBatch, listChannelsToClassify } from "@/lib/services/discovery/classify";
import { enrichChannels, type EnrichResult } from "@/lib/services/discovery/enrich";
import {
  ingestDiscoveredChannels,
  searchSeeds,
  type SeedSearchOutcome,
} from "@/lib/services/discovery/ingest";
import { pickDueSeeds, type DiscoverySeed } from "@/lib/services/discovery/seeds";
import {
  notifyNicheTrackers,
  type NicheNotifyResult,
} from "@/lib/services/discovery/niche-notifications";
import { snapshotNiches, type SnapshotResult } from "@/lib/services/discovery/snapshot";
import { createServiceClient } from "@/lib/supabase/service";
import { hasJobBudget, withQuotaSource } from "@/lib/youtube/quota";

// Niche-Discovery-Engine.md §6 (D-069). Same shape as workers/cron.ts: a
// testable core per job taking a duck-typed `step`, wrapped by a thin
// Inngest function. Every job has concurrency 1 and also answers a manual
// "*.requested" event so /admin/discovery can trigger it (TRD.md §4.4).

export interface JobStep {
  // `unknown` for the same Jsonify-variance reason as workers/cron.ts.
  run: (id: string, fn: () => Promise<unknown>) => Promise<unknown>;
  sendEvent: (
    id: string,
    events: { name: string; data: Record<string, unknown> }[],
  ) => Promise<unknown>;
}

function chunk<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) batches.push(items.slice(i, i + size));
  return batches;
}

function enrichEvents(channelIds: string[], batchKeyPrefix: string) {
  return chunk(channelIds, ENRICHMENT_BATCH_SIZE).map((ids, index) => ({
    name: ENRICH_EVENT,
    data: { channelIds: ids, batchKey: `${batchKeyPrefix}:${index}` },
  }));
}

// --- enrichment -------------------------------------------------------------

// Rough cost of one batch: channels.list + one playlistItems per channel +
// videos.list per 50 videos. Used only to decide whether to dispatch at all.
const ENRICH_BATCH_COST_ESTIMATE =
  1 + ENRICHMENT_BATCH_SIZE + Math.ceil((ENRICHMENT_BATCH_SIZE * VIDEOS_KEPT_PER_CHANNEL) / 50);

async function findDueEnrichment(limit: number): Promise<string[]> {
  const { data, error } = await createServiceClient().rpc("find_due_enrichment_channel_ids", {
    p_limit: limit,
    p_hot_days: TIER_INTERVAL_DAYS.hot,
    p_warm_days: TIER_INTERVAL_DAYS.warm,
    p_cold_days: TIER_INTERVAL_DAYS.cold,
  });
  if (error) throw new Error(`find_due_enrichment_channel_ids failed: ${error.message}`);
  return data.map((row) => row.channel_id);
}

export async function dispatchEnrichment(
  step: JobStep,
  now: Date = new Date(),
): Promise<{ dispatched: number; skippedForBudget: boolean }> {
  const affordable = (await step.run("check-budget", () =>
    hasJobBudget(ENRICH_BATCH_COST_ESTIMATE),
  )) as boolean;
  if (!affordable) return { dispatched: 0, skippedForBudget: true };

  const ids = (await step.run("find-due-channels", () =>
    findDueEnrichment(ENRICHMENT_BATCH_SIZE * ENRICHMENT_BATCHES_PER_TICK),
  )) as string[];
  if (ids.length > 0) {
    await step.sendEvent("dispatch-enrichment", enrichEvents(ids, `tick:${now.toISOString()}`));
  }
  return { dispatched: ids.length, skippedForBudget: false };
}

export const EnrichRequestedSchema = z.object({
  channelIds: z.array(z.string().uuid()).min(1).max(ENRICHMENT_BATCH_SIZE),
  batchKey: z.string(),
});

export async function runEnrichmentBatch(step: JobStep, data: unknown): Promise<EnrichResult> {
  const { channelIds } = EnrichRequestedSchema.parse(data);
  return (await step.run("enrich", () =>
    withQuotaSource("enrichment", () => enrichChannels(channelIds)),
  )) as EnrichResult;
}

// --- discovery --------------------------------------------------------------

export interface DiscoveryRunResult {
  seedsSearched: number;
  newChannels: number;
  stoppedForBudget: boolean;
}

// One step per seed, so an Inngest retry never re-pays a search that
// already succeeded (each step's output is memoised).
export async function runDiscovery(
  step: JobStep,
  now: Date = new Date(),
): Promise<DiscoveryRunResult> {
  const seeds = (await step.run("pick-seeds", () =>
    pickDueSeeds(SEEDS_PER_RUN),
  )) as DiscoverySeed[];

  const searched: SeedSearchOutcome[] = [];
  let stoppedForBudget = false;
  for (const seed of seeds) {
    const outcome = (await step.run(`search-${seed.id}`, () =>
      withQuotaSource("discovery", () => searchSeeds([seed], now)),
    )) as Awaited<ReturnType<typeof searchSeeds>>;
    searched.push(...outcome.searched);
    if (outcome.stoppedForBudget) {
      stoppedForBudget = true;
      break;
    }
  }

  const ingest = (await step.run("ingest-channels", () =>
    withQuotaSource("discovery", () => ingestDiscoveredChannels(searched, now)),
  )) as Awaited<ReturnType<typeof ingestDiscoveredChannels>>;

  if (ingest.newChannelIds.length > 0) {
    await step.sendEvent(
      "enrich-new-channels",
      enrichEvents(ingest.newChannelIds, `discovery:${now.toISOString().slice(0, 10)}`),
    );
  }

  return {
    seedsSearched: searched.length,
    newChannels: ingest.newChannelIds.length,
    stoppedForBudget: stoppedForBudget || ingest.stoppedForBudget,
  };
}

// --- classify ---------------------------------------------------------------

export async function runClassify(step: JobStep): Promise<{ classified: number; batches: number }> {
  let classified = 0;
  let batches = 0;
  for (let i = 0; i < CLASSIFY_BATCHES_PER_RUN; i += 1) {
    const result = (await step.run(`classify-${i}`, async () => {
      const channels = await listChannelsToClassify(CLASSIFY_BATCH_SIZE);
      if (channels.length === 0) return null;
      return classifyBatch(channels);
    })) as Awaited<ReturnType<typeof classifyBatch>> | null;
    if (result === null) break;
    batches += 1;
    classified += result.classified;
    // A batch the model couldn't parse would be picked again immediately;
    // stop rather than loop on it (it retries tomorrow).
    if (result.failed || result.classified === 0) break;
  }
  return { classified, batches };
}

// --- snapshot + purge -------------------------------------------------------

export async function runSnapshot(
  step: JobStep,
): Promise<SnapshotResult & { notified: NicheNotifyResult }> {
  const snapshot = (await step.run("snapshot-niches", () => snapshotNiches())) as SnapshotResult;
  // Separate step: a notification hiccup retries without recomputing scores.
  const notified = (await step.run("notify-niche-trackers", () =>
    notifyNicheTrackers(snapshot.changes),
  )) as NicheNotifyResult;
  return { ...snapshot, notified };
}

export async function runPurge(step: JobStep): Promise<unknown> {
  return step.run("purge-stale-youtube-data", async () => {
    const { data, error } = await createServiceClient().rpc("purge_stale_youtube_data", {
      p_stale_days: STALE_DATA_DAYS,
      p_keep_videos: VIDEOS_KEPT_PER_CHANNEL,
      p_snapshot_days: SNAPSHOT_DAILY_RETENTION_DAYS,
    });
    if (error) throw new Error(`purge_stale_youtube_data failed: ${error.message}`);
    return data;
  });
}

// --- Inngest functions ------------------------------------------------------
// Crons are UTC; PKT = UTC+5 (spec §6).

const single = { concurrency: { limit: 1 } };

export const discoveryRunFunction = inngest.createFunction(
  {
    id: "discovery-run",
    ...single,
    triggers: [{ cron: "0 20 * * *" }, { event: MANUAL_EVENTS.discovery }],
  },
  async ({ step }) => runDiscovery(step),
);

export const enrichmentCron = inngest.createFunction(
  {
    id: "enrichment-cron",
    ...single,
    triggers: [{ cron: "0 */2 * * *" }, { event: MANUAL_EVENTS.enrichment }],
  },
  async ({ step }) => dispatchEnrichment(step),
);

export const enrichmentBatchFunction = inngest.createFunction(
  {
    id: "enrichment-batch",
    ...single,
    idempotency: "event.data.batchKey",
    triggers: [{ event: ENRICH_EVENT }],
  },
  async ({ event, step }) => runEnrichmentBatch(step, event.data),
);

export const classifyRunFunction = inngest.createFunction(
  {
    id: "classify-run",
    ...single,
    triggers: [{ cron: "0 22 * * *" }, { event: MANUAL_EVENTS.classify }],
  },
  async ({ step }) => runClassify(step),
);

export const nichesSnapshotFunction = inngest.createFunction(
  {
    id: "niches-snapshot",
    ...single,
    triggers: [{ cron: "0 1 * * *" }, { event: MANUAL_EVENTS.snapshot }],
  },
  async ({ step }) => runSnapshot(step),
);

export const retentionPurgeFunction = inngest.createFunction(
  {
    id: "retention-purge",
    ...single,
    triggers: [{ cron: "0 3 * * *" }, { event: MANUAL_EVENTS.purge }],
  },
  async ({ step }) => runPurge(step),
);

export const discoveryFunctions = [
  discoveryRunFunction,
  enrichmentCron,
  enrichmentBatchFunction,
  classifyRunFunction,
  nichesSnapshotFunction,
  retentionPurgeFunction,
];
