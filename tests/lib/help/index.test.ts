import { describe, expect, it } from "vitest";

import { helpSearchEntries, parseHelpFile, relatedHelpArticles } from "@/lib/help";

const file = (slug: string, category = "billing", order = 1) =>
  `---\ntitle: ${slug}\nslug: ${slug}\ncategory: ${category}\norder: ${order}\nexcerpt: About ${slug}\n---\n\nIntro.\n\n## First part\n\n### Detail\n\n#### Too deep\n`;

describe("parseHelpFile", () => {
  it("collects h2/h3 headings for search", () => {
    const article = parseHelpFile("plans.mdx", file("plans"));
    expect(article.headings).toEqual(["First part", "Detail"]);
    expect(article.popular).toBe(false);
  });

  it("rejects an unknown category", () => {
    expect(() => parseHelpFile("x.mdx", file("x", "nope"))).toThrow(/invalid frontmatter/);
  });
});

describe("relatedHelpArticles / helpSearchEntries", () => {
  const a = parseHelpFile("a.mdx", file("a"));
  const b = parseHelpFile("b.mdx", file("b"));
  const c = parseHelpFile("c.mdx", file("c", "outliers"));

  it("relates only the rest of the same category", () => {
    expect(relatedHelpArticles(a, [a, b, c]).map((article) => article.slug)).toEqual(["b"]);
  });

  it("puts headings in the search tags and uses the category name", () => {
    expect(helpSearchEntries([a])[0]).toMatchObject({
      slug: "a",
      category: "Billing",
      tags: ["First part", "Detail"],
    });
  });
});
