import { notFound } from "next/navigation";

import { getAuthors, getPosts, summarize } from "@/lib/blog";
import { CATEGORIES, getCategory } from "@/lib/blog/categories";
import { PostListPage } from "@/components/features/blog/post-list-page";

import type { Metadata } from "next";

export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ slug: category.slug }));
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const category = getCategory((await params).slug);
  if (!category) return {};
  const empty = !getPosts().some((post) => post.category === category.slug);
  return {
    title: `${category.name} — YTNiches Blog`,
    description: category.description,
    alternates: { canonical: `/blog/categories/${category.slug}` },
    // An empty category page is thin content; keep it out of search until it has posts.
    robots: empty ? { index: false } : undefined,
  };
}

export default async function BlogCategoryPage({ params }: { params: Params }) {
  const category = getCategory((await params).slug);
  if (!category) notFound();

  return (
    <PostListPage
      eyebrow="Category"
      title={category.name}
      description={category.description}
      activeCategory={category.slug}
      posts={getPosts()
        .filter((post) => post.category === category.slug)
        .map(summarize)}
      authors={getAuthors()}
    />
  );
}
