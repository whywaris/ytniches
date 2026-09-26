import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  DEFAULT_REFRESH_CADENCE_HOURS,
  refreshCadenceHoursFor,
  TIER_INFO,
  TRIAL,
  TRIAL_PITCH,
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
      "Email digests",
    ]);
    expect(TIER_INFO.team.features).toEqual([
      "3,000 credits / month",
      "Track up to 100 channels",
      "Refreshes hourly",
      "3 seats included",
      "Up to 500 unused credits roll over",
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

describe("trial (D-060)", () => {
  it("syncs at Pro's cadence, and the backfill migration agrees", () => {
    expect(TRIAL.refreshCadenceHours).toBe(TIER_INFO.pro.refreshCadenceHours);
    const backfill = readFileSync(
      path.join(process.cwd(), "supabase", "migrations", "20260926100000_trial_cadence.sql"),
      "utf8",
    );
    expect(backfill).toContain(`set refresh_cadence_hours = ${TRIAL.refreshCadenceHours}`);
    expect(backfill).toContain("s.status = 'trialing'");
    expect(refreshCadenceHoursFor({ tier: "pro", status: "trialing" })).toBe(6);
  });

  it("is pitched one way, from one constant", () => {
    expect(TRIAL_PITCH).toBe("Try every Pro feature free for 14 days");
  });

  it("never says 'full Pro access' anywhere in the product", () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const full = path.join(dir, name);
        if (statSync(full).isDirectory()) walk(full);
        else if (
          /\.(tsx?|mdx)$/.test(name) &&
          /full pro (access|plan)/i.test(readFileSync(full, "utf8"))
        ) {
          offenders.push(path.relative(process.cwd(), full));
        }
      }
    };
    for (const dir of ["app", "components", "content", "lib"]) walk(path.join(process.cwd(), dir));
    expect(offenders).toEqual([]);
  });
});
