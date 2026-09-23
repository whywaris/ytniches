// Monetization.md §2, §4.3. Product IDs come from env vars, not
// hardcoded -- test vs prod Creem products have different IDs, and only
// the env differs between environments.
export type Tier = "starter" | "pro" | "team";
export type BillingFrequency = "monthly" | "yearly";

const PRODUCT_ID_ENV: Record<Tier, Record<BillingFrequency, string | undefined>> = {
  starter: {
    monthly: process.env.CREEM_PRODUCT_ID_STARTER_MONTHLY,
    yearly: process.env.CREEM_PRODUCT_ID_STARTER_YEARLY,
  },
  pro: {
    monthly: process.env.CREEM_PRODUCT_ID_PRO_MONTHLY,
    yearly: process.env.CREEM_PRODUCT_ID_PRO_YEARLY,
  },
  team: {
    monthly: process.env.CREEM_PRODUCT_ID_TEAM_MONTHLY,
    yearly: process.env.CREEM_PRODUCT_ID_TEAM_YEARLY,
  },
};

// Monetization.md §2.5: email notifications are Starter/trial-excluded --
// Pro and Team only. Shared between the background fan-out job
// (workers/channel-sync.ts) and the notification preferences service, so
// the tier list lives in exactly one place. Takes `string`, not `Tier`:
// callers often have the raw `subscriptions.tier` DB enum in hand (which
// also carries a legacy, otherwise-unused "free" value outside `Tier`),
// not the narrower app-level type.
const EMAIL_ELIGIBLE_TIERS = new Set<string>(["pro", "team"]);

export function isEmailEligibleTier(tier: string | null | undefined): boolean {
  return tier !== null && tier !== undefined && EMAIL_ELIGIBLE_TIERS.has(tier);
}

export function getProductId(tier: Tier, frequency: BillingFrequency): string {
  const id = PRODUCT_ID_ENV[tier][frequency];
  if (!id) {
    throw new Error(`Missing Creem product id env var for tier=${tier} frequency=${frequency}`);
  }
  return id;
}

// Reverse lookup for the webhook handler: an event's `object.product.id`
// (or `object.product`, a bare string) needs mapping back to our tier.
// Built once at module load from whatever env vars are actually set --
// skips missing ones rather than throwing, since not every deploy target
// (e.g. a partially-configured preview env) needs every product wired up.
const TIER_BY_PRODUCT_ID = new Map<string, Tier>();
for (const tier of Object.keys(PRODUCT_ID_ENV) as Tier[]) {
  for (const frequency of Object.keys(PRODUCT_ID_ENV[tier]) as BillingFrequency[]) {
    const id = PRODUCT_ID_ENV[tier][frequency];
    if (id) TIER_BY_PRODUCT_ID.set(id, tier);
  }
}

export function getTierForProductId(productId: string): Tier | null {
  return TIER_BY_PRODUCT_ID.get(productId) ?? null;
}
