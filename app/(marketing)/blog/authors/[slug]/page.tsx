import { notFound } from "next/navigation";

import { getAuthor, getAuthors, getPosts, summarize } from "@/lib/blog";
import { PostListPage } from "@/components/features/blog/post-list-page";

import type { Metadata } from "next";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAuthors().map((author) => ({ slug: author.slug }));
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const author = getAuthor((await params).slug);
  if (!author) return {};
  const empty = !getPosts().some((post) => post.author === author.slug);
  return {
    title: `${author.name} — YTNiches Blog`,
    description: author.bio,
    alternates: { canonical: `/blog/authors/${author.slug}` },
    robots: empty ? { index: false } : undefined,
  };
}

export default async function BlogAuthorPage({ params }: { params: Params }) {
  const author = getAuthor((await params).slug);
  if (!author) notFound();

  return (
    <PostListPage
      eyebrow={author.role ?? "Author"}
      title={author.name}
      description={author.bio}
      posts={getPosts()
        .filter((post) => post.author === author.slug)
        .map(summarize)}
      authors={getAuthors()}
    />
  );
}
