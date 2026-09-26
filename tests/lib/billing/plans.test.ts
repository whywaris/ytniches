import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  DEFAULT_REFRESH_CADENCE_HOURS,
  refreshCadenceHoursFor,
  TIER_INFO,
  TRIAL,
} from "@/lib/billing/plans";

const migration = readFileSync(
  path.join(process.cwd(), "supabase", "migrations", "20260925120000_pricing_promises.sql"),
  "utf8",
);

describe("migration matches lib/billing/plans.ts", () => {
  it.each(Object.entries(TIER_INFO))("seeds %s with its monthly credits", (tier, info) => {
    expect(migration).toContain(`('${tier}', ${info.monthlyCredits})`);
  });

  it("backfills cadences equal to the plans", () => {
    expect(migration).toContain(`s.tier = 'pro' then ${TIER_INFO.pro.refreshCadenceHours}`);
    expect(migration).toContain(`s.tier = 'team' then ${TIER_INFO.team.refreshCadenceHours}`);
    expect(migration).toMatch(new RegExp(`else ${DEFAULT_REFRESH_CADENCE_HOURS}\\s`));
    expect(TRIAL.refreshCadenceHours).toBe(DEFAULT_REFRESH_CADENCE_HOURS);
    expect(TIER_INFO.starter.refreshCadenceHours).toBe(DEFAULT_REFRESH_CADENCE_HOURS);
  });
});

describe("pricing cards are derived from the numbers", () => {
  it("renders the same bullets the cards always showed", () => {
    expect(TIER_INFO.starter.features).toEqual([
      "200 credits / month",
      "Track up to 10 channels",
      "Refreshes every 24 hours",
    ]);
    expect(TIER_INFO.pro.features).toEqual([
      "1,000 credits / month",
      "Track up to 50 channels",
      "Refreshes every 6 hours",
      "Priority AI generation",
      "Email digests",
    ]);
    expect(TIER_INFO.team.features).toEqual([
      "3,000 credits / month",
      "Track up to 100 channels",
      "Refreshes hourly",
      "3 seats included",
    ]);
  });

  it("never advertises per-seat pricing (no seat purchasing exists)", () => {
    for (const info of Object.values(TIER_INFO)) {
      for (const feature of info.features) expect(feature).not.toMatch(/\$|per (extra )?seat/i);
    }
  });
});

describe("refreshCadenceHoursFor", () => {
  it.each([
    [{ tier: "team", status: "past_due" }, 1],
    [{ tier: "team", status: "paused" }, 24],
    [{ tier: "nope", status: "active" }, 24],
    [undefined, 24],
  ])("%o -> %i h", (subscription, hours) => {
    expect(refreshCadenceHoursFor(subscription)).toBe(hours);
  });
});
