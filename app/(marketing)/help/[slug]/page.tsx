import Link from "next/link";
import { notFound } from "next/navigation";

import { getHelpCategory } from "@/lib/help/categories";
import { getHelpArticle, getHelpArticles, relatedHelpArticles } from "@/lib/help";
import { renderMdx } from "@/lib/blog/mdx";
import { HELP_MDX_COMPONENTS } from "@/components/features/help/help-mdx";
import { StillStuck } from "@/components/features/help/still-stuck";

import type { Metadata } from "next";

// UI-UX-Flow.md §4.1 help article: breadcrumb, article, related articles.
// Fully static, like the blog (D-053).
export const dynamicParams = false;

export function generateStaticParams() {
  return getHelpArticles().map((article) => ({ slug: article.slug }));
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const article = getHelpArticle((await params).slug);
  if (!article) return {};
  return {
    title: `${article.title} — YTNiches Help`,
    description: article.excerpt,
    alternates: { canonical: `/help/${article.slug}` },
  };
}

export default async function HelpArticlePage({ params }: { params: Params }) {
  const article = getHelpArticle((await params).slug);
  if (!article) notFound();

  const category = getHelpCategory(article.category);
  const { Content } = await renderMdx(article.body);
  const related = relatedHelpArticles(article, getHelpArticles());

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10 md:py-16">
      <nav aria-label="Breadcrumb" className="text-body-sm text-text-secondary">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/help" className="hover:text-text-primary">
              Help
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li>
            <Link href={`/help#${article.category}`} className="hover:text-text-primary">
              {category?.name}
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li aria-current="page" className="text-text-primary">
            {article.title}
          </li>
        </ol>
      </nav>

      <h1 className="mt-8 text-display-sm font-semibold tracking-tight text-text-primary">
        {article.title}
      </h1>

      <article className="prose prose-lg mt-8 max-w-none prose-ytn">
        <Content components={HELP_MDX_COMPONENTS} />
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-16">
          <h2 id="related-heading" className="text-h3 font-semibold text-text-primary">
            More in {category?.name}
          </h2>
          <ul className="mt-4 space-y-2">
            {related.map((other) => (
              <li key={other.slug}>
                <Link
                  href={`/help/${other.slug}`}
                  className="text-body text-text-secondary hover:text-text-primary"
                >
                  {other.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-16">
        <StillStuck />
      </div>
    </div>
  );
}
