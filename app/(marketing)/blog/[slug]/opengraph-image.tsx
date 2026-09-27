import { getPost, getPosts } from "@/lib/blog";
import { getCategory } from "@/lib/blog/categories";
import { OG_SIZE, ogCard } from "@/lib/og/card";

// PRD.md §10.2 "OG images per post", generated at build time with the
// shared card (logo, category, title).
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "YTNiches blog post";

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  const category = post ? getCategory(post.category)?.name : undefined;
  return ogCard({
    eyebrow: category ?? "Blog",
    title: post?.title ?? "YTNiches Blog",
    footer: "ytniches.com/blog",
  });
}
