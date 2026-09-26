import {
  EXPANSION_SEED_PRIORITY,
  EXPANSION_SEEDS_PER_DAY,
  USER_SEARCH_SEED_PRIORITY,
} from "@/lib/discovery/config";
import { createServiceClient } from "@/lib/supabase/service";

// Niche-Discovery-Engine.md §6.3. discovery_seeds is service-role only
// (D-070), so every function here is server-only.

export interface DiscoverySeed {
  id: string;
  keyword: string;
  source: "manual" | "user_search" | "expansion";
  priority: number;
  lastRunAt: string | null;
}

const MAX_KEYWORD_LENGTH = 80;

// Lower-cased, whitespace-collapsed, so "Mafia  History" and "mafia history"
// are the same seed (discovery_seeds.keyword is unique).
export function normalizeKeyword(keyword: string): string | null {
  const normalized = keyword.trim().replace(/\s+/g, " ").toLowerCase();
  if (normalized.length < 2 || normalized.length > MAX_KEYWORD_LENGTH) return null;
  return normalized;
}

function toSeed(row: {
  id: string;
  keyword: string;
  source: string;
  priority: number;
  last_run_at: string | null;
}): DiscoverySeed {
  return {
    id: row.id,
    keyword: row.keyword,
    source: row.source as DiscoverySeed["source"],
    priority: row.priority,
    lastRunAt: row.last_run_at,
  };
}

// Spec §6: highest priority (lowest number) first, then never-run, then
// longest since last run.
export async function pickDueSeeds(limit: number): Promise<DiscoverySeed[]> {
  const { data, error } = await createServiceClient()
    .from("discovery_seeds")
    .select("id, keyword, source, priority, last_run_at")
    .order("priority", { ascending: true })
    .order("last_run_at", { ascending: true, nullsFirst: true })
    .limit(limit);
  if (error) throw new Error(`pickDueSeeds failed: ${error.message}`);
  return data.map(toSeed);
}

export async function markSeedRun(seedId: string, at: Date = new Date()): Promise<void> {
  const { error } = await createServiceClient()
    .from("discovery_seeds")
    .update({ last_run_at: at.toISOString() })
    .eq("id", seedId);
  if (error) throw new Error(`markSeedRun failed: ${error.message}`);
}

async function insertSeeds(
  keywords: string[],
  source: DiscoverySeed["source"],
  priority: number,
): Promise<number> {
  const unique = [
    ...new Set(keywords.map(normalizeKeyword).filter((k): k is string => k !== null)),
  ];
  if (unique.length === 0) return 0;
  const { data, error } = await createServiceClient()
    .from("discovery_seeds")
    .upsert(
      unique.map((keyword) => ({ keyword, source, priority })),
      { onConflict: "keyword", ignoreDuplicates: true },
    )
    .select("id");
  if (error) throw new Error(`insertSeeds failed: ${error.message}`);
  return data.length;
}

// Every successful live search feeds the crawler (spec §6.3). Best effort:
// a seed-table hiccup must never fail the user's (already paid) search.
export async function addUserSearchSeed(keyword: string): Promise<void> {
  try {
    await insertSeeds([keyword], "user_search", USER_SEARCH_SEED_PRIORITY);
  } catch (cause) {
    console.error("addUserSearchSeed failed", cause);
  }
}

// AI-suggested related keywords, capped per UTC day (spec §6.3).
export async function addExpansionSeeds(
  keywords: string[],
  now: Date = new Date(),
): Promise<number> {
  const dayStart = new Date(now);
  dayStart.setUTCHours(0, 0, 0, 0);
  const { count, error } = await createServiceClient()
    .from("discovery_seeds")
    .select("id", { count: "exact", head: true })
    .eq("source", "expansion")
    .gte("created_at", dayStart.toISOString());
  if (error) throw new Error(`addExpansionSeeds count failed: ${error.message}`);

  const remaining = EXPANSION_SEEDS_PER_DAY - (count ?? 0);
  if (remaining <= 0) return 0;
  return insertSeeds(keywords.slice(0, remaining), "expansion", EXPANSION_SEED_PRIORITY);
}

// --- Admin (/admin/discovery) ---------------------------------------------

export async function listSeeds(): Promise<DiscoverySeed[]> {
  const { data, error } = await createServiceClient()
    .from("discovery_seeds")
    .select("id, keyword, source, priority, last_run_at")
    .order("priority", { ascending: true })
    .order("keyword", { ascending: true });
  if (error) throw new Error(`listSeeds failed: ${error.message}`);
  return data.map(toSeed);
}

export async function addManualSeed(keyword: string, priority: number): Promise<boolean> {
  return (await insertSeeds([keyword], "manual", priority)) > 0;
}

export async function deleteSeed(seedId: string): Promise<void> {
  const { error } = await createServiceClient().from("discovery_seeds").delete().eq("id", seedId);
  if (error) throw new Error(`deleteSeed failed: ${error.message}`);
}
