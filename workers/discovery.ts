import { z } from "zod";

import {
  affordableSeeds,
  CLASSIFY_BATCH_SIZE,
  CLASSIFY_BATCHES_PER_RUN,
  ENRICHMENT_BATCH_SIZE,
  ENRICHMENT_BATCHES_PER_TICK,
  searchVariant,
  SEEDS_PER_RUN_MAX,
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
import { markSeedsRun, pickDueSeeds, type DiscoverySeed } from "@/lib/services/discovery/seeds";
import {
  notifyNicheTrackers,
  type NicheNotifyResult,
} from "@/lib/services/discovery/niche-notifications";
import { snapshotNiches, type SnapshotResult } from "@/lib/services/discovery/snapshot";
import { createServiceClient } from "@/lib/supabase/service";
import type { StepRunner } from "@/lib/discovery/steps";
import {
  getQuotaBudgets,
  getQuotaBySource,
  hasJobBudget,
  withQuotaSource,
  type QuotaSource,
} from "@/lib/youtube/quota";

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

// D-078: services run each paid YouTube call as its own step, billed to the
// job's quota source, so a retry resumes where it failed.
function stepsFor(step: JobStep, source: QuotaSource): StepRunner {
  return (id, fn) => step.run(id, () => withQuotaSource(source, fn));
}

export async function runEnrichmentBatch(step: JobStep, data: unknown): Promise<EnrichResult> {
  const { channelIds } = EnrichRequestedSchema.parse(data);
  // One timestamp for the whole run: the body re-executes per step.
  const startedAt = (await step.run("started-at", async () => new Date().toISOString())) as string;
  return enrichChannels(channelIds, new Date(startedAt), stepsFor(step, "enrichment"));
}

// --- discovery --------------------------------------------------------------

export interface DiscoveryRunResult {
  seedsSearched: number;
  newChannels: number;
  stoppedForBudget: boolean;
}

// A manual run can cap its seeds (e.g. a small test run); the cron's
// scheduled-timer event carries no maxSeeds.
export const DiscoveryRequestedSchema = z.object({
  maxSeeds: z.number().int().min(1).max(SEEDS_PER_RUN_MAX).optional(),
});

// One step per seed, so an Inngest retry never re-pays a search that
// already succeeded (each step's output is memoised).
export async function runDiscovery(
  step: JobStep,
  now: Date = new Date(),
  maxSeeds: number = SEEDS_PER_RUN_MAX,
): Promise<DiscoveryRunResult> {
  const seeds = (await step.run("pick-seeds", async () => {
    const used = (await getQuotaBySource(now)).discovery;
    const limit = Math.min(maxSeeds, affordableSeeds(getQuotaBudgets().discovery, used));
    return limit > 0 ? pickDueSeeds(limit) : [];
  })) as DiscoverySeed[];
  if (seeds.length === 0) return { seedsSearched: 0, newChannels: 0, stoppedForBudget: true };

  const searched: SeedSearchOutcome[] = [];
  let stoppedForBudget = false;
  for (const [index, seed] of seeds.entries()) {
    const outcome = (await step.run(`search-${seed.id}`, () =>
      withQuotaSource("discovery", () => searchSeeds([seed], now, searchVariant(index))),
    )) as Awaited<ReturnType<typeof searchSeeds>>;
    searched.push(...outcome.searched);
    if (outcome.stoppedForBudget) {
      stoppedForBudget = true;
      break;
    }
  }

  const ingest = await ingestDiscoveredChannels(searched, now, stepsFor(step, "discovery"));

  // D-078: only now are the searches' results stored. An ingest that threw
  // or ran out of budget leaves the seeds due, so their channels are
  // picked up next run.
  if (!ingest.stoppedForBudget) {
    await step.run("mark-seeds-run", () =>
      markSeedsRun(
        searched.map((outcome) => outcome.seedId),
        now,
      ),
    );
  }

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

export async function runClassify(
  step: JobStep,
): Promise<{ classified: number; unclassified: number; batches: number }> {
  let classified = 0;
  let unclassified = 0;
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
    unclassified += result.unclassified;
    // A batch the model couldn't parse (or answered for none of the
    // channels) would be picked again immediately; stop rather than loop
    // on it (it retries tomorrow). Unclassified channels are progress:
    // they're marked and wait for the stale window.
    if (result.failed || result.classified + result.unclassified === 0) break;
  }
  return { classified, unclassified, batches };
}

// --- snapshot -----------------------------------------------------------------
// (The 30-day purge is main's youtube-retention job, extended to the
// discovery tables -- D-073, workers/youtube-retention.ts.)

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

// --- Inngest functions ------------------------------------------------------
// D-076: scheduled on the Pacific quota day (YouTube resets at midnight
// PT), so discovery starts right after the reset with a full budget and
// the rest of the chain follows it.
const PT = "TZ=America/Los_Angeles";

const single = { concurrency: { limit: 1 } };

export const discoveryRunFunction = inngest.createFunction(
  {
    id: "discovery-run",
    ...single,
    triggers: [{ cron: `${PT} 15 0 * * *` }, { event: MANUAL_EVENTS.discovery }],
  },
  async ({ event, step }) =>
    runDiscovery(step, new Date(), DiscoveryRequestedSchema.parse(event.data ?? {}).maxSeeds),
);

export const enrichmentCron = inngest.createFunction(
  {
    id: "enrichment-cron",
    ...single,
    triggers: [{ cron: `${PT} 0 */2 * * *` }, { event: MANUAL_EVENTS.enrichment }],
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
    triggers: [{ cron: `${PT} 0 2 * * *` }, { event: MANUAL_EVENTS.classify }],
  },
  async ({ step }) => runClassify(step),
);

export const nichesSnapshotFunction = inngest.createFunction(
  {
    id: "niches-snapshot",
    ...single,
    triggers: [{ cron: `${PT} 0 4 * * *` }, { event: MANUAL_EVENTS.snapshot }],
  },
  async ({ step }) => runSnapshot(step),
);

export const discoveryFunctions = [
  discoveryRunFunction,
  enrichmentCron,
  enrichmentBatchFunction,
  classifyRunFunction,
  nichesSnapshotFunction,
];
