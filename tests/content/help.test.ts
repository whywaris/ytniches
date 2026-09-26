import { createElement } from "react";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { renderMdx } from "@/lib/blog/mdx";
import { getHelpArticles } from "@/lib/help";
import { HELP_CATEGORIES } from "@/lib/help/categories";
import { FACTS } from "@/lib/help/facts";
import { HELP_MDX_COMPONENTS } from "@/components/features/help/help-mdx";

// PRD.md §10.4 accuracy rules, enforced on the real content/help files.
const articles = getHelpArticles();
const slugs = new Set(articles.map((article) => article.slug));

// What's left of an article once components, code and link targets are
// gone (and ordered-list markers): the prose a writer typed by hand.
function prose(body: string): string {
  return body
    .replace(/^\s*\d+\. /gm, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\]\([^)]*\)/g, "]");
}

describe("content/help", () => {
  it("has at least one article in every category", () => {
    for (const category of HELP_CATEGORIES) {
      expect(
        articles.some((article) => article.category === category.slug),
        category.slug,
      ).toBe(true);
    }
  });

  describe.each(articles)("content/help/$slug", (article) => {
    it("types no numbers: every number comes from <Fact> or <PlanTable>", () => {
      for (const text of [article.title, article.excerpt, prose(article.body)]) {
        const digits = text.split("\n").filter((line) => /\d/.test(line));
        expect(digits, "use <Fact k=...> for numbers").toEqual([]);
      }
    });

    // The shared MDX pipeline has no GFM, so a | table | renders as raw text.
    it("has no markdown tables (use a list or <PlanTable />)", () => {
      expect(article.body).not.toMatch(/^\|/m);
    });

    it("only uses facts that exist", () => {
      for (const [, key] of article.body.matchAll(/<Fact k="([^"]+)"/g)) {
        expect(FACTS, key).toHaveProperty([key]);
      }
    });

    it("only links to help articles that exist", () => {
      for (const [, slug] of article.body.matchAll(/\]\(\/help\/([^)#]+)\)/g)) {
        expect(slugs.has(slug), slug).toBe(true);
      }
    });

    it("renders", async () => {
      const { Content } = await renderMdx(article.body);
      const html = renderToStaticMarkup(
        createElement(Content, { components: HELP_MDX_COMPONENTS }),
      );
      expect(html.length).toBeGreaterThan(0);
    });
  });
});
