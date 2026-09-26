import { describe, expect, it } from "vitest";

import {
  CYCLE_CLOSE_KEY_PREFIX,
  cycleCloseExpiry,
  settleLedger,
  type LedgerEvent,
} from "@/lib/credits/ledger";

const allocation = (amount: number, rolloverCap = 0): LedgerEvent => ({
  event_type: "allocation",
  amount,
  idempotency_key: null,
  metadata: { rolloverCap },
});
const spend = (amount: number): LedgerEvent => ({
  event_type: "consumption",
  amount: -amount,
  idempotency_key: null,
});
const grant = (amount: number): LedgerEvent => ({
  event_type: "grant",
  amount,
  idempotency_key: null,
});

// Replays like allocateCycleCredits: expire, then write the boundary row.
function close(events: LedgerEvent[], n: number): LedgerEvent[] {
  const expire = cycleCloseExpiry(settleLedger(events));
  return [
    ...events,
    { event_type: "expiration", amount: -expire, idempotency_key: `${CYCLE_CLOSE_KEY_PREFIX}${n}` },
  ];
}
const balance = (events: LedgerEvent[]) => events.reduce((sum, event) => sum + event.amount, 0);

describe("credit cycle close", () => {
  it("expires all unused monthly credits on Starter/Pro", () => {
    const ledger = close([allocation(200), spend(50)], 1);
    expect(balance(ledger)).toBe(0);
  });

  it("rolls over Team's unused credits up to the cap", () => {
    expect(balance(close([allocation(3000, 500), spend(100)], 1))).toBe(500);
    expect(balance(close([allocation(3000, 500), spend(2800)], 1))).toBe(200);
  });

  it("rollover lasts one cycle and doesn't stack", () => {
    let ledger = close([allocation(3000, 500)], 1); // 500 rolls over
    ledger = [...ledger, allocation(3000, 500)];
    ledger = close(ledger, 2); // old 500 expires; new cycle keeps at most 500
    expect(balance(ledger)).toBe(500);
  });

  it("spends rollover before this cycle's credits", () => {
    let ledger = close([allocation(3000, 500)], 1);
    ledger = [...ledger, allocation(3000, 500), spend(600)]; // 500 rollover + 100 new
    expect(balance(close(ledger, 2))).toBe(500); // 2,900 new unused -> keep 500
  });

  it("never expires top-ups, and spends them last", () => {
    let ledger = close([allocation(200), grant(40), spend(50)], 1);
    expect(balance(ledger)).toBe(40);
    ledger = [...ledger, allocation(200), spend(220)]; // 200 monthly + 20 top-up
    expect(balance(close(ledger, 2))).toBe(20);
  });

  it("never expires more than is left", () => {
    expect(balance(close([allocation(200), spend(200)], 1))).toBe(0);
    // A concurrent-spend overdraft: nothing left to expire.
    expect(balance(close([allocation(200), spend(210)], 1))).toBe(-10);
  });

  it("uses the ending cycle's plan: no rollover after a Pro cycle", () => {
    const ledger = close([allocation(1000, 0)], 1);
    expect(balance(ledger)).toBe(0);
  });
});
