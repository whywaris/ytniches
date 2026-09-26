import { isAnnualPeriod, monthsElapsed } from "@/lib/billing/cycles";
import { inngest } from "@/lib/inngest/client";
import { allocateCycleCredits, type Tier } from "@/lib/services/billing";
import { createServiceClient } from "@/lib/supabase/service";

// D-063 / Monetization.md §3.3: credits are monthly on every plan. Monthly
// subscribers get them from the renewal webhook; annual subscribers only
// renew once a year, so this job allocates months 2-12. Each month closes
// the previous one like a renewal does (allocateCycleCredits), keyed on
// subscription + period + month, so re-runs never double-allocate.

export interface AnnualSubscription {
  user_id: string;
  tier: Tier;
  provider_subscription_id: string;
  current_period_start: string;
  current_period_end: string;
}

// Which month of the paid year is due now (1-11), or null. Month 0 is the
// webhook's allocation at purchase or renewal.
export function dueAnnualMonth(sub: AnnualSubscription, now: Date): number | null {
  if (!isAnnualPeriod(sub.current_period_start, sub.current_period_end)) return null;
  if (now >= new Date(sub.current_period_end)) return null;
  const month = monthsElapsed(new Date(sub.current_period_start), now);
  return month >= 1 && month <= 11 ? month : null;
}

async function findLiveSubscriptions(): Promise<AnnualSubscription[]> {
  const { data, error } = await createServiceClient()
    .from("subscriptions")
    .select("user_id, tier, provider_subscription_id, current_period_start, current_period_end")
    .eq("is_current", true)
    .eq("status", "active")
    .not("provider_subscription_id", "is", null);
  if (error) throw new Error(`findLiveSubscriptions failed: ${error.message}`);
  return data.flatMap(({ tier, provider_subscription_id, ...row }) =>
    provider_subscription_id && tier !== "free" ? [{ ...row, tier, provider_subscription_id }] : [],
  );
}

interface CreditCycleStepTools {
  // `unknown` for the same reason as workers/cron.ts's CronStepTools.
  run: (id: string, fn: () => Promise<unknown>) => Promise<unknown>;
}

export async function allocateAnnualMonthlyCredits(
  step: CreditCycleStepTools,
  now: Date = new Date(),
): Promise<{ due: number }> {
  const subs = (await step.run(
    "find-live-subscriptions",
    findLiveSubscriptions,
  )) as AnnualSubscription[];
  let due = 0;
  for (const sub of subs) {
    const month = dueAnnualMonth(sub, now);
    if (month === null) continue;
    const cycleKey = `${sub.provider_subscription_id}:${sub.current_period_start}:month-${month}`;
    await step.run(`allocate-${cycleKey}`, () =>
      allocateCycleCredits(sub.user_id, sub.tier, cycleKey),
    );
    due += 1;
  }
  return { due };
}

export const annualCreditsCron = inngest.createFunction(
  { id: "annual-monthly-credits-cron", triggers: [{ cron: "30 * * * *" }] },
  async ({ step }) => allocateAnnualMonthlyCredits(step),
);
