// Pure admin KPI math (PRD.md §9.1/§9.4) -- no I/O, unit-tested. Revenue
// comes only from the stored Creem price (amount_cents + billing_interval),
// never inferred from period length.

export interface SubscriptionFact {
  userId: string;
  tier: string;
  status: string;
  /** null = our internal trial row (no Creem subscription behind it). */
  providerSubscriptionId: string | null;
  amountCents: number | null;
  billingInterval: string | null;
  createdAt: string;
  cancelledAt: string | null;
}

export function monthlyAmountCents(amountCents: number, billingInterval: string): number {
  return billingInterval === "year" ? amountCents / 12 : amountCents;
}

function isPaid(sub: SubscriptionFact): boolean {
  return sub.providerSubscriptionId !== null && sub.status !== "trialing";
}

// A paid subscription contributes to MRR at time `at` if it existed then,
// wasn't cancelled yet, and isn't cancelled/paused now. Rows retired by an
// upgrade but never cancelled in Creem still count -- Creem still bills
// them (see D-051).
function contributesAt(sub: SubscriptionFact, at: Date): boolean {
  if (!isPaid(sub) || sub.amountCents === null || sub.billingInterval === null) return false;
  if (sub.status === "cancelled" || sub.status === "paused") return false;
  if (new Date(sub.createdAt) > at) return false;
  return sub.cancelledAt === null || new Date(sub.cancelledAt) > at;
}

export function mrrCentsAt(subs: SubscriptionFact[], at: Date): number {
  return subs
    .filter((sub) => contributesAt(sub, at))
    .reduce((sum, sub) => sum + monthlyAmountCents(sub.amountCents!, sub.billingInterval!), 0);
}

export function mrrByTierCents(subs: SubscriptionFact[], at: Date): Record<string, number> {
  const byTier: Record<string, number> = {};
  for (const sub of subs.filter((s) => contributesAt(s, at))) {
    byTier[sub.tier] =
      (byTier[sub.tier] ?? 0) + monthlyAmountCents(sub.amountCents!, sub.billingInterval!);
  }
  return byTier;
}

// Month-end points (UTC), oldest first, the last one being `now`.
// ponytail: uses each row's *current* status, so a row that was past_due
// in March but active today is counted as active in March too -- fine
// until there's enough history for that to matter; the fix is a status
// history table.
export function mrrSeries(
  subs: SubscriptionFact[],
  months: number,
  now: Date,
): { month: string; mrrCents: number }[] {
  return Array.from({ length: months }, (_, index) => {
    const monthsBack = months - 1 - index;
    const at =
      monthsBack === 0
        ? now
        : new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsBack + 1, 0, 23, 59, 59),
          );
    return { month: at.toISOString().slice(0, 7), mrrCents: mrrCentsAt(subs, at) };
  });
}

// Share of users who had a trial and went on to a paid subscription.
export function trialConversionRate(subs: SubscriptionFact[]): number | null {
  const trialUsers = new Set(
    subs.filter((sub) => sub.providerSubscriptionId === null).map((sub) => sub.userId),
  );
  if (trialUsers.size === 0) return null;
  const paidUsers = new Set(subs.filter(isPaid).map((sub) => sub.userId));
  const converted = [...trialUsers].filter((userId) => paidUsers.has(userId)).length;
  return converted / trialUsers.size;
}

// Paid subscriptions cancelled in the window / paid subscriptions active at
// the window's start.
export function churnRate(subs: SubscriptionFact[], windowDays: number, now: Date): number | null {
  const start = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);
  const activeAtStart = subs.filter(
    (sub) =>
      isPaid(sub) &&
      new Date(sub.createdAt) <= start &&
      (sub.cancelledAt === null || new Date(sub.cancelledAt) > start),
  );
  if (activeAtStart.length === 0) return null;
  const cancelled = activeAtStart.filter(
    (sub) => sub.cancelledAt !== null && new Date(sub.cancelledAt) <= now,
  );
  return cancelled.length / activeAtStart.length;
}

export function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function formatPercent(value: number | null): string {
  return value === null ? "—" : `${(value * 100).toFixed(1)}%`;
}
