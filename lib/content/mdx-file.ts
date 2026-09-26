import { parse as parseYaml } from "yaml";
import { z } from "zod";

// Shared by every MDX collection in content/ (blog, help): split the
// --- frontmatter --- block, validate it with the collection's schema,
// and require the slug to match the file name. A bad file fails the build
// with the file name and exactly what's wrong.

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export function parseMdxFile<Schema extends z.ZodType<{ slug: string }>>(
  fileName: string,
  raw: string,
  schema: Schema,
): { data: z.infer<Schema>; body: string } {
  const match = FRONTMATTER.exec(raw);
  if (!match) throw new Error(`${fileName}: missing --- frontmatter --- block`);
  const parsed = schema.safeParse(parseYaml(match[1]));
  if (!parsed.success) {
    throw new Error(`${fileName}: invalid frontmatter\n${z.prettifyError(parsed.error)}`);
  }
  if (`${parsed.data.slug}.mdx` !== fileName) {
    throw new Error(`${fileName}: slug "${parsed.data.slug}" must match the file name`);
  }
  return { data: parsed.data, body: raw.slice(match[0].length) };
}
