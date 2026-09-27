import * as React from "react";

import Link from "next/link";

import { Compass, Flame, Lock, Users } from "lucide-react";

import {
  buildFeedUrl,
  channelFiltersToValues,
  nicheFiltersToValues,
  outlierFiltersToValues,
  stripProChannelFilters,
  withPage,
  type FeedTab,
} from "@/lib/discovery/feed-url";
import {
  CHANNEL_FILTERS,
  CHANNEL_PRESETS,
  isProTier,
  NICHE_FILTERS,
  OUTLIER_FILTERS,
  SORT_OPTIONS,
  withNicheOptions,
} from "@/lib/discovery/feed-filters";
import {
  listFeedChannels,
  listGlobalOutliers,
  listNicheOptions,
  listNiches,
} from "@/lib/services/niche-feed";
import { isFilteredViewUnlocked } from "@/lib/services/feed-credits";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FeedPagination } from "@/components/features/niche-finder/feed-pagination";
import { FilterBar } from "@/components/features/niche-finder/filter-bar/filter-bar";
import { FilteredViewGate } from "@/components/features/niche-finder/filtered-view-gate";
import { PresetProNote } from "@/components/features/niche-finder/preset-pro-note";
import { OutlierCard } from "@/components/features/outliers/outlier-card";
import { unlockFeedFiltersAction } from "@/app/(app)/niches/actions";
import { ChannelGrid } from "@/app/(app)/niches/channel-grid";
import { NicheGrid } from "@/app/(app)/niches/niche-grid";
import type { RequestContext } from "@/lib/context";
import type {
  ChannelFeedFilters,
  NicheFeedFilters,
  OutlierFeedFilters,
} from "@/lib/services/niche-feed";

// Niche-Discovery-Engine.md §9, D-077. Server-rendered tab bodies: each
// reads only our DB/cache (0 YouTube quota). The filter bar sits above
// full-width results. D-072: default views, niche-only and the presets are
// free; any other filter set shows a gate until the user pays 1 credit
// (then free for 24h). Rendering itself never charges.

function definedValues(values: Record<string, string | undefined>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(values).filter((entry): entry is [string, string] => entry[1] !== undefined),
  );
}

function FeedLayout({ bar, children }: { bar: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      {bar}
      <div className="min-w-0 space-y-4">{children}</div>
    </div>
  );
}

function FeedEmpty({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="rounded-md border border-border-subtle bg-bg-surface-1">
      <EmptyState icon={icon} message={message} />
      <p className="-mt-8 pb-10 text-center text-body-sm">
        <Link href="/niches?tab=search" className="text-accent-text hover:underline">
          Try a live search
        </Link>
      </p>
    </div>
  );
}

function Gate({ tab, values }: { tab: FeedTab; values: Record<string, string | undefined> }) {
  return (
    <FilteredViewGate tab={tab} values={definedValues(values)} unlock={unlockFeedFiltersAction} />
  );
}

async function nicheOptions() {
  return (await listNicheOptions()).map((n) => ({ value: n.slug, label: n.name }));
}

export async function NichesSection({
  ctx,
  filters,
}: {
  ctx: RequestContext;
  filters: NicheFeedFilters;
}) {
  const values = nicheFiltersToValues(filters);
  const unlocked = await isFilteredViewUnlocked(ctx, "niches", values);
  const page = unlocked ? await listNiches(ctx, filters) : null;
  const bar = (
    <FilterBar
      key={JSON.stringify(values)}
      tab="niches"
      defs={NICHE_FILTERS}
      values={values}
      isPro={isProTier(ctx.tier)}
      unlocked={unlocked}
      unlock={unlockFeedFiltersAction}
      sortOptions={SORT_OPTIONS.niches}
      defaultSort="score"
    />
  );

  if (!page) {
    return (
      <FeedLayout bar={bar}>
        <Gate tab="niches" values={values} />
      </FeedLayout>
    );
  }
  const lastPage = page.page * page.pageSize >= page.total;

  return (
    <FeedLayout bar={bar}>
      {page.items.length === 0 ? (
        <FeedEmpty
          icon={<Compass />}
          message={
            page.snapshotDate
              ? "No niches match these filters."
              : "Fresh niches land here daily. The first scores are on their way."
          }
        />
      ) : (
        <>
          <NicheGrid niches={page.items} />
          <FeedPagination
            page={page.page}
            pageSize={page.pageSize}
            total={page.total}
            hrefFor={(n) => buildFeedUrl("niches", withPage(values, n))}
          />
        </>
      )}
      {page.lockedCount > 0 && lastPage ? (
        <Card className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <Lock className="size-5 text-text-tertiary" aria-hidden="true" />
          <p className="flex-1 text-body-sm text-text-secondary">
            {page.lockedCount.toLocaleString()} more scored niches are available on Pro and Team.
          </p>
          <Button size="sm" asChild>
            <Link href="/settings/billing">Upgrade</Link>
          </Button>
        </Card>
      ) : null}
    </FeedLayout>
  );
}

export async function ChannelsSection({
  ctx,
  filters: requested,
}: {
  ctx: RequestContext;
  filters: ChannelFeedFilters;
}) {
  const isPro = isProTier(ctx.tier);
  // D-077: Pro filters are locked for Starter, on the server too.
  const filters = isPro ? requested : stripProChannelFilters(requested);
  const values = channelFiltersToValues(filters);
  const unlocked = await isFilteredViewUnlocked(ctx, "channels", values);
  const [page, niches] = await Promise.all([
    unlocked ? listFeedChannels(filters) : null,
    nicheOptions(),
  ]);
  const bar = (
    <FilterBar
      key={JSON.stringify(values)}
      tab="channels"
      defs={withNicheOptions(CHANNEL_FILTERS, niches)}
      values={values}
      isPro={isPro}
      unlocked={unlocked}
      unlock={unlockFeedFiltersAction}
      presets={CHANNEL_PRESETS}
      sortOptions={SORT_OPTIONS.channels}
      defaultSort="outlier_score"
      searchKey="q"
    />
  );

  if (!page) {
    return (
      <FeedLayout bar={bar}>
        <Gate tab="channels" values={values} />
      </FeedLayout>
    );
  }

  return (
    <FeedLayout bar={bar}>
      {page.items.length === 0 ? (
        <FeedEmpty icon={<Users />} message="No discovered channels match these filters yet." />
      ) : (
        <>
          {!isPro && filters.preset === "new-faceless" ? <PresetProNote /> : null}
          <p className="text-caption text-text-tertiary">{page.total.toLocaleString()} channels</p>
          <ChannelGrid channels={page.items} />
          <FeedPagination
            page={page.page}
            pageSize={page.pageSize}
            total={page.total}
            hrefFor={(n) => buildFeedUrl("channels", withPage(values, n))}
          />
        </>
      )}
    </FeedLayout>
  );
}

export async function OutliersSection({
  ctx,
  filters,
}: {
  ctx: RequestContext;
  filters: OutlierFeedFilters;
}) {
  const values = outlierFiltersToValues(filters);
  const unlocked = await isFilteredViewUnlocked(ctx, "outliers", values);
  const [page, niches] = await Promise.all([
    unlocked ? listGlobalOutliers(filters) : null,
    nicheOptions(),
  ]);
  const bar = (
    <FilterBar
      key={JSON.stringify(values)}
      tab="outliers"
      defs={withNicheOptions(OUTLIER_FILTERS, niches)}
      values={values}
      isPro={isProTier(ctx.tier)}
      unlocked={unlocked}
      unlock={unlockFeedFiltersAction}
    />
  );

  if (!page) {
    return (
      <FeedLayout bar={bar}>
        <Gate tab="outliers" values={values} />
      </FeedLayout>
    );
  }

  return (
    <FeedLayout bar={bar}>
      {page.items.length === 0 ? (
        <FeedEmpty icon={<Flame />} message="No breakout videos match these filters yet." />
      ) : (
        <>
          <ul className="grid gap-3 xl:grid-cols-2">
            {page.items.map((outlier) => (
              <li key={outlier.id}>
                <OutlierCard outlier={outlier} />
              </li>
            ))}
          </ul>
          <FeedPagination
            page={page.page}
            pageSize={page.pageSize}
            total={page.total}
            hrefFor={(n) => buildFeedUrl("outliers", withPage(values, n))}
          />
        </>
      )}
    </FeedLayout>
  );
}
