import { notFound } from "next/navigation";

import { getAuthors, getPosts, getTags, summarize, tagLabel } from "@/lib/blog";
import { PostListPage } from "@/components/features/blog/post-list-page";

import type { Metadata } from "next";

export const dynamicParams = false;

export function generateStaticParams() {
  return getTags(getPosts()).map((slug) => ({ slug }));
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `#${tagLabel(slug)} — YTNiches Blog`,
    description: `Posts tagged ${tagLabel(slug)}.`,
    alternates: { canonical: `/blog/tags/${slug}` },
  };
}

export default async function BlogTagPage({ params }: { params: Params }) {
  const { slug } = await params;
  const posts = getPosts().filter((post) => post.tags.includes(slug));
  if (posts.length === 0) notFound();

  return (
    <PostListPage
      eyebrow="Tag"
      title={`#${tagLabel(slug)}`}
      description={`Every post tagged ${tagLabel(slug)}.`}
      posts={posts.map(summarize)}
      authors={getAuthors()}
    />
  );
}
