import { getRedis } from "@/lib/cache/redis";
import {
  DAY_MS,
  MIN_AVG_VIEWS,
  NEW_CHANNEL_MONTHS,
  OUTLIER_FEED_MIN_MULTIPLE,
  SMALL_CHANNEL_SUBS,
  TREND_WINDOW_DAYS,
} from "@/lib/discovery/config";
import {
  nicheStatus,
  scoreNiches,
  whyChips,
  type NicheSignalInputs,
  type NicheStatus,
} from "@/lib/discovery/scoring";
import { createServiceClient } from "@/lib/supabase/service";

// Niche-Discovery-Engine.md §6 niches-snapshot / §8. Aggregates come from
// niche_signal_inputs() (SQL, scales past PostgREST's row cap); weighting,
// labels, chips and status come from lib/discovery/scoring.ts.

export const FEED_VERSION_KEY = "discovery:feed:version";
export const FRESHNESS_KEY = "discovery:freshness";

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export interface NicheScoreChange {
  nicheId: string;
  score: number;
  trend: number | null;
  status: NicheStatus;
}

export interface SnapshotResult {
  snapshotDate: string;
  scored: number;
  changes: NicheScoreChange[];
}

async function loadSignalInputs(): Promise<NicheSignalInputs[]> {
  const { data, error } = await createServiceClient().rpc("niche_signal_inputs", {
    p_min_avg_views: MIN_AVG_VIEWS,
    p_small_channel_subs: SMALL_CHANNEL_SUBS,
    p_new_channel_months: NEW_CHANNEL_MONTHS,
    p_outlier_multiple: OUTLIER_FEED_MIN_MULTIPLE,
  });
  if (error) throw new Error(`niche_signal_inputs failed: ${error.message}`);
  return data.map((row) => ({
    nicheId: row.niche_id,
    channelCount: row.channel_count,
    performingCount: row.performing_count,
    smallPerformingCount: row.small_performing_count,
    newPerformingCount: row.new_performing_count,
    newChannels30d: row.new_channels_30d,
    medianViews90d: row.median_views_90d,
    recentVideoCount: row.recent_video_count,
    outlierVideoCount: row.outlier_video_count,
    uploads30d: row.uploads_30d,
  }));
}

async function loadPreviousScores(date: string): Promise<Map<string, number>> {
  const { data, error } = await createServiceClient()
    .from("niche_snapshots")
    .select("niche_id, opportunity_score")
    .eq("snapshot_date", date);
  if (error) throw new Error(`loadPreviousScores failed: ${error.message}`);
  return new Map(data.map((row) => [row.niche_id, row.opportunity_score]));
}

// Idempotent per day: re-running upserts the same (niche_id, date) rows.
export async function snapshotNiches(now: Date = new Date()): Promise<SnapshotResult> {
  const snapshotDate = isoDate(now);
  const inputs = await loadSignalInputs();
  const inputById = new Map(inputs.map((input) => [input.nicheId, input]));
  const scored = scoreNiches(inputs);
  const previous = await loadPreviousScores(
    isoDate(new Date(now.getTime() - TREND_WINDOW_DAYS * DAY_MS)),
  );

  const supabase = createServiceClient();
  const changes: NicheScoreChange[] = [];
  const rows = scored.map((niche) => {
    const input = inputById.get(niche.nicheId)!;
    const prior = previous.get(niche.nicheId);
    const trend = prior === undefined ? null : niche.score - prior;
    changes.push({
      nicheId: niche.nicheId,
      score: niche.score,
      trend,
      status: nicheStatus(niche, trend),
    });
    return {
      niche_id: niche.nicheId,
      snapshot_date: snapshotDate,
      opportunity_score: niche.score,
      demand: niche.raw.demand,
      accessibility: niche.raw.accessibility,
      momentum: niche.raw.momentum,
      outlier_density: niche.raw.outlierDensity,
      supply: niche.raw.supply,
      channel_count: input.channelCount,
      new_channels_30d: input.newChannels30d,
      median_views: input.medianViews90d,
      trend,
      why_chips: whyChips({
        raw: niche.raw,
        contributions: niche.contributions,
        performingCount: input.performingCount,
        newPerformingCount: input.newPerformingCount,
      }),
    };
  });

  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await supabase
      .from("niche_snapshots")
      .upsert(rows.slice(i, i + 500), { onConflict: "niche_id,snapshot_date" });
    if (error) throw new Error(`snapshotNiches upsert failed: ${error.message}`);
  }

  // One update per status value, not per niche.
  const byStatus = new Map<NicheStatus, string[]>();
  for (const change of changes) {
    byStatus.set(change.status, [...(byStatus.get(change.status) ?? []), change.nicheId]);
  }
  for (const [status, ids] of byStatus) {
    const { error } = await supabase.from("niches").update({ status }).in("id", ids);
    if (error) throw new Error(`snapshotNiches status failed: ${error.message}`);
  }

  await warmFeedCache(now);
  return { snapshotDate, scored: rows.length, changes };
}

export interface FeedFreshness {
  updatedAt: string | null;
  newChannelsThisWeek: number;
}

export async function computeFreshness(now: Date = new Date()): Promise<FeedFreshness> {
  const supabase = createServiceClient();
  const weekAgo = new Date(now.getTime() - 7 * DAY_MS).toISOString();
  const [latest, fresh] = await Promise.all([
    supabase
      .from("channels")
      .select("enriched_at")
      .not("enriched_at", "is", null)
      .order("enriched_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("channels")
      .select("id", { count: "exact", head: true })
      .gte("discovered_at", weekAgo),
  ]);
  if (latest.error) throw new Error(`computeFreshness latest failed: ${latest.error.message}`);
  if (fresh.error) throw new Error(`computeFreshness count failed: ${fresh.error.message}`);
  return { updatedAt: latest.data?.enriched_at ?? null, newChannelsThisWeek: fresh.count ?? 0 };
}

// Bumping the version orphans every cached feed page at once (they're keyed
// by it and expire on their own), so no key scan is ever needed.
export async function warmFeedCache(now: Date = new Date()): Promise<void> {
  const redis = getRedis();
  await redis.set(FEED_VERSION_KEY, String(now.getTime()));
  await redis.set(FRESHNESS_KEY, await computeFreshness(now), { ex: 6 * 60 * 60 });
}
