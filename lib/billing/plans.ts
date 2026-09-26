import type { Tier } from "@/lib/billing/products";

// Monetization.md §2. The single source for per-plan numbers: prices
// (whole dollars, display only -- Creem products carry the authoritative
// cents amounts, TRD.md §4.3), monthly credits (seeded into
// credit_allocations by migration, tests/lib/billing/plans.test.ts keeps
// them equal), tracked-channel caps, sync cadence and seats. The pricing
// cards' bullets are derived from these numbers, so the card can't promise
// something the product doesn't do.

interface TierNumbers {
  label: string;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyCredits: number;
  trackedChannels: number;
  refreshCadenceHours: number;
  seats?: number;
  extras: string[];
}

function cadenceLabel(hours: number): string {
  return hours === 1 ? "Refreshes hourly" : `Refreshes every ${hours} hours`;
}

function withFeatures<T extends TierNumbers>(numbers: T): T & { features: string[] } {
  return {
    ...numbers,
    features: [
      `${numbers.monthlyCredits.toLocaleString("en-US")} credits / month`,
      `Track up to ${numbers.trackedChannels} channels`,
      cadenceLabel(numbers.refreshCadenceHours),
      ...(numbers.seats ? [`${numbers.seats} seats included`] : []),
      ...numbers.extras,
    ],
  };
}

export const TIER_INFO = {
  starter: withFeatures({
    label: "Starter",
    monthlyPrice: 19,
    yearlyPrice: 190,
    monthlyCredits: 200,
    trackedChannels: 10,
    refreshCadenceHours: 24,
    extras: [],
  }),
  pro: withFeatures({
    label: "Pro",
    monthlyPrice: 49,
    yearlyPrice: 490,
    monthlyCredits: 1000,
    trackedChannels: 50,
    refreshCadenceHours: 6,
    // No "Priority AI generation": there is no priority queue (D-060).
    extras: ["Email digests"],
  }),
  team: withFeatures({
    label: "Team",
    monthlyPrice: 99,
    yearlyPrice: 990,
    monthlyCredits: 3000,
    trackedChannels: 100,
    refreshCadenceHours: 1,
    // Hard cap, enforced in lib/services/workspace.ts. No seat purchasing
    // exists yet, so no "+$ per extra seat" anywhere.
    seats: 3,
    extras: [],
  }),
} satisfies Record<Tier, TierNumbers & { features: string[] }>;

export const TIERS: Tier[] = ["starter", "pro", "team"];

// Shared by the pricing cards, /settings/billing and the /vs/* pages, so a
// price change lands everywhere at once.

// Monetization.md §1: every new account gets one trial of Pro. It's
// granted at onboarding (lib/services/onboarding.ts activateTrial) with no
// billing step, which is what makes "no card" true. Trial channels sync
// at Pro's cadence: the trial is every Pro feature (D-060).
export const TRIAL = {
  days: 14,
  tier: "pro",
  refreshCadenceHours: TIER_INFO.pro.refreshCadenceHours,
} as const satisfies { days: number; tier: Tier; refreshCadenceHours: number };

// The one way the trial is marketed (pricing, landing, VS pages, help):
// "Try every Pro feature free for 14 days", the only trial wording.
export const TRIAL_PITCH = `Try every ${TIER_INFO[TRIAL.tier].label} feature free for ${TRIAL.days} days`;

export function trialSummary(): string {
  return `${TRIAL.days} days of ${TIER_INFO[TRIAL.tier].label}, no card`;
}

// No subscription, or one that has lapsed.
export const DEFAULT_REFRESH_CADENCE_HOURS = TIER_INFO.starter.refreshCadenceHours;
export const DEFAULT_TRACKED_CHANNELS = TIER_INFO.starter.trackedChannels;

// How often a user's tracked channels sync, from their current
// subscription. Paying (or in the past_due grace period) gets the plan's
// cadence; a trial gets TRIAL's; anything else falls back to the default.
export function refreshCadenceHoursFor(
  subscription: { tier: string; status: string } | null | undefined,
): number {
  if (!subscription) return DEFAULT_REFRESH_CADENCE_HOURS;
  if (subscription.status === "trialing") return TRIAL.refreshCadenceHours;
  const isTier = (value: string): value is Tier => value in TIER_INFO;
  if (
    (subscription.status === "active" || subscription.status === "past_due") &&
    isTier(subscription.tier)
  ) {
    return TIER_INFO[subscription.tier].refreshCadenceHours;
  }
  return DEFAULT_REFRESH_CADENCE_HOURS;
}

export function trackedChannelsLimitFor(tier: string | null | undefined): number {
  return tier && tier in TIER_INFO
    ? TIER_INFO[tier as Tier].trackedChannels
    : DEFAULT_TRACKED_CHANNELS;
}
