import { getRedis } from "@/lib/cache/redis";

// TRD.md §5.3: YouTube Data API v3 default daily quota. Name these as
// constants, not inline magic numbers — if Mac gets a higher quota
// approved, this is the one place that changes.
const DAILY_QUOTA_LIMIT = 10_000;
const SOFT_LIMIT = 9_500; // non-critical calls should stop above this

// 25h, not 24h: the key is already UTC-date-scoped (rolls over naturally at
// midnight UTC), so this TTL is only a cleanup safety net, not part of the
// correctness path — giving it an extra hour of margin over the key's
// natural 24h life avoids a key expiring early relative to a
// slightly-skewed clock.
const KEY_TTL_SECONDS = 25 * 60 * 60;

export interface QuotaCheckResult {
  allowed: boolean;
  used: number;
  warning?: boolean;
}

function getQuotaKey(): string {
  return `quota:youtube:${new Date().toISOString().slice(0, 10)}`;
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
