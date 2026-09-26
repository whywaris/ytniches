import type { Json } from "@/lib/supabase/database.types";

// Monetization.md §3.3 credit lifecycle, as a pure replay of the
// credit_events ledger (oldest first). Credits sit in three pools:
//   rollover -- last cycle's unused Team credits (one cycle only)
//   current  -- this cycle's allocation (plus refunds of spent credits)
//   topUp    -- grants; never expire
// Spending draws from whatever expires soonest: rollover, current, topUp.

export const CYCLE_CLOSE_KEY_PREFIX = "cycle-close:";

export interface LedgerEvent {
  event_type: "allocation" | "consumption" | "grant" | "refund" | "expiration";
  amount: number;
  idempotency_key: string | null;
  metadata?: Json;
}

export interface CreditPools {
  rollover: number;
  current: number;
  topUp: number;
  // Rollover depends on the plan of the cycle that's ending, recorded on
  // its allocation (metadata.rolloverCap).
  rolloverCap: number;
}

function capOf(metadata: Json | undefined): number {
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    const cap = metadata.rolloverCap;
    if (typeof cap === "number" && cap > 0) return cap;
  }
  return 0;
}

// Takes `amount` out of the pools in expiry order, never below zero.
function spend(pools: CreditPools, amount: number, order: ("rollover" | "current" | "topUp")[]) {
  let left = amount;
  for (const pool of order) {
    const take = Math.min(left, Math.max(0, pools[pool]));
    pools[pool] -= take;
    left -= take;
  }
}

export function settleLedger(events: LedgerEvent[]): CreditPools {
  const pools: CreditPools = { rollover: 0, current: 0, topUp: 0, rolloverCap: 0 };
  for (const event of events) {
    const amount = event.amount;
    if (amount >= 0) {
      if (event.event_type === "grant") pools.topUp += amount;
      else pools.current += amount;
      if (event.event_type === "allocation") pools.rolloverCap = capOf(event.metadata);
    } else if (event.idempotency_key?.startsWith(CYCLE_CLOSE_KEY_PREFIX)) {
      // A cycle boundary: whatever it didn't expire becomes rollover.
      spend(pools, -amount, ["rollover", "current"]);
      pools.rollover = pools.current;
      pools.current = 0;
    } else {
      spend(pools, -amount, ["rollover", "current", "topUp"]);
    }
  }
  return pools;
}

// What a cycle close expires: all of last cycle's rollover, and this
// cycle's unused credits beyond the rollover cap. Top-ups never expire.
export function cycleCloseExpiry(pools: CreditPools): number {
  const keep = Math.min(Math.max(0, pools.current), pools.rolloverCap);
  return Math.max(0, pools.rollover) + Math.max(0, pools.current - keep);
}
