import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getAuthor,
  getAuthors,
  getPost,
  getPosts,
  relatedPosts,
  summarize,
  tagLabel,
} from "@/lib/blog";
import { getCategory } from "@/lib/blog/categories";
import { renderMdx } from "@/lib/blog/mdx";
import { NewsletterSignup } from "@/components/features/blog/newsletter-signup";
import {
  AuthorAvatar,
  Cover,
  PostGrid,
  formatPostDate,
} from "@/components/features/blog/post-card";
import { ProductCta } from "@/components/features/blog/product-cta";
import { Tag } from "@/components/ui/tag";

import type { Metadata } from "next";

// UI-UX-Flow.md §2.2 individual post page. Fully static (D-053: no ISR --
// content ships with each deploy).
export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  const author = getAuthor(post.author);
  return {
    title: `${post.title} — YTNiches`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      publishedTime: post.publishDate,
      modifiedTime: post.updatedDate ?? post.publishDate,
      authors: author ? [author.name] : undefined,
    },
    robots: post.draft ? { index: false, follow: false } : undefined,
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  const author = getAuthor(post.author);
  const category = getCategory(post.category);
  const { Content, headings } = await renderMdx(post.body);
  const related = relatedPosts(post, getPosts()).map(summarize);
  const summary = summarize(post);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 md:px-10 md:py-16">
      {post.draft && (
        <p
          role="note"
          className="mb-8 rounded-md border border-warning/40 bg-warning/12 px-4 py-3 text-body-sm font-medium text-warning"
        >
          DRAFT — Mac to review. Only visible in <code>pnpm dev</code>; never in production, the
          sitemap or RSS. Set <code>draft: false</code> to publish.
        </p>
      )}

      <nav aria-label="Breadcrumb" className="text-body-sm text-text-secondary">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-text-primary">
              Home
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li>
            <Link href="/blog" className="hover:text-text-primary">
              Blog
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li>
            <Link href={`/blog/categories/${post.category}`} className="hover:text-text-primary">
              {category?.name}
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li aria-current="page" className="text-text-primary">
            {post.title}
          </li>
        </ol>
      </nav>

      <header className="mt-8 max-w-3xl">
        <Tag tone="info">{category?.name}</Tag>
        <h1 className="mt-4 text-display-sm font-semibold tracking-tight text-text-primary">
          {post.title}
        </h1>
        <div className="mt-6 flex items-center gap-3">
          {author && <AuthorAvatar author={author} />}
          <p className="text-body-sm text-text-secondary">
            {author && (
              <Link
                href={`/blog/authors/${author.slug}`}
                className="font-medium text-text-primary hover:text-accent"
              >
                {author.name}
              </Link>
            )}
            <br />
            <time dateTime={post.publishDate}>{formatPostDate(post.publishDate)}</time>
            {post.updatedDate && (
              <>
                {" "}
                · Updated{" "}
                <time dateTime={post.updatedDate}>{formatPostDate(post.updatedDate)}</time>
              </>
            )}{" "}
            · {post.readingMinutes} min read
          </p>
        </div>
      </header>

      <Cover post={summary} priority className="mt-10" />

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_240px]">
        <article className="prose prose-lg max-w-none prose-ytn">
          <Content />
        </article>

        {headings.length > 0 && (
          <aside className="hidden lg:block">
            <nav aria-label="On this page" className="sticky top-24">
              <p className="text-caption font-semibold tracking-wide text-text-secondary uppercase">
                On this page
              </p>
              <ul className="mt-3 space-y-2 border-l border-border-subtle text-body-sm">
                {headings.map((heading) => (
                  <li key={heading.id} className={heading.depth === 3 ? "pl-6" : "pl-3"}>
                    <a
                      href={`#${heading.id}`}
                      className="text-text-secondary hover:text-text-primary"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )}
      </div>

      <div className="mt-16 max-w-3xl space-y-12">
        {post.tags.length > 0 && (
          <ul aria-label="Tags" className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li key={tag}>
                <Link
                  href={`/blog/tags/${tag}`}
                  className="text-body-sm text-text-secondary hover:text-text-primary"
                >
                  #{tagLabel(tag)}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {author && (
          <section
            aria-label="About the author"
            className="flex gap-4 rounded-md border border-border-subtle bg-bg-surface-1 p-6"
          >
            <AuthorAvatar author={author} size={56} />
            <div>
              <p className="text-body font-semibold text-text-primary">
                <Link href={`/blog/authors/${author.slug}`} className="hover:text-accent">
                  {author.name}
                </Link>
              </p>
              {author.role && <p className="text-caption text-text-secondary">{author.role}</p>}
              <p className="mt-2 text-body-sm text-text-secondary">{author.bio}</p>
            </div>
          </section>
        )}

        <NewsletterSignup />
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-20">
          <h2 id="related-heading" className="mb-6 text-h2 font-semibold text-text-primary">
            Keep reading
          </h2>
          <PostGrid posts={related} authors={getAuthors()} />
        </section>
      )}

      <div className="mt-20">
        <ProductCta source={`post:${post.slug}`} />
      </div>
    </div>
  );
}
