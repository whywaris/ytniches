import { describe, expect, it } from "vitest";

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

function allStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(allStrings);
  if (value && typeof value === "object") return Object.values(value).flatMap(allStrings);
  return [];
}

describe("landing content", () => {
  it("keeps SEO title under 60 and description under 155 chars", () => {
    expect(content.SEO.title.length).toBeLessThan(60);
    expect(content.SEO.description.length).toBeLessThan(155);
  });

  it("uses no banned words (Landing-Copy §1.5)", () => {
    const text = allStrings(content).join(" ").toLowerCase();
    for (const word of BANNED) {
      expect(text, `banned word "${word}"`).not.toMatch(new RegExp(`\\b${word}`));
    }
  });

  it("ships Mac's final founder copy, not the starter draft", () => {
    const story = content.FOUNDER.paragraphs.join(" ");
    expect(story).toContain("World War 2");
    expect(story).not.toContain("a while back");
    expect(content.FOUNDER.signature).toBe("— Mac, founder");
  });

  it("states the Monetization.md credit costs, not 'one credit'", () => {
    expect(content.AI_SECTION.creditLine).toContain("5 credits");
    expect(content.AI_SECTION.creditLine).toContain("3 to regenerate");
  });

  it("marks only YouTube as a live integration", () => {
    const live = content.INTEGRATIONS.categories
      .flatMap((category) => category.items)
      .filter((item) => item.live)
      .map((item) => item.id);
    expect(live).toEqual(["youtube"]);
  });

  it("builds Ask-AI links with the encoded pre-filled query", () => {
    const links = content.askAiLinks("hello world");
    expect(links.map((link) => link.label)).toEqual([
      "Ask ChatGPT",
      "Ask Claude",
      "Ask Perplexity",
    ]);
    for (const link of links) {
      expect(link.href).toContain("hello%20world");
    }
  });
});
