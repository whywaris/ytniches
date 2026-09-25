import { describe, expect, it } from "vitest";

import { COMPETITOR_PAGES } from "@/content/vs";
import { YTNICHES } from "@/content/vs/ytniches";
import { COMPETITORS } from "@/components/features/landing/content";

const MAX_AGE_DAYS = 180;
const DAY_MS = 24 * 60 * 60 * 1000;

describe.each(COMPETITOR_PAGES)("content/vs/$id.ts", (page) => {
  it(`was checked within ${MAX_AGE_DAYS} days`, () => {
    const ageDays = Math.floor((Date.now() - Date.parse(`${page.checkedOn}T00:00:00Z`)) / DAY_MS);
    const recheck = page.sources.map((source) => `  - ${source.label}: ${source.url}`).join("\n");
    expect(
      ageDays,
      [
        `${page.name} comparison is stale: last checked ${page.checkedOn} (${ageDays} days ago, limit ${MAX_AGE_DAYS}).`,
        `Re-check ${page.name}'s current prices, trial terms and every feature row against:`,
        recheck,
        `Then update content/vs/${page.id}.ts (drop anything you can't confirm) and set checkedOn to today.`,
      ].join("\n"),
    ).toBeLessThanOrEqual(MAX_AGE_DAYS);
  });

  it("only cites the competitor's own site", () => {
    for (const source of page.sources) {
      const host = new URL(source.url).hostname;
      expect(host === page.domain || host.endsWith(`.${page.domain}`), source.url).toBe(true);
    }
  });

  it("gives a source for every claim about them", () => {
    const urls = page.sources.map((source) => source.url);
    for (const row of page.rows) {
      if (row.them.status === "not-listed") continue;
      expect(row.source, `${page.id}: row "${row.key}" needs a source`).toBeDefined();
      expect(urls, `${page.id}: row "${row.key}" cites an unlisted source`).toContain(row.source);
    }
  });

  it("never shows a row where neither side has the feature", () => {
    for (const row of page.rows) {
      const bothLack =
        ["no", "not-listed"].includes(row.them.status) && YTNICHES[row.key].status === "no";
      expect(bothLack, `${page.id}: row "${row.key}" says nothing`).toBe(false);
    }
  });

  it("has a landing-page card linking to it", () => {
    expect(COMPETITORS.map((competitor) => competitor.id)).toContain(page.id);
  });
});

describe("YTNiches' own trial cell", () => {
  it("is always Yes and comes from the plans file", async () => {
    const { trialSummary } = await import("@/lib/billing/plans");
    expect(YTNICHES.freeTrial).toEqual({ status: "yes", note: trialSummary() });
  });
});

// Pinned to the research (TubeLab FAQ, checked 2026-09-25: "No, there's
// not a free trial for the Niche Finder"). If TubeLab adds a trial, update
// content/vs/tubelab.ts and this test together.
describe("TubeLab's trial cell", () => {
  it("is No, citing their pricing FAQ", async () => {
    const { TUBELAB } = await import("@/content/vs/tubelab");
    const trial = TUBELAB.rows.find((row) => row.key === "freeTrial");
    expect(trial).toMatchObject({
      them: { status: "no" },
      source: "https://tubelab.net/pricing",
    });
  });
});
