import { getRedis } from "@/lib/cache/redis";

// TRD.md §5.3: YouTube Data API v3 default daily quota. Name these as
// constants, not inline magic numbers — if Mac gets a higher quota
// approved, this is the one place that changes.
export const DAILY_QUOTA_LIMIT = 10_000;
export const SOFT_LIMIT = 9_500; // non-critical calls should stop above this
// D-054: anonymous free tools stop at 70% (TRD.md §5.3's first alert
// level) so the last 30% of the day's quota is kept for signed-in users.
// Derived from the limit, so it scales when the quota increase lands.
export const FREE_TOOLS_QUOTA_CUTOFF = Math.floor(DAILY_QUOTA_LIMIT * 0.7);

// The key is UTC-date-scoped (rolls over naturally at midnight UTC), so the
// TTL is only cleanup, never part of the counting. 8 days rather than 25h
// so the admin API-quotas page can read a 7-day trend straight from these
// keys, with a day of margin -- no separate history table.
const KEY_TTL_SECONDS = 8 * 24 * 60 * 60;

export interface QuotaCheckResult {
  allowed: boolean;
  used: number;
  warning?: boolean;
}

function quotaKeyFor(date: Date): string {
  return `quota:youtube:${date.toISOString().slice(0, 10)}`;
}

function getQuotaKey(): string {
  return quotaKeyFor(new Date());
}

export interface QuotaDay {
  date: string; // YYYY-MM-DD, UTC
  used: number;
}

// Oldest first, today last. Days with no key (no YouTube calls, or before
// the 8-day TTL shipped) read as 0.
export async function getQuotaHistory(days: number, now: Date = new Date()): Promise<QuotaDay[]> {
  const dates = Array.from({ length: days }, (_, index) => {
    const date = new Date(now);
    date.setUTCDate(date.getUTCDate() - (days - 1 - index));
    return date;
  });
  const values = await getRedis().mget<(number | string | null)[]>(...dates.map(quotaKeyFor));
  return dates.map((date, index) => ({
    date: date.toISOString().slice(0, 10),
    used: Number(values[index] ?? 0),
  }));
}

// Read-only: today's units so far, without spending any.
export async function getQuotaUsedToday(): Promise<number> {
  return Number((await getRedis().get<number | string>(getQuotaKey())) ?? 0);
}

// INCRBY is atomic in Redis — concurrent callers each get a unique,
// correctly-ordered return value, so there's no TOCTOU window here despite
// this being two separate Redis calls. `expire` isn't part of the
// correctness-critical path (redundant calls from concurrent callers are
// harmless), so it doesn't need to be bundled into a transaction/Lua script
// with the increment.
export async function checkAndIncrement(cost: number): Promise<QuotaCheckResult> {
  const redis = getRedis();
  const key = getQuotaKey();

  const used = await redis.incrby(key, cost);
  await redis.expire(key, KEY_TTL_SECONDS);

  if (used > DAILY_QUOTA_LIMIT) {
    // Already incremented — we're over, but the unit is spent. Intentional:
    // better to overshoot by one call than to under-count due to a race.
    return { allowed: false, used };
  }
  if (used > SOFT_LIMIT) {
    return { allowed: true, used, warning: true };
  }
  return { allowed: true, used };
}
