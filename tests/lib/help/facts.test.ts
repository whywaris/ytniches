import { describe, expect, it } from "vitest";

import { TIER_INFO, TRIAL, TRIAL_PITCH } from "@/lib/billing/plans";
import { CREDIT_COSTS } from "@/lib/credits/costs";
import { FACTS, formatFact } from "@/lib/help/facts";

describe("formatFact", () => {
  it("reads the product's own constants", () => {
    expect(FACTS["credits.promptGenerate"]).toBe(CREDIT_COSTS.promptGenerate);
    expect(FACTS["plan.pro.credits"]).toBe(TIER_INFO.pro.monthlyCredits);
    expect(FACTS["team.pool"]).toBe(TIER_INFO.team.trackedChannels);
    expect(FACTS["trial.pitch"]).toBe(TRIAL_PITCH);
    expect(FACTS["trial.days"]).toBe(TRIAL.days);
  });

  it("pluralizes units", () => {
    expect(formatFact("credits.nicheSearch", "credit")).toBe(
      `${CREDIT_COSTS.nicheSearch} credit${CREDIT_COSTS.nicheSearch === 1 ? "" : "s"}`,
    );
    expect(formatFact("plan.team.credits", "credit")).toBe(
      `${TIER_INFO.team.monthlyCredits.toLocaleString("en-US")} credits`,
    );
  });

  it("formats prices and sync cadence", () => {
    expect(formatFact("plan.starter.monthlyPrice")).toBe(`$${TIER_INFO.starter.monthlyPrice}`);
    expect(formatFact("plan.team.sync")).toBe(
      TIER_INFO.team.refreshCadenceHours === 1
        ? "every hour"
        : `every ${TIER_INFO.team.refreshCadenceHours} hours`,
    );
  });

  it("fails loudly on an unknown key, so a typo breaks the build", () => {
    expect(() => formatFact("credits.nope")).toThrow(/Unknown help fact/);
  });
});
