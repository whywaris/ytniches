import { AsyncLocalStorage } from "node:async_hooks";

import { getRedis } from "@/lib/cache/redis";

// TRD.md §5.3: YouTube Data API v3 default daily quota. Name these as
// constants, not inline magic numbers — if Mac gets a higher quota
// approved, this is the one place that changes.
export const DAILY_QUOTA_LIMIT = 10_000;
export const SOFT_LIMIT = 9_500; // total above this returns a warning

// D-076: YouTube resets the daily quota at midnight Pacific, so our day
// counters roll over then too (not at UTC midnight).
export const QUOTA_TIME_ZONE = "America/Los_Angeles";

// D-075: the day's quota is split into per-category budgets so no category
// can starve another -- the discovery crawler can never push free tools
// into "Busy", and free tools can never eat live searches. Replaces D-054's
// single 70% free-tools cutoff.
export const QUOTA_CATEGORIES = ["live", "sync", "free_tools", "discovery"] as const;
export type QuotaCategory = (typeof QUOTA_CATEGORIES)[number];

export const DEFAULT_QUOTA_BUDGETS: Record<QuotaCategory, number> = {
  live: 3_500,
  sync: 2_000,
  free_tools: 1_500,
  // Until the D-036 quota increase lands.
  discovery: 3_000,
};

const BUDGET_ENV: Record<QuotaCategory, string> = {
  live: "YT_BUDGET_LIVE",
  sync: "YT_BUDGET_SYNC",
  free_tools: "YT_BUDGET_FREE_TOOLS",
  discovery: "DISCOVERY_DAILY_BUDGET",
};

// Read per call (not at import) so ops can change a budget with an env var
// and a redeploy, and tests can stub it. A budget can never exceed the
// whole day's quota; the total is also checked on every call.
export function getQuotaBudgets(): Record<QuotaCategory, number> {
  return Object.fromEntries(
    QUOTA_CATEGORIES.map((category) => {
      const configured = Number(process.env[BUDGET_ENV[category]]);
      const budget =
        Number.isFinite(configured) && configured > 0
          ? configured
          : DEFAULT_QUOTA_BUDGETS[category];
      return [category, Math.min(budget, DAILY_QUOTA_LIMIT)];
    }),
  ) as Record<QuotaCategory, number>;
}

// Per-source breakdown for Admin -> API Quotas (D-069). The source is
// ambient (AsyncLocalStorage) rather than a parameter threaded through
// every lib/youtube wrapper: callers wrap a unit of work once with
// withQuotaSource() and every call inside it is attributed.
export const QUOTA_SOURCES = [
  "search",
  "free_tools",
  "channel_sync",
  "discovery",
  "enrichment",
  "app",
] as const;
export type QuotaSource = (typeof QUOTA_SOURCES)[number];

const quotaSource = new AsyncLocalStorage<QuotaSource>();

export function withQuotaSource<T>(source: QuotaSource, fn: () => Promise<T>): Promise<T> {
  return quotaSource.run(source, fn);
}

export function currentQuotaSource(): QuotaSource {
  return quotaSource.getStore() ?? "app";
}

const CATEGORY_BY_SOURCE: Record<QuotaSource, QuotaCategory> = {
  search: "live",
  app: "live",
  channel_sync: "sync",
  free_tools: "free_tools",
  discovery: "discovery",
  enrichment: "discovery",
};

export function categoryForSource(source: QuotaSource): QuotaCategory {
  return CATEGORY_BY_SOURCE[source];
}

// Kept for the admin page: the discovery jobs' daily budget.
export function getJobDailyBudget(): number {
  return getQuotaBudgets().discovery;
}

// Keys are Pacific-day-scoped (roll over at the quota reset), so the TTL is
// only cleanup, never part of the counting. 8 days rather than 25h so the
// admin API-quotas page can read a 7-day trend straight from these keys,
// with a day of margin -- no separate history table.
const KEY_TTL_SECONDS = 8 * 24 * 60 * 60;

export interface QuotaCheckResult {
  allowed: boolean;
  used: number;
  warning?: boolean;
}

const QUOTA_DAY_FORMAT = new Intl.DateTimeFormat("en-CA", {
  timeZone: QUOTA_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// YYYY-MM-DD of the Pacific quota day `date` falls in.
export function quotaDay(date: Date = new Date()): string {
  return QUOTA_DAY_FORMAT.format(date);
}

// Calendar arithmetic on a YYYY-MM-DD string (no time zone involved).
function shiftDay(day: string, deltaDays: number): string {
  const [year, month, dayOfMonth] = day.split("-").map(Number);
  return new Date(Date.UTC(year!, month! - 1, dayOfMonth! + deltaDays)).toISOString().slice(0, 10);
}

function totalKey(day: string): string {
  return `quota:youtube:${day}`;
}

function sourceKey(day: string, source: QuotaSource): string {
  return `${totalKey(day)}:${source}`;
}

function categoryKey(day: string, category: QuotaCategory): string {
  return `${totalKey(day)}:cat:${category}`;
}

export interface QuotaDay {
  date: string; // YYYY-MM-DD, Pacific quota day
  used: number;
}

// Oldest first, today last. Days with no key (no YouTube calls, or before
// the 8-day TTL shipped) read as 0.
export async function getQuotaHistory(days: number, now: Date = new Date()): Promise<QuotaDay[]> {
  const today = quotaDay(now);
  const dayList = Array.from({ length: days }, (_, index) => shiftDay(today, index - (days - 1)));
  const values = await getRedis().mget<(number | string | null)[]>(...dayList.map(totalKey));
  return dayList.map((date, index) => ({ date, used: Number(values[index] ?? 0) }));
}

// Read-only: today's units so far, without spending any.
export async function getQuotaUsedToday(): Promise<number> {
  return Number((await getRedis().get<number | string>(totalKey(quotaDay()))) ?? 0);
}

// Read-only: a category's units so far today.
export async function getCategoryUsed(category: QuotaCategory): Promise<number> {
  return Number((await getRedis().get<number | string>(categoryKey(quotaDay(), category))) ?? 0);
}

export type QuotaByCategory = Record<QuotaCategory, { used: number; budget: number }>;

export async function getQuotaByCategory(now: Date = new Date()): Promise<QuotaByCategory> {
  const day = quotaDay(now);
  const budgets = getQuotaBudgets();
  const values = await getRedis().mget<(number | string | null)[]>(
    ...QUOTA_CATEGORIES.map((category) => categoryKey(day, category)),
  );
  return Object.fromEntries(
    QUOTA_CATEGORIES.map((category, index) => [
      category,
      { used: Number(values[index] ?? 0), budget: budgets[category] },
    ]),
  ) as QuotaByCategory;
}

export type QuotaBySource = Record<QuotaSource, number>;

// Today's (or `now`'s Pacific day's) units per source. Units spent before
// the per-source counter shipped only show in the total.
export async function getQuotaBySource(now: Date = new Date()): Promise<QuotaBySource> {
  const day = quotaDay(now);
  const values = await getRedis().mget<(number | string | null)[]>(
    ...QUOTA_SOURCES.map((source) => sourceKey(day, source)),
  );
  return Object.fromEntries(
    QUOTA_SOURCES.map((source, index) => [source, Number(values[index] ?? 0)]),
  ) as QuotaBySource;
}

// Read-only pre-check for background jobs: would spending `cost` more
// units today stay within the discovery budget (and the day's total)?
// Checked before the call, unlike checkAndIncrement, so a job never spends
// a unit it then throws away. Other categories' budgets are untouched by
// construction: discovery only ever draws on its own.
export async function hasJobBudget(cost: number): Promise<boolean> {
  const [discoveryUsed, total] = await Promise.all([
    getCategoryUsed("discovery"),
    getQuotaUsedToday(),
  ]);
  return discoveryUsed + cost <= getQuotaBudgets().discovery && total + cost <= DAILY_QUOTA_LIMIT;
}

// INCRBY is atomic in Redis — concurrent callers each get a unique,
// correctly-ordered return value, so there's no TOCTOU window here despite
// this being two separate Redis calls. `expire` isn't part of the
// correctness-critical path (redundant calls from concurrent callers are
// harmless), so it doesn't need to be bundled into a transaction/Lua script
// with the increment.
//
// D-075: the call is allowed only if both its category's budget and the
// day's total still have room after the increment.
export async function checkAndIncrement(cost: number): Promise<QuotaCheckResult> {
  const redis = getRedis();
  const day = quotaDay();
  const source = currentQuotaSource();
  const category = categoryForSource(source);

  const bump = async (key: string) => {
    const value = await redis.incrby(key, cost);
    await redis.expire(key, KEY_TTL_SECONDS);
    return value;
  };
  const used = await bump(totalKey(day));
  const categoryUsed = await bump(categoryKey(day, category));
  // Attribution only (admin breakdown).
  await bump(sourceKey(day, source));

  if (used > DAILY_QUOTA_LIMIT || categoryUsed > getQuotaBudgets()[category]) {
    // Already incremented — we're over, but the unit is spent. Intentional:
    // better to overshoot by one call than to under-count due to a race.
    return { allowed: false, used };
  }
  if (used > SOFT_LIMIT) {
    return { allowed: true, used, warning: true };
  }
  return { allowed: true, used };
}
