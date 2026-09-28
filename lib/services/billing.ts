import * as billing from "@/lib/billing";
import { BETA_MODE } from "@/lib/billing/beta";
import type { ProviderSubscription, Tier as BillingTier } from "@/lib/billing";
import { getBalance } from "@/lib/credits";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { err, ok, type Result } from "@/lib/result";
import { getEffectivePlans, usersAffectedByPlanOf } from "@/lib/billing/effective-plan";
import { refreshCadenceHoursFor, TIER_INFO, TRIAL } from "@/lib/billing/plans";
import {
  CYCLE_CLOSE_KEY_PREFIX,
  cycleCloseExpiry,
  settleLedger,
  type LedgerEvent,
} from "@/lib/credits/ledger";
import { invalidateTierCache } from "@/lib/billing/tier-cache";
import type { RequestContext } from "@/lib/context";
import type { Database } from "@/lib/supabase/database.types";

export type Tier = BillingTier;
type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];
type ProviderDbStatus = Database["public"]["Enums"]["subscription_status"];

// Monetization.md §3.2: one-time trial grant, not a recurring per-cycle
// allocation -- doesn't live in credit_allocations (see Backend-Schema.md
// §2.5's note). Also the trial's tier limit for tracked channels
// (lib/services/channels.ts's TRACKED_CHANNELS_LIMIT) -- kept in sync by
// hand, same as every other cross-file constant in this codebase.
export const TRIAL_CREDITS = TRIAL.credits;

export type NoSubscriptionError = { type: "no_subscription" };

// Monetization.md §5.3/§6.1: "expired_trial"/"expired" have no
// subscription_status enum value -- computed from status + the relevant
// timestamp vs now(), never stored (Backend-Schema.md §2.3's note).
// "cancelling" is this module's own addition: cancelled_at is set (the
// user requested cancellation) but access continues because
// current_period_end hasn't passed yet (Monetization.md §6.1) -- maps to
// Creem's real subscription.scheduled_cancel event, which Monetization.md
// didn't originally name.
export type AccountState =
  "trialing" | "active" | "cancelling" | "past_due" | "paused" | "expired_trial" | "expired";

export interface SubscriptionStatus {
  tier: Tier;
  status: ProviderDbStatus;
  accountState: AccountState;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt: string | null;
  cancelledAt: string | null;
  providerSubscriptionId: string | null;
}

function computeAccountState(
  sub: {
    status: ProviderDbStatus;
    trialEndsAt: string | null;
    currentPeriodEnd: string;
    cancelledAt: string | null;
  },
  now: Date = new Date(),
): AccountState {
  if (sub.status === "trialing") {
    // D-081: the trial doesn't expire during the beta (D-057 paused).
    if (BETA_MODE) return "trialing";
    const trialOver = sub.trialEndsAt
      ? new Date(sub.trialEndsAt) <= now
      : new Date(sub.currentPeriodEnd) <= now;
    return trialOver ? "expired_trial" : "trialing";
  }
  if (sub.status === "cancelled") return "expired";
  if (sub.status === "past_due") return "past_due";
  if (sub.status === "paused") return "paused";
  // status === "active"
  if (new Date(sub.currentPeriodEnd) <= now) return "expired";
  if (sub.cancelledAt) return "cancelling";
  return "active";
}

async function getActiveSubscriptionRow(userId: string): Promise<SubscriptionRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("is_current", true)
    .maybeSingle();

  if (error) {
    throw new Error(`getActiveSubscriptionRow query failed: ${error.message}`);
  }
  return data;
}

export async function getSubscriptionStatus(
  ctx: RequestContext,
): Promise<SubscriptionStatus | null> {
  const row = await getActiveSubscriptionRow(ctx.userId);
  if (!row) return null;

  return {
    tier: row.tier as Tier,
    status: row.status,
    accountState: computeAccountState({
      status: row.status,
      trialEndsAt: row.trial_ends_at,
      currentPeriodEnd: row.current_period_end,
      cancelledAt: row.cancelled_at,
    }),
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    trialEndsAt: row.trial_ends_at,
    cancelledAt: row.cancelled_at,
    providerSubscriptionId: row.provider_subscription_id,
  };
}

// Monetization.md §4.4: user clicks Upgrade -> checkout session -> redirect
// to Creem's hosted page. successUrl reuses /settings/billing (Monetization
// §4.4 step 6 names a dedicated /billing/success page, but no such route
// exists in Application-Flow.md's route table -- not inventing one for
// this build).
export async function createCheckout(
  ctx: RequestContext,
  tier: Tier,
  billingFrequency: billing.BillingFrequency,
): Promise<Result<{ checkoutUrl: string }, { type: "no_email" } | { type: "beta" }>> {
  // D-081: no checkout during the beta, whatever the UI shows.
  if (BETA_MODE) return err({ type: "beta" });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return err({ type: "no_email" });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const session = await billing.createCheckoutSession({
    userId: ctx.userId,
    tier,
    billingFrequency,
    customerEmail: user.email,
    successUrl: `${siteUrl}/settings/billing?checkout=success`,
  });

  return ok({ checkoutUrl: session.checkoutUrl });
}

// Monetization.md §4.7/§6.1: Creem's real portal endpoint takes a Creem
// customer id, not our subscription id -- resolved via getSubscription
// first since we don't store the customer id ourselves.
export async function getBillingPortalUrl(
  ctx: RequestContext,
): Promise<Result<string, NoSubscriptionError>> {
  const row = await getActiveSubscriptionRow(ctx.userId);
  if (!row?.provider_subscription_id) {
    return err({ type: "no_subscription" });
  }

  const providerSub = await billing.getSubscription(row.provider_subscription_id);
  const url = await billing.createCustomerPortalUrl(providerSub.customerId);
  return ok(url);
}

// Monetization.md §6.1: always at period end, never immediate. The DB row
// itself updates when the resulting webhook (subscription.scheduled_cancel)
// arrives, not optimistically here -- webhook is source of truth
// (Application-Flow.md §4.5).
export async function cancelSubscription(
  ctx: RequestContext,
): Promise<Result<void, NoSubscriptionError>> {
  const row = await getActiveSubscriptionRow(ctx.userId);
  if (!row?.provider_subscription_id) {
    return err({ type: "no_subscription" });
  }

  await billing.cancelSubscription(row.provider_subscription_id, true);
  return ok(undefined);
}

function mapProviderStatus(status: billing.ProviderSubscriptionStatus): ProviderDbStatus {
  switch (status) {
    case "active":
    case "scheduled_cancel":
      // scheduled_cancel: still active until period end, cancelled_at
      // (set by upsertSubscriptionFromProvider below) is what marks the
      // pending cancellation -- computeAccountState reads that, not status.
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
    case "unpaid":
      // Both map to past_due -- graduated dunning bands (D-035, deferred)
      // aren't distinguished in Phase 1.
      return "past_due";
    case "paused":
      return "paused";
    case "canceled":
      return "cancelled";
  }
}

async function lookupUserIdByProviderSubscriptionId(
  providerSubscriptionId: string,
): Promise<string | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("provider_subscription_id", providerSubscriptionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`lookupUserIdByProviderSubscriptionId query failed: ${error.message}`);
  }
  return data?.user_id ?? null;
}

// Fallback for a subscription.* webhook whose product id isn't in
// products.ts's env-var map (e.g. a product added in Creem after deploy)
// -- falls back to whatever tier we already recorded for this
// subscription, rather than failing the whole event.
async function lookupTierByProviderSubscriptionId(
  providerSubscriptionId: string,
): Promise<Tier | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("tier")
    .eq("provider_subscription_id", providerSubscriptionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`lookupTierByProviderSubscriptionId query failed: ${error.message}`);
  }
  return (data?.tier as Tier | undefined) ?? null;
}

// Creates the subscription row on a first checkout, or updates it in place
// on every later event for the same Creem subscription (renewal, status
// change, plan change) -- provider_subscription_id has no unique
// constraint (Backend-Schema.md §2.3: historical rows are kept for audit,
// so it can't be one), so this is select-then-branch rather than a real
// upsert.
export async function upsertSubscriptionFromProvider(
  userId: string,
  tier: Tier,
  providerSub: ProviderSubscription,
): Promise<void> {
  const supabase = createServiceClient();
  const status = mapProviderStatus(providerSub.status);
  const fields = {
    tier,
    status,
    provider: "creem" as const,
    provider_subscription_id: providerSub.id,
    current_period_start: providerSub.currentPeriodStart,
    current_period_end: providerSub.currentPeriodEnd,
    cancelled_at: providerSub.canceledAt,
    // Real price from Creem's product data -- only written when present, so
    // an event carrying a bare product id never blanks a stored price.
    ...(providerSub.amountCents !== null && { amount_cents: providerSub.amountCents }),
    ...(providerSub.billingInterval !== null && { billing_interval: providerSub.billingInterval }),
  };

  const { data: existing, error: findError } = await supabase
    .from("subscriptions")
    .select("id, is_current")
    .eq("provider_subscription_id", providerSub.id)
    .maybeSingle();
  if (findError) {
    throw new Error(`upsertSubscriptionFromProvider lookup failed: ${findError.message}`);
  }

  if (existing) {
    const { error } = await supabase.from("subscriptions").update(fields).eq("id", existing.id);
    if (error) {
      throw new Error(`upsertSubscriptionFromProvider update failed: ${error.message}`);
    }
    // A retired row (e.g. the old plan after an upgrade, D-051) must not
    // override the current plan's cadence.
    if (existing.is_current) await reapplyPlanEffects(await usersAffectedByPlanOf(userId));
    await invalidateTierCache(userId);
    return;
  }

  // First time seeing this Creem subscription: retire whatever the user's
  // current row was (e.g. the trial row from completeOnboarding) and
  // insert the new one as current. Backend-Schema.md §2.3's
  // subscriptions_one_current_per_user unique index enforces "only one
  // current row" -- must clear the old one before inserting the new one,
  // not after.
  const { error: retireError } = await supabase
    .from("subscriptions")
    .update({ is_current: false })
    .eq("user_id", userId)
    .eq("is_current", true);
  if (retireError) {
    throw new Error(`upsertSubscriptionFromProvider retire failed: ${retireError.message}`);
  }

  const { error: insertError } = await supabase
    .from("subscriptions")
    .insert({ ...fields, user_id: userId, is_current: true });
  if (insertError) {
    throw new Error(`upsertSubscriptionFromProvider insert failed: ${insertError.message}`);
  }
  await reapplyPlanEffects(await usersAffectedByPlanOf(userId));
  await invalidateTierCache(userId);
}

// Pricing promise: Starter syncs every 24h, Pro every 6h, Team hourly
// (lib/billing/plans.ts). Each user's tracked channels follow their
// *effective* plan (D-059: a live Team workspace's owner plan counts for
// its members), re-applied whenever a plan or a workspace membership
// changes; takes effect at the next hourly cron tick (workers/cron.ts).
// Also drops their cached tier so feature gates switch right away.
export async function reapplyPlanEffects(userIds: string[]): Promise<void> {
  if (userIds.length === 0) return;
  const plans = await getEffectivePlans(userIds);
  const service = createServiceClient();
  for (const userId of userIds) {
    const plan = plans.get(userId);
    const cadence = refreshCadenceHoursFor(
      plan?.tier && plan.status ? { tier: plan.tier, status: plan.status } : null,
    );
    const { error } = await service
      .from("tracked_channels")
      .update({ refresh_cadence_hours: cadence })
      .eq("user_id", userId);
    if (error) throw new Error(`reapplyPlanEffects failed: ${error.message}`);
    await invalidateTierCache(userId);
  }
}

// Monetization.md §3.2's recurring per-cycle amounts (starter=200/
// pro=1000/team=3000) -- NOT the one-time trial grant (TRIAL_CREDITS
// above), which never goes through this function.
//
// cycleKey scopes the idempotency_key to a specific billing cycle
// (`<providerSubscriptionId>:<currentPeriodStart>`), passed by the caller
// (the webhook handler) rather than generated here -- a duplicate
// checkout.completed + subscription.paid pair for the same cycle (Creem
// fires both on a first payment) collapses to one allocation via
// credit_events' unique idempotency_key index, on top of (not instead of)
// webhook_events' own provider_event_id dedup.
//
// Every allocation first closes the previous cycle (D-063): unused credits
// expire, except Team's rollover and top-ups (lib/credits/ledger.ts). Both
// writes are keyed on cycleKey, so a retry never expires or allocates twice,
// and the close always lands before the new allocation it must not touch.
export async function allocateCycleCredits(
  userId: string,
  tier: Tier,
  cycleKey: string,
): Promise<void> {
  const supabase = createServiceClient();
  const { data: allocation, error: allocationError } = await supabase
    .from("credit_allocations")
    .select("credits_per_cycle")
    .eq("tier", tier)
    .is("user_id", null)
    .order("effective_from", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (allocationError) {
    throw new Error(`allocateCycleCredits allocation lookup failed: ${allocationError.message}`);
  }
  if (!allocation) {
    throw new Error(`allocateCycleCredits: no credit_allocations row for tier=${tier}`);
  }

  await closeCreditCycle(userId, cycleKey);

  const { error } = await supabase.from("credit_events").insert({
    user_id: userId,
    event_type: "allocation",
    amount: allocation.credits_per_cycle,
    reason: `Monthly ${tier} allocation`,
    idempotency_key: `creem:allocation:${cycleKey}`,
    // The rollover this cycle earns is decided by the plan it was on.
    metadata: { tier, rolloverCap: rolloverCapFor(tier) },
  });
  if (error) {
    if (error.code === "23505") return; // already allocated for this cycle
    throw new Error(`allocateCycleCredits insert failed: ${error.message}`);
  }
}

// D-081: during the beta the trial never ends, and its credits refill
// monthly -- the same close-then-allocate as a paid cycle, for
// TRIAL.credits. Month 0 is the grant at trial start; cycleKey names the
// month, so a re-run never allocates twice.
export async function allocateBetaTrialCredits(userId: string, cycleKey: string): Promise<void> {
  await closeCreditCycle(userId, cycleKey);
  const { error } = await createServiceClient()
    .from("credit_events")
    .insert({
      user_id: userId,
      event_type: "allocation",
      amount: TRIAL.credits,
      reason: "Monthly beta trial credits",
      idempotency_key: `beta:allocation:${cycleKey}`,
      metadata: { tier: TRIAL.tier, rolloverCap: 0 },
    });
  if (error && error.code !== "23505") {
    throw new Error(`allocateBetaTrialCredits insert failed: ${error.message}`);
  }
}

function rolloverCapFor(tier: Tier): number {
  return tier === "team" ? TIER_INFO.team.rolloverCredits : 0;
}

const LEDGER_PAGE = 1000;

// The whole ledger, oldest first, paged past PostgREST's row cap.
async function readLedger(userId: string): Promise<{ events: LedgerEvent[]; balance: number }> {
  const supabase = createServiceClient();
  const events: LedgerEvent[] = [];
  for (let from = 0; ; from += LEDGER_PAGE) {
    const { data, error } = await supabase
      .from("credit_events")
      .select("event_type, amount, idempotency_key, metadata")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(from, from + LEDGER_PAGE - 1);
    if (error) throw new Error(`readLedger failed: ${error.message}`);
    events.push(...data);
    if (data.length < LEDGER_PAGE) break;
  }
  return { events, balance: events.reduce((sum, event) => sum + event.amount, 0) };
}

async function closeCreditCycle(userId: string, cycleKey: string): Promise<void> {
  const { events, balance } = await readLedger(userId);
  // Never below zero, even after a (rare) concurrent-spend overdraft.
  const expire = Math.min(cycleCloseExpiry(settleLedger(events)), Math.max(0, balance));

  // Written even when nothing expires: the row marks the cycle boundary
  // the ledger replay uses to tell rollover from this cycle's credits.
  const { error } = await createServiceClient()
    .from("credit_events")
    .insert({
      user_id: userId,
      event_type: "expiration",
      amount: -expire,
      reason: "Unused credits expired at cycle end",
      idempotency_key: `${CYCLE_CLOSE_KEY_PREFIX}${cycleKey}`,
    });
  if (error && error.code !== "23505") {
    throw new Error(`closeCreditCycle insert failed: ${error.message}`);
  }
}

// Monetization.md §6.3 step 5 / §4.5's refund.issued row: "adjust credit
// balance (unused portion removed)". Credits are a ledger, not a fixed
// pool, so there's no literal "unused portion of this purchase" once
// mixed with other consumption -- pragmatic rule: zero out up to that
// cycle's full allocation, never going negative.
export async function handleRefund(
  providerSubscriptionId: string,
  refundEventId: string,
): Promise<void> {
  const supabase = createServiceClient();
  const { data: row, error } = await supabase
    .from("subscriptions")
    .select("user_id, tier")
    .eq("provider_subscription_id", providerSubscriptionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    throw new Error(`handleRefund subscription lookup failed: ${error.message}`);
  }
  if (!row) return; // nothing to adjust if we can't tie the refund to a known subscription

  const { data: allocation, error: allocationError } = await supabase
    .from("credit_allocations")
    .select("credits_per_cycle")
    .eq("tier", row.tier)
    .is("user_id", null)
    .order("effective_from", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (allocationError) {
    throw new Error(`handleRefund allocation lookup failed: ${allocationError.message}`);
  }

  const balance = await getBalance({ userId: row.user_id, workspaceId: null, tier: null });
  const cycleAllocation = allocation?.credits_per_cycle ?? 0;
  const reduceBy = Math.min(balance, cycleAllocation);
  if (reduceBy <= 0) return;

  const { error: insertError } = await supabase.from("credit_events").insert({
    user_id: row.user_id,
    event_type: "expiration",
    amount: -reduceBy,
    reason: "Refund issued",
    idempotency_key: `creem:refund:${refundEventId}`,
  });
  if (insertError) {
    if (insertError.code === "23505") return;
    throw new Error(`handleRefund insert failed: ${insertError.message}`);
  }
}

export { lookupUserIdByProviderSubscriptionId, lookupTierByProviderSubscriptionId };
