import { getAuthors, getPublishedPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";
import { buildRss } from "@/lib/blog/rss";

// Built once at deploy (D-053). Published posts only, even in `next dev`.
export const dynamic = "force-static";

export function GET() {
  return new Response(buildRss(getPublishedPosts(), getAuthors(), SITE_URL), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
