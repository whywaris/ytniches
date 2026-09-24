import { describe, expect, it } from "vitest";

import {
  churnRate,
  formatUsd,
  mrrByTierCents,
  mrrCentsAt,
  mrrSeries,
  trialConversionRate,
  type SubscriptionFact,
} from "@/lib/admin-metrics";

const now = new Date("2026-09-24T12:00:00Z");

function sub(overrides: Partial<SubscriptionFact>): SubscriptionFact {
  return {
    userId: "u1",
    tier: "pro",
    status: "active",
    providerSubscriptionId: "sub_1",
    amountCents: 4900,
    billingInterval: "month",
    createdAt: "2026-09-01T00:00:00Z",
    cancelledAt: null,
    ...overrides,
  };
}

describe("MRR", () => {
  it("counts one Pro monthly at $49 as $49", () => {
    expect(mrrCentsAt([sub({})], now)).toBe(4900);
    expect(formatUsd(mrrCentsAt([sub({})], now))).toBe("$49");
  });

  it("divides a yearly price by 12", () => {
    expect(mrrCentsAt([sub({ amountCents: 46800, billingInterval: "year" })], now)).toBe(3900);
  });

  it("excludes trial rows, trialing, cancelled and unpriced subscriptions", () => {
    const subs = [
      sub({ providerSubscriptionId: null }),
      sub({ status: "trialing" }),
      sub({ status: "cancelled", cancelledAt: "2026-09-10T00:00:00Z" }),
      sub({ amountCents: null }),
    ];
    expect(mrrCentsAt(subs, now)).toBe(0);
  });

  it("splits by tier and builds a month-end series ending now", () => {
    const subs = [sub({}), sub({ userId: "u2", tier: "team", amountCents: 9900 })];
    expect(mrrByTierCents(subs, now)).toEqual({ pro: 4900, team: 9900 });
    expect(mrrSeries(subs, 2, now)).toEqual([
      { month: "2026-08", mrrCents: 0 },
      { month: "2026-09", mrrCents: 14800 },
    ]);
  });
});

describe("conversion + churn", () => {
  it("measures trial users who later paid", () => {
    const subs = [
      sub({ providerSubscriptionId: null }),
      sub({}),
      sub({ userId: "u2", providerSubscriptionId: null }),
    ];
    expect(trialConversionRate(subs)).toBe(0.5);
    expect(trialConversionRate([sub({})])).toBeNull();
  });

  it("measures paid subscriptions cancelled inside the window", () => {
    const subs = [
      sub({ createdAt: "2026-07-01T00:00:00Z" }),
      sub({ userId: "u2", createdAt: "2026-07-01T00:00:00Z", cancelledAt: "2026-09-20T00:00:00Z" }),
    ];
    expect(churnRate(subs, 30, now)).toBe(0.5);
    expect(churnRate([], 30, now)).toBeNull();
  });
});
