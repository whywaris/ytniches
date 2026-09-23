import { createClient } from "@/lib/supabase/server";
import { getRedis } from "@/lib/cache/redis";
import type { Tier } from "@/lib/billing/products";

// Split out of lib/context.ts (not just organizationally): that file also
// imports next/headers's cookies(), and lib/services/billing.ts needs
// invalidateTierCache() as a *runtime* import (not the type-only
// RequestContext import it had before). That runtime edge, reached from
// app/(app)/settings/billing/actions.ts ("use server") which UpgradeModal
// ("use client") calls, pulled next/headers's cookies() into a Turbopack
// client-reference chunk it can't build for the browser -- a hard
// `node:fs` panic on every page whose client tree renders UpgradeModal
// (caught live: /workspace and /settings/notifications both 500'd,
// /invite and /dashboard, which don't reach UpgradeModal, didn't). This
// module has no next/headers dependency, so billing.ts importing it keeps
// that chain server-only without the panic.
const TIER_CACHE_TTL_SECONDS = 60;
// Redis value for "looked up, no active subscription" -- distinct from a
// cache miss, so that state is cached too instead of re-querying on every
// request for a user who simply hasn't subscribed yet.
const NO_TIER_SENTINEL = "none";

function tierCacheKey(userId: string): string {
  return `session:tier:${userId}`;
}

function isTier(value: unknown): value is Tier {
  return value === "starter" || value === "pro" || value === "team";
}

export async function resolveTier(userId: string): Promise<Tier | null> {
  const redis = getRedis();
  const cached = await redis.get<string>(tierCacheKey(userId));
  if (cached !== null && cached !== undefined) {
    return cached === NO_TIER_SENTINEL ? null : (cached as Tier);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("tier")
    .eq("user_id", userId)
    .eq("is_current", true)
    .maybeSingle();
  if (error) {
    throw new Error(`resolveTier query failed: ${error.message}`);
  }

  const tier = isTier(data?.tier) ? data.tier : null;
  await redis.set(tierCacheKey(userId), tier ?? NO_TIER_SENTINEL, { ex: TIER_CACHE_TTL_SECONDS });
  return tier;
}

export async function invalidateTierCache(userId: string): Promise<void> {
  await getRedis().del(tierCacheKey(userId));
}
