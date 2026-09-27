import { cache } from "react";

import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeft, CalendarPlus, Lock, Sparkles } from "lucide-react";

import { getRequestContext } from "@/lib/context";
import { isValidNicheSlug } from "@/lib/discovery/config";
import { formatCount } from "@/lib/format";
import { getNicheBySlug } from "@/lib/services/niche-feed";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { LABEL_COPY } from "@/components/features/niche-finder/niche-card";
import { SignalBars } from "@/components/features/niche-finder/signal-bars";
import { OutlierCard } from "@/components/features/outliers/outlier-card";
import { ChannelGrid } from "@/app/(app)/niches/channel-grid";
import { ScoreTrendChart } from "@/app/(app)/niches/[slug]/score-trend-chart";
import { TrackNicheButton } from "@/app/(app)/niches/[slug]/track-niche-button";

import type { Metadata } from "next";

// Deduped between generateMetadata and the page (same as channel detail).
const loadNiche = cache(async (slug: string) => {
  // Reserved or malformed slugs never reach the database.
  if (!isValidNicheSlug(slug)) return { ok: false as const, error: { type: "not_found" as const } };
  return getNicheBySlug(await getRequestContext(), slug);
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadNiche(slug);
  return { title: result.ok ? `${result.value.name} — YTNiches` : "Niche — YTNiches" };
}

// Niche-Discovery-Engine.md §9.5: verdict (score + breakdown + trend), the
// evidence (top channels, top outliers), then one click to act.
export default async function NicheDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await loadNiche(slug);

  if (!result.ok && result.error.type === "not_found") notFound();

  if (!result.ok) {
    // D-072: Starter/Trial see the top 50 niches.
    return (
      <div className="mx-auto max-w-[720px] px-6 py-16 text-center">
        <Lock className="mx-auto size-10 text-text-tertiary" aria-hidden="true" />
        <h1 className="mt-4 text-h2 font-semibold text-text-primary">This niche is on Pro</h1>
        <p className="mt-2 text-body text-text-secondary">
          Your plan shows the top 50 niches. Upgrade to see every scored niche.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild>
            <Link href="/settings/billing">Upgrade</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/niches">Back to niches</Link>
          </Button>
        </div>
      </div>
    );
  }

  const niche = result.value;
  const topOutlier = niche.topOutliers[0];

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 px-6 py-6 lg:px-10">
      <Link
        href="/niches"
        className="inline-flex items-center gap-1.5 text-body-sm text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to niches
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-h1 font-semibold text-text-primary">{niche.name}</h1>
          {niche.description ? (
            <p className="mt-1 max-w-2xl text-body text-text-secondary">{niche.description}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Tag tone={niche.label === "low" ? "success" : "neutral"}>
              {LABEL_COPY[niche.label]}
            </Tag>
            {niche.whyChips.map((chip) => (
              <Tag key={chip} tone="niches">
                {chip}
              </Tag>
            ))}
          </div>
        </div>
        <div className="text-right">
          <p className="text-caption text-text-tertiary">Opportunity score</p>
          <p className="text-display-sm font-semibold text-text-primary tabular-nums">
            {niche.score}
          </p>
          <p className="text-body-sm text-text-secondary tabular-nums">
            {niche.trend === null
              ? "New this week"
              : `${niche.trend > 0 ? "+" : ""}${niche.trend} in 7 days`}
          </p>
        </div>
      </header>

      <Card className="flex flex-wrap items-center gap-3" aria-label="Next steps">
        <p className="mr-auto text-body-sm text-text-secondary">
          {formatCount(niche.channelCount)} channels · {formatCount(niche.newChannels30d)} new this
          month · {niche.medianViews === null ? "—" : formatCount(niche.medianViews)} median views
        </p>
        <TrackNicheButton slug={niche.slug} />
        {topOutlier ? (
          <Button variant="secondary" asChild>
            <Link href={`/prompts?channelId=${topOutlier.channelId}&videoId=${topOutlier.videoId}`}>
              <Sparkles />
              Generate prompts
            </Link>
          </Button>
        ) : null}
        <Button variant="secondary" asChild>
          <Link href="/calendar">
            <CalendarPlus />
            Add to calendar
          </Link>
        </Button>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="mb-3 text-h4 font-semibold text-text-primary">Score breakdown</h2>
          <SignalBars signals={niche.signals} />
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="mb-3 text-h4 font-semibold text-text-primary">Last 90 days</h2>
          <ScoreTrendChart history={niche.history} />
        </Card>
      </div>

      <section aria-labelledby="top-channels" className="space-y-3">
        <h2 id="top-channels" className="text-h3 font-semibold text-text-primary">
          Top channels
        </h2>
        {niche.topChannels.length > 0 ? (
          <ChannelGrid channels={niche.topChannels} />
        ) : (
          <p className="text-body-sm text-text-secondary">No qualifying channels right now.</p>
        )}
      </section>

      <section aria-labelledby="top-outliers" className="space-y-3">
        <h2 id="top-outliers" className="text-h3 font-semibold text-text-primary">
          Top outliers
        </h2>
        {niche.topOutliers.length > 0 ? (
          <ul className="grid gap-3 xl:grid-cols-2">
            {niche.topOutliers.map((outlier) => (
              <li key={outlier.id}>
                <OutlierCard outlier={outlier} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body-sm text-text-secondary">No outliers in the last 90 days.</p>
        )}
      </section>
    </div>
  );
}
