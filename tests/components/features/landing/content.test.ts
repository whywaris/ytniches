import { describe, expect, it } from "vitest";

import { BETA_NOTICE_DAYS } from "@/lib/billing/beta";
import { TIER_INFO, TRIAL } from "@/lib/billing/plans";
import { LEGAL } from "@/lib/legal/policy";
import { YOUTUBE_DATA_MAX_AGE_DAYS } from "@/lib/youtube/retention";
import * as content from "@/components/features/landing/content";

// Landing-Copy.md §5.6's review checklist, as far as a machine can check it.
const BANNED = [
  "revolutionize",
  "unlock",
  "empower",
  "seamless",
  "cutting-edge",
  "best-in-class",
  "next-gen",
  "disrupt",
  "transform",
  "journey",
  "ecosystem",
  "holistic",
  "synergy",
  "delight",
];

// D-082: payment and Google reviewers read the page -- no money claims.
const MONEY_CLAIMS = /\b(profit\w*|revenue|income|earn\w*|monetiz\w*|make money|rpm|cpm)\b|\$/i;

function allStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(allStrings);
  if (value && typeof value === "object") return Object.values(value).flatMap(allStrings);
  return [];
}

const text = allStrings(content).join(" ");

describe("landing content", () => {
  it("keeps SEO title under 60 and description under 155 chars", () => {
    expect(content.SEO.title.length).toBeLessThan(60);
    expect(content.SEO.description.length).toBeLessThan(155);
  });

  it("uses no banned words (Landing-Copy §1.5)", () => {
    for (const word of BANNED) {
      expect(text.toLowerCase(), `banned word "${word}"`).not.toMatch(new RegExp(`\\b${word}`));
    }
  });

  it("makes no income, revenue or profitability claims (D-082)", () => {
    expect(text).not.toMatch(MONEY_CLAIMS);
  });

  it("only states numbers that come from constants (D-082)", () => {
    const allowed = new Set(
      [
        YOUTUBE_DATA_MAX_AGE_DAYS,
        BETA_NOTICE_DAYS,
        LEGAL.dataRequestDays,
        TRIAL.credits,
        TRIAL.days,
        new Date().getFullYear(),
        ...Object.values(TIER_INFO).flatMap((info) => [info.monthlyPrice, info.monthlyCredits]),
      ].map(String),
    );
    for (const number of text.match(/\d+/g) ?? []) {
      expect(allowed.has(number), `typed number ${number}`).toBe(true);
    }
  });

  it("has 5-6 FAQs covering data source, independence, storage, pricing, deletion, contact", () => {
    expect(content.FAQ.length).toBeGreaterThanOrEqual(5);
    expect(content.FAQ.length).toBeLessThanOrEqual(6);
    const answers = content.FAQ.map((item) => `${item.question} ${item.answer}`).join(" ");
    expect(answers).toMatch(/official YouTube Data API/);
    expect(answers).toMatch(/isn't affiliated with, endorsed or sponsored by YouTube or Google/);
    expect(content.FAQ.some((item) => item.link?.href === "/legal/privacy")).toBe(true);
    expect(answers).toMatch(/beta/i);
    expect(answers).toMatch(/delete your account/);
    expect(answers).toMatch(/support@ytniches\.com/);
  });
});
