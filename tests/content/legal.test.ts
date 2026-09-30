import { createElement } from "react";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { renderMdx } from "@/lib/blog/mdx";
import { BETA_MODE } from "@/lib/billing/beta";
import { FACTS } from "@/lib/help/facts";
import { getLegalPages } from "@/lib/legal";
import { HELP_MDX_COMPONENTS } from "@/components/features/help/help-mdx";
import { NeedsInput } from "@/components/features/legal/needs-input";

// D-058 / D-067f: same accuracy rules as the help center, plus the gaps
// the owner still has to fill.
const pages = getLegalPages();

function prose(body: string): string {
  return body
    .replace(/^\s*\d+\. /gm, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\]\([^)]*\)/g, "]");
}

describe("content/legal", () => {
  it("has the four required pages", () => {
    expect(pages.map((page) => page.slug)).toEqual(["terms", "privacy", "refunds", "cookies"]);
  });

  // Filling one in? Replace the marker in the MDX and drop it from here.
  it("lists every open [NEEDS MAC INPUT] marker", () => {
    const open = pages.flatMap((page) =>
      [...page.body.matchAll(/<NeedsInput>([^<]+)<\/NeedsInput>/g)].map(
        (match) => `${page.slug}: ${match[1]}`,
      ),
    );
    expect(open).toEqual([]);
  });

  describe.each(pages)("content/legal/$slug", (page) => {
    it("types no numbers: they come from <Fact> or <PlanTable>", () => {
      const digits = prose(page.body)
        .split("\n")
        .filter((line) => /\d/.test(line));
      expect(digits).toEqual([]);
    });

    it("has no markdown tables (the MDX pipeline has no GFM)", () => {
      expect(page.body).not.toMatch(/^\|/m);
    });

    it("only uses facts that exist", () => {
      for (const [, key] of page.body.matchAll(/<Fact k="([^"]+)"/g)) {
        expect(FACTS, key).toHaveProperty([key]);
      }
    });

    it("never names a payment provider", () => {
      expect(page.body).not.toMatch(/creem|stripe|paddle|lemon ?squeezy/i);
    });

    it("renders", async () => {
      const { Content } = await renderMdx(page.body);
      const html = renderToStaticMarkup(
        createElement(Content, { components: { ...HELP_MDX_COMPONENTS, NeedsInput } }),
      );
      expect(html.length).toBeGreaterThan(0);
    });
  });

  it("states the trial credits the way credit-cycles grants them (D-081)", () => {
    expect(FACTS["trial.creditsTerms"]).toContain(BETA_MODE ? "every month" : "once");
    expect(pages.find((page) => page.slug === "terms")!.body).toContain(
      '<Fact k="trial.creditsTerms" />',
    );
  });

  it("meets YouTube's Developer Policies wording (III.A.1, III.A.2)", () => {
    const terms = pages.find((page) => page.slug === "terms")!.body;
    const privacy = pages.find((page) => page.slug === "privacy")!.body;
    expect(terms).toMatch(
      /agree to be bound by the \[YouTube Terms of Service\]\(https:\/\/www\.youtube\.com\/t\/terms\)/,
    );
    expect(privacy).toContain("YouTube API Services");
    expect(privacy).toContain("https://policies.google.com/privacy");
    expect(privacy).toContain("https://www.youtube.com/t/terms");
    expect(privacy).toContain("https://security.google.com/settings/security/permissions");
    // III.E.4 (deletion) and III.E.4.h (own metrics labelled as not from YouTube).
    expect(privacy).toMatch(/doesn't change anything stored by YouTube/);
    expect(privacy).toMatch(/not data from YouTube/);
  });
});
