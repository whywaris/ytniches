import Link from "next/link";

import { HELP_CATEGORIES } from "@/lib/help/categories";
import { getHelpArticles, helpSearchEntries } from "@/lib/help";
import { BlogSearch } from "@/components/features/blog/blog-search";
import { StillStuck } from "@/components/features/help/still-stuck";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help center — YTNiches",
  description:
    "How YTNiches works: niche searches, tracking channels, outliers, AI prompts, notifications, teams and billing.",
  alternates: { canonical: "/help" },
};

// UI-UX-Flow.md §4.1 / PRD.md §10.4: search, categories, popular articles,
// and a way to reach a person.
export default function HelpPage() {
  const articles = getHelpArticles();
  const popular = articles.filter((article) => article.popular);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 md:px-10 md:py-16">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-display-sm font-semibold tracking-tight text-text-primary">
            Help center
          </h1>
          <p className="mt-3 max-w-xl text-body-lg text-text-secondary">
            How YTNiches works, and what to do when it doesn&rsquo;t.
          </p>
        </div>
        <BlogSearch
          entries={helpSearchEntries(articles)}
          hrefBase="/help"
          label="Search help"
          noun="articles"
        />
      </header>

      {popular.length > 0 && (
        <section aria-labelledby="popular-heading" className="mt-12">
          <h2 id="popular-heading" className="text-h3 font-semibold text-text-primary">
            Popular articles
          </h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {popular.map((article) => (
              <li key={article.slug}>
                <Link
                  href={`/help/${article.slug}`}
                  className="block rounded-md border border-border-subtle bg-bg-surface-1 p-4 hover:bg-bg-hover"
                >
                  <span className="block text-body font-medium text-text-primary">
                    {article.title}
                  </span>
                  <span className="mt-1 block text-body-sm text-text-secondary">
                    {article.excerpt}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {HELP_CATEGORIES.map((category) => {
          const inCategory = articles.filter((article) => article.category === category.slug);
          if (inCategory.length === 0) return null;
          return (
            <section key={category.slug} id={category.slug} aria-labelledby={`${category.slug}-h`}>
              <h2 id={`${category.slug}-h`} className="text-h4 font-semibold text-text-primary">
                {category.name}
              </h2>
              <ul className="mt-3 space-y-2">
                {inCategory.map((article) => (
                  <li key={article.slug}>
                    <Link
                      href={`/help/${article.slug}`}
                      className="text-body-sm text-text-secondary hover:text-text-primary"
                    >
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <div className="mt-16 max-w-3xl">
        <StillStuck />
      </div>
    </div>
  );
}
