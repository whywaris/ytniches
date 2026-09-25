import type { Author, Post } from "@/lib/blog";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// RSS 2.0 for /blog/rss.xml (PRD.md §10.2). Callers pass published posts only.
export function buildRss(posts: Post[], authors: Author[], siteUrl: string): string {
  const items = posts
    .map((post) => {
      const url = `${siteUrl}/blog/${post.slug}`;
      const author = authors.find((candidate) => candidate.slug === post.author);
      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <description>${escapeXml(post.excerpt)}</description>`,
        `      <pubDate>${new Date(`${post.publishDate}T00:00:00Z`).toUTCString()}</pubDate>`,
        author ? `      <dc:creator>${escapeXml(author.name)}</dc:creator>` : null,
        `      <category>${escapeXml(post.category)}</category>`,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>YTNiches Blog</title>
    <link>${siteUrl}/blog</link>
    <description>Faceless YouTube niches, outlier videos, AI prompts and honest growth notes.</description>
    <language>en</language>
    <atom:link href="${siteUrl}/blog/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}
