import Link from "next/link";
import { notFound } from "next/navigation";

import { COMPETITORS } from "@/components/features/landing/content";

import type { Metadata } from "next";

// Stub so the landing VS cards don't 404 (Application-Flow §2.1
// /vs/[competitor]). noindex until the real comparison is written --
// thin placeholder pages shouldn't compete in search.
export const dynamicParams = false;

export function generateStaticParams() {
  return COMPETITORS.map((competitor) => ({ competitor: competitor.id }));
}

type Params = Promise<{ competitor: string }>;

function find(id: string) {
  return COMPETITORS.find((competitor) => competitor.id === id);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const competitor = find((await params).competitor);
  return {
    title: competitor ? `YTNiches vs ${competitor.name}` : "Comparison",
    robots: { index: false },
  };
}

export default async function VsPage({ params }: { params: Params }) {
  const competitor = find((await params).competitor);
  if (!competitor) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <h1 className="text-h1 font-semibold text-text-primary">YTNiches vs {competitor.name}</h1>
      <p className="mt-4 text-body-lg text-text-secondary">{competitor.framing}</p>
      <p className="mt-8 text-body text-text-secondary">The full comparison is coming soon.</p>
      <Link
        href="/#compare"
        className="mt-10 inline-block text-body-sm font-medium text-accent hover:underline"
      >
        ← Back to comparisons
      </Link>
    </div>
  );
}
