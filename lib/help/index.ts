import { cache } from "react";

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

import { parseMdxFile } from "@/lib/content/mdx-file";
import { HELP_CATEGORIES, HELP_CATEGORY_SLUGS, type HelpCategorySlug } from "@/lib/help/categories";
import type { SearchEntry } from "@/components/features/blog/blog-search";

// PRD.md §10.4: help articles are MDX in content/help, same pipeline as the
// blog (lib/content/mdx-file.ts + lib/blog/mdx.ts). Build-time only.

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const FrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().regex(SLUG),
  category: z.enum(HELP_CATEGORY_SLUGS),
  order: z.number().int(),
  excerpt: z.string().min(1),
  popular: z.boolean().default(false),
});

export interface HelpArticle extends z.infer<typeof FrontmatterSchema> {
  category: HelpCategorySlug;
  body: string;
  headings: string[];
}

export function parseHelpFile(fileName: string, raw: string): HelpArticle {
  const { data, body } = parseMdxFile(fileName, raw, FrontmatterSchema);
  const headings = [...body.matchAll(/^#{2,3} (.+)$/gm)].map((match) => match[1].trim());
  return { ...data, body, headings };
}

const categoryIndex = (slug: HelpCategorySlug) =>
  HELP_CATEGORIES.findIndex((category) => category.slug === slug);

export function loadHelpArticles(dir: string): HelpArticle[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => parseHelpFile(name, readFileSync(path.join(dir, name), "utf8")))
    .sort(
      (a, b) =>
        categoryIndex(a.category) - categoryIndex(b.category) ||
        a.order - b.order ||
        a.slug.localeCompare(b.slug),
    );
}

export const getHelpArticles = cache((): HelpArticle[] =>
  loadHelpArticles(path.join(process.cwd(), "content", "help")),
);

export function getHelpArticle(slug: string): HelpArticle | undefined {
  return getHelpArticles().find((article) => article.slug === slug);
}

// The rest of the article's category, in reading order.
export function relatedHelpArticles(article: HelpArticle, articles: HelpArticle[]): HelpArticle[] {
  return articles.filter(
    (candidate) => candidate.category === article.category && candidate.slug !== article.slug,
  );
}

// Headings ride in `tags` so a search for "quiet hours" finds the section.
export function helpSearchEntries(articles: HelpArticle[]): SearchEntry[] {
  return articles.map((article) => ({
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category: HELP_CATEGORIES[categoryIndex(article.category)].name,
    tags: article.headings,
  }));
}
