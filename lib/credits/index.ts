import { createClient } from "@/lib/supabase/server";
import { err, ok, type Result } from "@/lib/result";
import type { RequestContext } from "@/lib/context";

// Backend-Schema.md §2.5: balance is derived, never stored — SUM(amount)
// WHERE user_id = ? AND created_at >= cycle_start.
export interface InsufficientCreditsError {
  type: "insufficient_credits";
  balance: number;
  required: number;
}

// Isolated on its own so the Task 5 swap to subscriptions.current_period_start
// (Monetization.md §3.3: credits allocate on the billing anniversary, not
// the calendar month) is a one-line change, not a rewrite. UTC month start
// is a correct proxy in the meantime — no billing cycle exists yet.
function getCycleStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export async function getBalance(ctx: RequestContext): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("credit_events")
    .select("amount")
    .eq("user_id", ctx.userId)
    .gte("created_at", getCycleStart().toISOString());

  if (error) {
    throw new Error(`getBalance query failed: ${error.message}`);
  }

  return data.reduce((sum, row) => sum + row.amount, 0);
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
