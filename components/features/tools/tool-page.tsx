import type { ReactNode } from "react";

import Link from "next/link";

import { YouTubeAttribution } from "@/components/features/youtube/youtube-attribution";
import { getTool, TOOLS, type ToolSlug } from "@/lib/tools/registry";

import type { Metadata } from "next";

export function toolMetadata(slug: ToolSlug): Metadata {
  const tool = getTool(slug)!;
  return {
    title: tool.seoTitle,
    description: tool.seoDescription,
    alternates: { canonical: `/${slug}` },
  };
}

// UI-UX-Flow.md §2.3 tool page. Server-rendered; the tool itself arrives
// as `children` so each page ships only its own client island.
export function ToolPage({ slug, children }: { slug: ToolSlug; children: ReactNode }) {
  const tool = getTool(slug)!;
  const related = tool.related.map((relatedSlug) => getTool(relatedSlug)!);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tool.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <div className="mx-auto max-w-[900px] px-6 py-12 md:px-10 md:py-16">
      <nav aria-label="Breadcrumb" className="text-body-sm text-text-secondary">
        <Link href="/tools" className="hover:text-text-primary">
          Free tools
        </Link>
      </nav>
      <h1 className="mt-3 text-h1 font-semibold tracking-tight text-text-primary">{tool.name}</h1>
      <p className="mt-3 text-body-lg text-text-secondary">{tool.tagline}</p>

      <section aria-label={tool.name} className="mt-10 rounded-md border border-border-subtle p-6">
        {children}
      </section>
      {tool.youtubeData ? <YouTubeAttribution className="mt-3" /> : null}

      <section aria-labelledby="how-to" className="mt-16">
        <h2 id="how-to" className="text-h2 font-semibold text-text-primary">
          How to use it
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-body text-text-secondary">
          {tool.howTo.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="faq" className="mt-16">
        <h2 id="faq" className="text-h2 font-semibold text-text-primary">
          Questions
        </h2>
        <dl className="mt-4 divide-y divide-border-subtle border-y border-border-subtle">
          {tool.faq.map((item) => (
            <div key={item.question} className="py-4">
              <dt className="text-body font-semibold text-text-primary">{item.question}</dt>
              <dd className="mt-1 text-body text-text-secondary">{item.answer}</dd>
            </div>
          ))}
        </dl>
        <script
          type="application/ld+json"
          // JSON-LD from our own registry, not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
        />
      </section>

      <section aria-labelledby="related" className="mt-16">
        <h2 id="related" className="text-h2 font-semibold text-text-primary">
          More free tools
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {related.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/${item.slug}`}
                className="block h-full rounded-md border border-border-subtle p-4 hover:bg-bg-hover"
              >
                <span className="block text-body font-semibold text-text-primary">{item.name}</span>
                <span className="mt-1 block text-body-sm text-text-secondary">{item.tagline}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function ToolIndex() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {TOOLS.map((tool) => (
        <li key={tool.slug}>
          <Link
            href={`/${tool.slug}`}
            className="block h-full rounded-md border border-border-subtle p-5 hover:bg-bg-hover"
          >
            <span className="block text-h4 font-semibold text-text-primary">{tool.name}</span>
            <span className="mt-2 block text-body-sm text-text-secondary">{tool.tagline}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
