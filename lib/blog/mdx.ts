import * as runtime from "react/jsx-runtime";
import { evaluate } from "@mdx-js/mdx";
import rehypeSlug from "rehype-slug";

type MDXContent = Awaited<ReturnType<typeof evaluate>>["default"];

export interface Heading {
  id: string;
  text: string;
  depth: 2 | 3;
}

interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: { id?: unknown };
  children?: HastNode[];
}

function textOf(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}

// Runs after rehype-slug, so the TOC links use exactly the ids on the page.
function collectHeadings(into: Heading[]) {
  return () => (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (
        (node.tagName === "h2" || node.tagName === "h3") &&
        typeof node.properties?.id === "string"
      ) {
        into.push({
          id: node.properties.id,
          text: textOf(node),
          depth: node.tagName === "h2" ? 2 : 3,
        });
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

// Content is our own repo's MDX (D-006), never user input, so evaluating
// it is safe.
export async function renderMdx(
  body: string,
): Promise<{ Content: MDXContent; headings: Heading[] }> {
  const headings: Heading[] = [];
  const { default: Content } = await evaluate(body, {
    ...runtime,
    rehypePlugins: [rehypeSlug, collectHeadings(headings)],
  });
  return { Content, headings };
}
