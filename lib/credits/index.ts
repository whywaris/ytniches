import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { err, ok, type Result } from "@/lib/result";
import type { RequestContext } from "@/lib/context";

// Backend-Schema.md §2.5: balance is derived, never stored — SUM(amount)
// WHERE user_id = ? AND created_at >= cycle_start.
export interface InsufficientCreditsError {
  type: "insufficient_credits";
  balance: number;
  required: number;
}

// Task 5: reads the user's active subscription's current_period_start
// (Monetization.md §3.3: credits allocate on the billing anniversary, not
// the calendar month). Falls back to UTC month start if no subscription
// row exists yet -- shouldn't happen once completeOnboarding() always
// creates a trial row, but keeps this safe for any user who predates it.
async function getCycleStart(userId: string): Promise<Date> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("current_period_start")
    .eq("user_id", userId)
    .eq("is_current", true)
    .maybeSingle();

  if (error) {
    throw new Error(`getCycleStart subscription query failed: ${error.message}`);
  }
  if (data?.current_period_start) {
    return new Date(data.current_period_start);
  }

  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export async function getBalance(ctx: RequestContext): Promise<number> {
  const cycleStart = await getCycleStart(ctx.userId);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("credit_events")
    .select("amount")
    .eq("user_id", ctx.userId)
    .gte("created_at", cycleStart.toISOString());

  if (error) {
    throw new Error(`getBalance query failed: ${error.message}`);
  }

  return data.reduce((sum, row) => sum + row.amount, 0);
}

// UI-UX-Flow.md §4.5's dashboard metric card. Sum of only 'consumption'
// events since cycle start, as a positive number -- getBalance above sums
// every event type (allocation, consumption, refund) to get the current
// balance, which isn't the same number.
export async function getCreditsUsedThisMonth(ctx: RequestContext): Promise<number> {
  const cycleStart = await getCycleStart(ctx.userId);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("credit_events")
    .select("amount")
    .eq("user_id", ctx.userId)
    .eq("event_type", "consumption")
    .gte("created_at", cycleStart.toISOString());

  if (error) {
    throw new Error(`getCreditsUsedThisMonth query failed: ${error.message}`);
  }

  return data.reduce((sum, row) => sum - row.amount, 0);
}

// TOCTOU: balance check and insert are not atomic.
// Small overdraft possible under concurrent requests.
// Acceptable for trial credits; revisit when billing
// lands in Task 5 (use a serializable transaction or
// a DB-level balance column with a CHECK constraint).
export async function consume(
  ctx: RequestContext,
  amount: number,
  reason: string,
  idempotencyKey: string,
): Promise<Result<void, InsufficientCreditsError>> {
  const balance = await getBalance(ctx);

  if (balance < amount) {
    return err({ type: "insufficient_credits", balance, required: amount });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("credit_events").insert({
    user_id: ctx.userId,
    event_type: "consumption",
    amount: -amount,
    reason,
    idempotency_key: idempotencyKey,
  });

  if (error) {
    // TRD.md §3.4: a retried request with the same idempotency_key hits the
    // unique partial index (credit_events_idempotency_key_idx) and should
    // return the original success, not an error.
    if (error.code === "23505") {
      return ok(undefined);
    }
    throw new Error(`consume insert failed: ${error.message}`);
  }

  return ok(undefined);
}

// D-027/Monetization.md §3.3: "Refunded automatically if action fails."
// Service role, not the session client -- the `users_insert_own_consumption`
// RLS policy deliberately only allows `authenticated` to insert their own
// negative-amount 'consumption' rows, never a 'refund' row (a user must
// never be able to self-issue a refund). This makes the caller's own
// success/failure check the trust boundary, not RLS -- only call this after
// confirming the paid action actually failed. The ledger row itself is the
// audit trail (CLAUDE.md §4.2's "admin action -> service role + audit log").
//
// `relatedIdempotencyKey` must be the SAME key passed to the original
// consume() call, suffixed here -- idempotency_key has a table-wide unique
// index (not scoped per event_type), so reusing the bare key would collide
// with the consumption row it's refunding.
export async function refund(
  ctx: RequestContext,
  amount: number,
  reason: string,
  relatedIdempotencyKey: string,
): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase.from("credit_events").insert({
    user_id: ctx.userId,
    event_type: "refund",
    amount,
    reason,
    idempotency_key: `${relatedIdempotencyKey}:refund`,
  });

  if (error) {
    if (error.code === "23505") {
      return; // already refunded for this action -- idempotent no-op
    }
    throw new Error(`refund insert failed: ${error.message}`);
  }
}
