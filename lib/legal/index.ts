import { cache } from "react";

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

import { parseMdxFile } from "@/lib/content/mdx-file";

// D-058: legal pages are MDX in content/legal, same pipeline as the blog
// and help center, so numbers come from <Fact> and are checked in tests.

const FrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.enum(["terms", "privacy", "refunds", "cookies"]),
  description: z.string().min(1),
  order: z.number().int(),
  lastUpdated: z.iso.date(),
});

export interface LegalPage extends z.infer<typeof FrontmatterSchema> {
  body: string;
}

export function parseLegalFile(fileName: string, raw: string): LegalPage {
  const { data, body } = parseMdxFile(fileName, raw, FrontmatterSchema);
  return { ...data, body };
}

export const getLegalPages = cache((): LegalPage[] => {
  const dir = path.join(process.cwd(), "content", "legal");
  return readdirSync(dir)
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => parseLegalFile(name, readFileSync(path.join(dir, name), "utf8")))
    .sort((a, b) => a.order - b.order);
});

export function getLegalPage(slug: string): LegalPage | undefined {
  return getLegalPages().find((page) => page.slug === slug);
}
