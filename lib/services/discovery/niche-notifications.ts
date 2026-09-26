import { DAY_MS, TREND_STATUS_DELTA } from "@/lib/discovery/config";
import { createServiceClient } from "@/lib/supabase/service";
import type { NicheScoreChange } from "@/lib/services/discovery/snapshot";

// Niche-Discovery-Engine.md §11. In-app notifications for users who track
// a niche -- i.e. track at least one of its channels. Both kinds run once a
// day from the snapshot job and go through the user's "niche_update"
// preference (Settings -> Notifications).

export const NICHE_NOTIFICATION_TYPE = "niche_update";

// Hard cap per niche, same reasoning as channel-sync's fan-out cap.
const MAX_USERS_PER_NICHE = 1_000;

interface NicheRef {
  id: string;
  slug: string;
  name: string;
}

interface Draft {
  kind: "score_move" | "new_outliers";
  userId: string;
  niche: NicheRef;
  title: string;
  body: string;
}

async function trackersByNiche(nicheIds: string[]): Promise<Map<string, Set<string>>> {
  const result = new Map<string, Set<string>>();
  if (nicheIds.length === 0) return result;
  const { data, error } = await createServiceClient()
    .from("tracked_channels")
    .select("user_id, channels!inner(niche_id)")
    .in("channels.niche_id", nicheIds)
    .limit(nicheIds.length * MAX_USERS_PER_NICHE);
  if (error) throw new Error(`trackersByNiche failed: ${error.message}`);
  for (const row of data) {
    const nicheId = row.channels.niche_id;
    if (!nicheId) continue;
    const users = result.get(nicheId) ?? new Set<string>();
    if (users.size < MAX_USERS_PER_NICHE) users.add(row.user_id);
    result.set(nicheId, users);
  }
  return result;
}

async function loadNiches(nicheIds: string[]): Promise<Map<string, NicheRef>> {
  if (nicheIds.length === 0) return new Map();
  const { data, error } = await createServiceClient()
    .from("niches")
    .select("id, slug, name")
    .in("id", nicheIds);
  if (error) throw new Error(`loadNiches failed: ${error.message}`);
  return new Map(data.map((row) => [row.id, row]));
}

async function newOutlierCounts(since: string): Promise<Map<string, number>> {
  const { data, error } = await createServiceClient()
    .from("outliers_feed")
    .select("niche_id")
    .gte("detected_at", since)
    .not("niche_id", "is", null)
    .limit(5_000);
  if (error) throw new Error(`newOutlierCounts failed: ${error.message}`);
  const counts = new Map<string, number>();
  for (const row of data) {
    if (row.niche_id) counts.set(row.niche_id, (counts.get(row.niche_id) ?? 0) + 1);
  }
  return counts;
}

export function scoreMoveCopy(name: string, trend: number): { title: string; body: string } {
  const signed = trend > 0 ? `+${trend}` : String(trend);
  return {
    title: `${name} moved ${signed} this week`,
    body:
      trend > 0
        ? "Its Opportunity Score is climbing. Worth a look before it gets crowded."
        : "Its Opportunity Score dropped. Check whether competition is catching up.",
  };
}

export function newOutlierCopy(name: string, count: number): { title: string; body: string } {
  return {
    title: count === 1 ? `New outlier in ${name}` : `${count} new outliers in ${name}`,
    body: "Videos at 3x+ their channel's usual views. See what's breaking out.",
  };
}

async function optedOutUsers(userIds: string[]): Promise<Set<string>> {
  if (userIds.length === 0) return new Set();
  const { data, error } = await createServiceClient()
    .from("notification_preferences")
    .select("user_id")
    .eq("notification_type", NICHE_NOTIFICATION_TYPE)
    .eq("in_app_enabled", false)
    .in("user_id", userIds);
  if (error) throw new Error(`optedOutUsers failed: ${error.message}`);
  return new Set(data.map((row) => row.user_id));
}

// Idempotent per UTC day: a user never gets the same niche's note twice in
// one day, so a manual re-run of the snapshot job can't double-notify.
async function alreadySentToday(userIds: string[], dayStart: string): Promise<Set<string>> {
  if (userIds.length === 0) return new Set();
  const { data, error } = await createServiceClient()
    .from("notifications")
    .select("user_id, title")
    .eq("notification_type", NICHE_NOTIFICATION_TYPE)
    .gte("created_at", dayStart)
    .in("user_id", userIds);
  if (error) throw new Error(`alreadySentToday failed: ${error.message}`);
  return new Set(data.map((row) => `${row.user_id}|${row.title}`));
}

export interface NicheNotifyResult {
  scoreMoves: number;
  newOutliers: number;
}

export async function notifyNicheTrackers(
  changes: NicheScoreChange[],
  now: Date = new Date(),
): Promise<NicheNotifyResult> {
  const moved = changes.filter(
    (change) => change.trend !== null && Math.abs(change.trend) >= TREND_STATUS_DELTA,
  );
  const outlierCounts = await newOutlierCounts(new Date(now.getTime() - DAY_MS).toISOString());

  const nicheIds = [...new Set([...moved.map((c) => c.nicheId), ...outlierCounts.keys()])];
  const [trackers, niches] = await Promise.all([trackersByNiche(nicheIds), loadNiches(nicheIds)]);

  const drafts: Draft[] = [];
  for (const change of moved) {
    const niche = niches.get(change.nicheId);
    if (!niche) continue;
    const copy = scoreMoveCopy(niche.name, change.trend!);
    for (const userId of trackers.get(change.nicheId) ?? []) {
      drafts.push({ kind: "score_move", userId, niche, ...copy });
    }
  }
  for (const [nicheId, count] of outlierCounts) {
    const niche = niches.get(nicheId);
    if (!niche) continue;
    const copy = newOutlierCopy(niche.name, count);
    for (const userId of trackers.get(nicheId) ?? []) {
      drafts.push({ kind: "new_outliers", userId, niche, ...copy });
    }
  }
  if (drafts.length === 0) return { scoreMoves: 0, newOutliers: 0 };

  const userIds = [...new Set(drafts.map((d) => d.userId))];
  const dayStart = new Date(now);
  dayStart.setUTCHours(0, 0, 0, 0);
  const [optedOut, sent] = await Promise.all([
    optedOutUsers(userIds),
    alreadySentToday(userIds, dayStart.toISOString()),
  ]);

  const kept = drafts.filter((d) => !optedOut.has(d.userId) && !sent.has(`${d.userId}|${d.title}`));
  const rows = kept.map((d) => ({
    user_id: d.userId,
    notification_type: NICHE_NOTIFICATION_TYPE,
    title: d.title,
    body: d.body,
    // "niche:<slug>" alongside the existing "channel:"/"video:" refs
    // (app/(app)/tracking/notification-refs.ts resolves it).
    related_resource: `niche:${d.niche.slug}`,
    delivered_channels: ["in_app"],
  }));

  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await createServiceClient()
      .from("notifications")
      .insert(rows.slice(i, i + 500));
    if (error) throw new Error(`notifyNicheTrackers insert failed: ${error.message}`);
  }

  return {
    scoreMoves: kept.filter((d) => d.kind === "score_move").length,
    newOutliers: kept.filter((d) => d.kind === "new_outliers").length,
  };
}
