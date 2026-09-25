import { notFound } from "next/navigation";

import { COMPETITOR_PAGES, getCompetitorPage } from "@/content/vs";
import { VsComparison } from "@/components/features/vs/vs-comparison";

import type { Metadata } from "next";

// PRD.md §10.5: SEO pages for competitor-brand queries, statically built.
// Facts live in content/vs/<id>.ts (sources + check date, guarded by
// tests/content/vs.test.ts).
export const dynamicParams = false;

export function generateStaticParams() {
  return COMPETITOR_PAGES.map((page) => ({ competitor: page.id }));
}

type Params = Promise<{ competitor: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const page = getCompetitorPage((await params).competitor);
  if (!page) return {};
  return {
    title: `YTNiches vs ${page.name}: an honest comparison`,
    description: `${page.bestFor.them} ${page.bestFor.us}`,
    alternates: { canonical: `/vs/${page.id}` },
  };
}

export default async function VsPage({ params }: { params: Params }) {
  const page = getCompetitorPage((await params).competitor);
  if (!page) notFound();
  return <VsComparison page={page} />;
}
