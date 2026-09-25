import type { Tier } from "@/lib/billing/products";

// Monetization.md §2. Prices in whole dollars (display only -- Creem
// products carry the authoritative cents amounts, TRD.md §4.3). Feature
// bullets are the quantifiable per-tier numbers (§2.5's feature matrix) --
// Team's Phase 3 collaboration features aren't built yet, so they're left
// out of this MVP-era card rather than advertising something unusable.
export const TIER_INFO: Record<
  Tier,
  { label: string; monthlyPrice: number; yearlyPrice: number; features: string[] }
> = {
  starter: {
    label: "Starter",
    monthlyPrice: 19,
    yearlyPrice: 190,
    features: ["200 credits / month", "Track up to 10 channels", "Refreshes every 24 hours"],
  },
  pro: {
    label: "Pro",
    monthlyPrice: 49,
    yearlyPrice: 490,
    features: [
      "1,000 credits / month",
      "Track up to 50 channels",
      "Refreshes every 6 hours",
      "Priority AI generation",
      "Email digests",
    ],
  },
  team: {
    label: "Team",
    monthlyPrice: 99,
    yearlyPrice: 990,
    features: [
      "3,000 credits / month",
      "Track up to 100 channels",
      "Refreshes hourly",
      "3 seats included",
    ],
  },
};

export const TIERS: Tier[] = ["starter", "pro", "team"];

// Shared by the pricing cards, /settings/billing and the /vs/* pages, so a
// price change lands everywhere at once.

// Monetization.md §1: every new account gets one trial of Pro. It's
// granted at onboarding (lib/services/onboarding.ts activateTrial) with no
// billing step, which is what makes "no card" true.
export const TRIAL = { days: 14, tier: "pro" } as const satisfies { days: number; tier: Tier };

export function trialSummary(): string {
  return `${TRIAL.days} days of ${TIER_INFO[TRIAL.tier].label}, no card`;
}
