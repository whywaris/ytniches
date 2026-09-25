import { cache } from "react";

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";

import { CATEGORY_SLUGS, type CategorySlug } from "@/lib/blog/categories";

// PRD.md §10.2 / D-006: MDX files in git, authors as YAML. Everything here
// runs at build time (and per request in `next dev`). Frontmatter is a
// trust boundary for the build -- a typo'd category or date fails loudly
// instead of shipping a broken page.

const CONTENT_DIR = path.join(process.cwd(), "content");
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const FrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().regex(SLUG),
  category: z.enum(CATEGORY_SLUGS),
  tags: z.array(z.string().regex(SLUG)).default([]),
  author: z.string().regex(SLUG),
  publishDate: z.iso.date(),
  updatedDate: z.iso.date().optional(),
  excerpt: z.string().min(1),
  coverImage: z.string().optional(),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
});

const AuthorSchema = z.object({
  slug: z.string().regex(SLUG),
  name: z.string().min(1),
  role: z.string().optional(),
  bio: z.string().min(1),
  avatar: z.string().nullish(),
  social: z.record(z.string(), z.string().url()).default({}),
});

export type PostFrontmatter = z.infer<typeof FrontmatterSchema>;
export type Author = z.infer<typeof AuthorSchema>;

export interface Post extends PostFrontmatter {
  category: CategorySlug;
  body: string;
  readingMinutes: number;
}

// The card/search shape: no MDX body, safe to hand to client components.
export type PostSummary = Omit<Post, "body">;

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const WORDS_PER_MINUTE = 230;

export function readingMinutes(body: string): number {
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function parsePostFile(fileName: string, raw: string): Post {
  const match = FRONTMATTER.exec(raw);
  if (!match) throw new Error(`${fileName}: missing --- frontmatter --- block`);
  const parsed = FrontmatterSchema.safeParse(parseYaml(match[1]));
  if (!parsed.success) {
    throw new Error(`${fileName}: invalid frontmatter\n${z.prettifyError(parsed.error)}`);
  }
  if (`${parsed.data.slug}.mdx` !== fileName) {
    throw new Error(`${fileName}: slug "${parsed.data.slug}" must match the file name`);
  }
  const body = raw.slice(match[0].length);
  return { ...parsed.data, body, readingMinutes: readingMinutes(body) };
}

export function parseAuthorFile(fileName: string, raw: string): Author {
  const parsed = AuthorSchema.safeParse(parseYaml(raw));
  if (!parsed.success) {
    throw new Error(`${fileName}: invalid author\n${z.prettifyError(parsed.error)}`);
  }
  if (`${parsed.data.slug}.yaml` !== fileName) {
    throw new Error(`${fileName}: slug "${parsed.data.slug}" must match the file name`);
  }
  return parsed.data;
}

// Drafts show in `next dev` (with a DRAFT banner) so Mac can read them in
// the real layout; production builds, the sitemap and RSS never see them.
export function includeDrafts(): boolean {
  return process.env.NODE_ENV !== "production";
}

export function loadPosts(dir: string, options: { includeDrafts: boolean }): Post[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => parsePostFile(name, readFileSync(path.join(dir, name), "utf8")))
    .filter((post) => options.includeDrafts || !post.draft)
    .sort((a, b) => b.publishDate.localeCompare(a.publishDate) || a.slug.localeCompare(b.slug));
}

export function loadAuthors(dir: string): Author[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith(".yaml"))
    .map((name) => parseAuthorFile(name, readFileSync(path.join(dir, name), "utf8")));
}

export const getPosts = cache((): Post[] =>
  loadPosts(path.join(CONTENT_DIR, "blog"), { includeDrafts: includeDrafts() }),
);

// Only ever published posts, whatever the environment: for RSS + sitemap.
export const getPublishedPosts = cache((): Post[] =>
  loadPosts(path.join(CONTENT_DIR, "blog"), { includeDrafts: false }),
);

export const getAuthors = cache((): Author[] => loadAuthors(path.join(CONTENT_DIR, "authors")));

export function getPost(slug: string): Post | undefined {
  return getPosts().find((post) => post.slug === slug);
}

export function getAuthor(slug: string): Author | undefined {
  return getAuthors().find((author) => author.slug === slug);
}

// Strips the MDX body so the rest can be passed to client components.
export function summarize(post: Post): PostSummary {
  const { body, ...summary } = post;
  void body;
  return summary;
}

export function getTags(posts: Post[]): string[] {
  return [...new Set(posts.flatMap((post) => post.tags))].sort();
}

export function tagLabel(tag: string): string {
  return tag.replace(/-/g, " ");
}

// Same category first (newest first), topped up from other categories.
export function relatedPosts(post: Post, posts: Post[], count = 3): Post[] {
  const others = posts.filter((candidate) => candidate.slug !== post.slug);
  const sameCategory = others.filter((candidate) => candidate.category === post.category);
  const rest = others.filter((candidate) => candidate.category !== post.category);
  return [...sameCategory, ...rest].slice(0, count);
}
