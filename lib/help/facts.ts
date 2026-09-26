import { TIER_INFO, TIERS, TRIAL, TRIAL_PITCH } from "@/lib/billing/plans";
import { REFUND_POLICY } from "@/lib/billing/refund-policy";
import { CREDIT_COSTS, FAIR_USE } from "@/lib/credits/costs";
import { DIGEST_ITEM_LIMIT, DIGEST_LOCAL_HOUR } from "@/lib/notifications/digest-config";
import {
  BASELINE_MIN_VIDEOS,
  BASELINE_WINDOW,
  OUTLIER_THRESHOLD_MULTIPLIER,
  RECENCY_DECAY_DAYS,
  TRENDING_WINDOW_DAYS,
} from "@/lib/outliers/scoring";
import { SUPPORT_EMAIL } from "@/lib/site";
import {
  CADENCE_CHANGE_THRESHOLD_PER_WEEK,
  CADENCE_WINDOW_WEEKS,
  VIEW_MILESTONES,
} from "@/lib/tracking/thresholds";

// PRD.md §10.4 accuracy rule: every number in a help article comes from
// here, and everything here comes from the constants the product itself
// runs on. Articles use <Fact k="..."/> and never type a number, so a
// price or limit change can't leave the help center out of date
// (tests/content/help.test.ts rejects digits in article prose).

// The database sets invite expiry (workspace_invitations.expires_at
// default); nothing in TS reads it, so it is mirrored here for the help
// center. tests/lib/help/sql-mirrors.test.ts keeps the two equal.
export const INVITE_EXPIRY_DAYS = 7;

const number = (value: number) => value.toLocaleString("en-US");
const dollars = (value: number) => `$${number(value)}`;
const sync = (hours: number) => (hours === 1 ? "every hour" : `every ${hours} hours`);
const clock = (hour: number) => `${hour % 12 || 12} ${hour < 12 ? "am" : "pm"}`;

const planFacts = Object.fromEntries(
  TIERS.flatMap((tier) => {
    const info = TIER_INFO[tier];
    return [
      [`plan.${tier}.name`, info.label],
      [`plan.${tier}.monthlyPrice`, dollars(info.monthlyPrice)],
      [`plan.${tier}.yearlyPrice`, dollars(info.yearlyPrice)],
      [`plan.${tier}.credits`, info.monthlyCredits],
      [`plan.${tier}.channels`, info.trackedChannels],
      [`plan.${tier}.sync`, sync(info.refreshCadenceHours)],
    ];
  }),
);

export const FACTS: Record<string, string | number> = {
  "credits.nicheSearch": CREDIT_COSTS.nicheSearch,
  "credits.promptGenerate": CREDIT_COSTS.promptGenerate,
  "credits.promptRegenerate": CREDIT_COSTS.promptRegenerate,
  "credits.thumbnailIdeas": CREDIT_COSTS.thumbnailIdeas,
  "credits.thumbnailIdeasRegenerate": CREDIT_COSTS.thumbnailIdeasRegenerate,
  "fairUse.searchesPerHour": FAIR_USE.nicheSearchesPerHour,

  "trial.pitch": TRIAL_PITCH,
  "trial.days": TRIAL.days,
  "trial.credits": TRIAL.credits,
  "trial.plan": TIER_INFO[TRIAL.tier].label,
  "trial.sync": sync(TRIAL.refreshCadenceHours),

  ...planFacts,
  "team.seats": TIER_INFO.team.seats,
  "team.pool": TIER_INFO.team.trackedChannels,

  "outliers.multiplier": `${OUTLIER_THRESHOLD_MULTIPLIER}×`,
  "outliers.baselineWindow": BASELINE_WINDOW,
  "outliers.minPrior": BASELINE_MIN_VIDEOS,
  "outliers.decayDays": RECENCY_DECAY_DAYS,

  "tracking.milestones": new Intl.ListFormat("en-US").format(VIEW_MILESTONES.map(number)),
  "tracking.cadenceThreshold": CADENCE_CHANGE_THRESHOLD_PER_WEEK,
  "tracking.cadenceWindowWeeks": CADENCE_WINDOW_WEEKS,
  "outliers.trendingDays": TRENDING_WINDOW_DAYS,

  "invites.expiryDays": INVITE_EXPIRY_DAYS,

  "digest.time": clock(DIGEST_LOCAL_HOUR),
  "digest.items": DIGEST_ITEM_LIMIT,

  "refunds.guaranteeDays": REFUND_POLICY.guaranteeDays,
  "refunds.annualWindowDays": REFUND_POLICY.annualProRataWindowDays,

  "support.email": SUPPORT_EMAIL,
};

// "1 credit", "5 credits". Strings (prices, lists, sentences) pass through.
export function formatFact(key: string, unit?: string): string {
  if (!(key in FACTS)) throw new Error(`Unknown help fact "${key}"`);
  const value = FACTS[key];
  if (typeof value === "string") return value;
  const text = number(value);
  return unit ? `${text} ${value === 1 ? unit : `${unit}s`}` : text;
}
