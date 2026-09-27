import Link from "next/link";

import { getAuthors, getPosts, summarize } from "@/lib/blog";
import { CATEGORIES, getCategory } from "@/lib/blog/categories";
import { BlogSearch } from "@/components/features/blog/blog-search";
import { NewsletterSignup } from "@/components/features/blog/newsletter-signup";
import {
  CategoryPills,
  FeaturedPostCard,
  PostCard,
  PostGrid,
} from "@/components/features/blog/post-card";
import { ProductCta } from "@/components/features/blog/product-cta";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — YTNiches",
  description:
    "Faceless YouTube niches, outlier videos, AI prompts and honest growth notes from the team building YTNiches.",
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": "/blog/rss.xml" },
  },
};

// UI-UX-Flow.md §2.2 blog homepage (Backlinko-style, D-005).
export default function BlogPage() {
  const posts = getPosts().map(summarize);
  const authors = getAuthors();
  const authorOf = (slug: string) => authors.find((author) => author.slug === slug);

  const featured = posts.filter((post) => post.featured);
  const hero = featured[0] ?? posts[0];
  const featuredGrid = [...featured, ...posts]
    .filter((post, index, all) => post !== hero && all.indexOf(post) === index)
    .slice(0, 3);
  const recent = posts.filter((post) => post !== hero).slice(0, 4);
  const categoryRows = CATEGORIES.map((category) => ({
    category,
    posts: posts.filter((post) => post.category === category.slug).slice(0, 3),
  })).filter((row) => row.posts.length > 0);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 md:px-10 md:py-16">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-display-sm font-semibold tracking-tight text-text-primary">Blog</h1>
          <p className="mt-3 max-w-xl text-body-lg text-text-secondary">
            Finding faceless niches, reading outliers, and turning what works into videos.
          </p>
        </div>
        {posts.length > 0 && (
          <BlogSearch
            entries={posts.map((post) => ({
              slug: post.slug,
              title: post.title,
              excerpt: post.excerpt,
              category: getCategory(post.category)?.name ?? post.category,
              tags: post.tags,
            }))}
          />
        )}
      </header>

      <div className="mt-8">
        <CategoryPills />
      </div>

      {!hero ? (
        <div className="mt-16 space-y-12">
          <p className="text-body-lg text-text-secondary">
            First posts are on the way. Get them by email:
          </p>
          <NewsletterSignup heading="Be the first to read them" />
        </div>
      ) : (
        <>
          <section aria-label="Featured post" className="mt-12">
            <FeaturedPostCard post={hero} author={authorOf(hero.author)} />
          </section>

          {featuredGrid.length > 0 && (
            <section aria-labelledby="featured-heading" className="mt-20">
              <h2 id="featured-heading" className="mb-6 text-h2 font-semibold text-text-primary">
                Featured
              </h2>
              <PostGrid posts={featuredGrid} authors={authors} />
            </section>
          )}

          {recent.length > 0 && (
            <section aria-labelledby="recent-heading" className="mt-20">
              <h2 id="recent-heading" className="mb-6 text-h2 font-semibold text-text-primary">
                Recently published
              </h2>
              <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                {recent.map((post) => (
                  <PostCard key={post.slug} post={post} author={authorOf(post.author)} />
                ))}
              </div>
            </section>
          )}

          <div className="mt-20">
            <NewsletterSignup />
          </div>

          {categoryRows.map(({ category, posts: rowPosts }) => (
            <section key={category.slug} aria-labelledby={`row-${category.slug}`} className="mt-20">
              <div className="mb-6 flex items-baseline justify-between gap-4">
                <h2 id={`row-${category.slug}`} className="text-h2 font-semibold text-text-primary">
                  {category.name}
                </h2>
                <Link
                  href={`/blog/categories/${category.slug}`}
                  className="text-body-sm font-medium text-accent-text hover:underline"
                >
                  View all<span className="sr-only"> {category.name} posts</span>
                </Link>
              </div>
              <PostGrid posts={rowPosts} authors={authors} />
            </section>
          ))}
        </>
      )}

      <div className="mt-20">
        <ProductCta source="blog-home" />
      </div>
    </div>
  );
}
