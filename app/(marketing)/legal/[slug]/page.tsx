import Link from "next/link";
import { notFound } from "next/navigation";

import { getLegalPage, getLegalPages } from "@/lib/legal";
import { renderMdx } from "@/lib/blog/mdx";
import { formatPostDate } from "@/components/features/blog/post-card";
import { HELP_MDX_COMPONENTS } from "@/components/features/help/help-mdx";
import { NeedsInput } from "@/components/features/legal/needs-input";

import type { Metadata } from "next";

// D-058: /legal/terms, /privacy, /refunds, /cookies. Static, marketing layout.
export const dynamicParams = false;

export function generateStaticParams() {
  return getLegalPages().map((page) => ({ slug: page.slug }));
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const page = getLegalPage((await params).slug);
  if (!page) return {};
  return {
    title: `${page.title} — YTNiches`,
    description: page.description,
    alternates: { canonical: `/legal/${page.slug}` },
  };
}

const LEGAL_MDX_COMPONENTS = { ...HELP_MDX_COMPONENTS, NeedsInput };

export default async function LegalPage({ params }: { params: Params }) {
  const page = getLegalPage((await params).slug);
  if (!page) notFound();

  const { Content, headings } = await renderMdx(page.body);
  const others = getLegalPages().filter((other) => other.slug !== page.slug);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10 md:py-16">
      <h1 className="text-display-sm font-semibold tracking-tight text-text-primary">
        {page.title}
      </h1>
      <p className="mt-3 text-body-sm text-text-secondary">
        Last updated <time dateTime={page.lastUpdated}>{formatPostDate(page.lastUpdated)}</time>
      </p>

      {headings.length > 0 && (
        <nav
          aria-label="On this page"
          className="mt-8 rounded-md border border-border-subtle bg-bg-surface-1 p-4"
        >
          <ol className="grid gap-1 text-body-sm sm:grid-cols-2">
            {headings
              .filter((heading) => heading.depth === 2)
              .map((heading) => (
                <li key={heading.id}>
                  <a
                    href={`#${heading.id}`}
                    className="text-text-secondary hover:text-text-primary"
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
          </ol>
        </nav>
      )}

      <article className="prose prose-lg mt-10 max-w-none prose-ytn">
        <Content components={LEGAL_MDX_COMPONENTS} />
      </article>

      <nav aria-label="Other policies" className="mt-16 border-t border-border-subtle pt-6">
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-body-sm">
          {others.map((other) => (
            <li key={other.slug}>
              <Link
                href={`/legal/${other.slug}`}
                className="text-text-secondary hover:text-text-primary"
              >
                {other.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
