import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  loadAuthors,
  loadPosts,
  parsePostFile,
  readingMinutes,
  relatedPosts,
  type Post,
} from "@/lib/blog";

function mdx(fields: Record<string, string>, body = "Hello.") {
  const frontmatter = Object.entries({
    title: "A post",
    category: "faceless-niches",
    author: "mac",
    publishDate: '"2026-09-01"',
    excerpt: "Excerpt.",
    ...fields,
  })
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
  return `---\n${frontmatter}\n---\n${body}`;
}

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), "blog-"));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

describe("parsePostFile", () => {
  it("parses frontmatter and applies defaults", () => {
    const post = parsePostFile("a.mdx", mdx({ slug: "a" }, "## Hi\n\nBody"));
    expect(post).toMatchObject({ slug: "a", tags: [], featured: false, draft: false });
    expect(post.body).toBe("## Hi\n\nBody");
  });

  it("handles CRLF files (Windows checkouts)", () => {
    const post = parsePostFile("a.mdx", mdx({ slug: "a" }).replace(/\n/g, "\r\n"));
    expect(post.slug).toBe("a");
  });

  it("rejects an unknown category so a typo fails the build", () => {
    expect(() => parsePostFile("a.mdx", mdx({ slug: "a", category: "nope" }))).toThrow(
      /invalid frontmatter/,
    );
  });

  it("rejects a slug that doesn't match the file name", () => {
    expect(() => parsePostFile("a.mdx", mdx({ slug: "b" }))).toThrow(/must match the file name/);
  });

  it("rejects a malformed date", () => {
    expect(() => parsePostFile("a.mdx", mdx({ slug: "a", publishDate: '"Sept 1"' }))).toThrow();
  });
});

describe("loadPosts", () => {
  beforeEach(() => {
    writeFileSync(path.join(dir, "old.mdx"), mdx({ slug: "old", publishDate: '"2026-01-01"' }));
    writeFileSync(path.join(dir, "new.mdx"), mdx({ slug: "new", publishDate: '"2026-09-01"' }));
    writeFileSync(path.join(dir, "wip.mdx"), mdx({ slug: "wip", draft: "true" }));
  });

  it("never returns drafts when drafts are excluded (production, RSS, sitemap)", () => {
    expect(loadPosts(dir, { includeDrafts: false }).map((post) => post.slug)).toEqual([
      "new",
      "old",
    ]);
  });

  it("includes drafts for next dev, newest first", () => {
    expect(loadPosts(dir, { includeDrafts: true }).map((post) => post.slug)).toEqual([
      "new",
      "wip",
      "old",
    ]);
  });
});

describe("helpers", () => {
  it("rounds reading time and never shows 0 minutes", () => {
    expect(readingMinutes("word ".repeat(10))).toBe(1);
    expect(readingMinutes("word ".repeat(690))).toBe(3);
  });

  it("picks related posts from the same category first", () => {
    const post = (slug: string, category: Post["category"]) => ({ slug, category }) as Post;
    const current = post("a", "ai-prompts");
    const all = [
      current,
      post("b", "tool-guides"),
      post("c", "ai-prompts"),
      post("d", "case-studies"),
    ];
    expect(relatedPosts(current, all, 2).map((p) => p.slug)).toEqual(["c", "b"]);
  });
});

// The real content/ directory: every file must parse, and a published post
// may only link to other published posts -- a link to a draft would 404
// in production.
describe("content/", () => {
  const blogDir = path.join(process.cwd(), "content", "blog");
  const all = loadPosts(blogDir, { includeDrafts: true });
  const published = loadPosts(blogDir, { includeDrafts: false });

  it("parses every post and author", () => {
    expect(all.length).toBeGreaterThan(0);
    const authors = loadAuthors(path.join(process.cwd(), "content", "authors"));
    for (const post of all) {
      expect(authors.map((author) => author.slug)).toContain(post.author);
    }
  });

  it("links from published posts only point at published posts", () => {
    const live = new Set(published.map((post) => post.slug));
    for (const post of published) {
      for (const [, slug] of post.body.matchAll(/\]\(\/blog\/([a-z0-9-]+)\)/g)) {
        expect(live, `${post.slug} links to unpublished /blog/${slug}`).toContain(slug);
      }
    }
  });

  it("links from any post point at a post that exists", () => {
    const slugs = new Set(all.map((post) => post.slug));
    for (const post of all) {
      for (const [, slug] of post.body.matchAll(/\]\(\/blog\/([a-z0-9-]+)\)/g)) {
        expect(slugs, `${post.slug} links to missing /blog/${slug}`).toContain(slug);
      }
    }
  });
});
