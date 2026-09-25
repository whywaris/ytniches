import { describe, expect, it } from "vitest";

import type { Author, Post } from "@/lib/blog";
import { renderMdx } from "@/lib/blog/mdx";
import { buildRss } from "@/lib/blog/rss";

describe("renderMdx", () => {
  it("collects h2/h3 headings with the same ids rehype-slug puts on the page", async () => {
    const { headings } = await renderMdx(
      "# Title\n\n## Step 1: Find it\n\n### A **bold** part\n\n#### Too deep",
    );
    expect(headings).toEqual([
      { id: "step-1-find-it", text: "Step 1: Find it", depth: 2 },
      { id: "a-bold-part", text: "A bold part", depth: 3 },
    ]);
  });
});

describe("buildRss", () => {
  const author: Author = { slug: "mac", name: "Mac", bio: "Bio", social: {} };
  const post = {
    slug: "a-post",
    title: 'Tips & tricks <for> "you"',
    excerpt: "It's good",
    category: "ai-prompts",
    author: "mac",
    publishDate: "2026-09-01",
  } as Post;

  it("escapes XML and builds absolute links", () => {
    const xml = buildRss([post], [author], "https://ytniches.com");
    expect(xml).toContain("<title>Tips &amp; tricks &lt;for&gt; &quot;you&quot;</title>");
    expect(xml).toContain("<link>https://ytniches.com/blog/a-post</link>");
    expect(xml).toContain("<description>It&apos;s good</description>");
    expect(xml).toContain("<dc:creator>Mac</dc:creator>");
    expect(xml).toContain("<pubDate>Tue, 01 Sep 2026 00:00:00 GMT</pubDate>");
  });

  it("is still a valid empty feed with no posts", () => {
    const xml = buildRss([], [author], "https://ytniches.com");
    expect(xml).toContain("<channel>");
    expect(xml).not.toContain("<item>");
  });
});
