import * as React from "react";

import Link from "next/link";

import { Compass, Flame, Lock, Users } from "lucide-react";

import {
  buildFeedUrl,
  channelFiltersToValues,
  nicheFiltersToValues,
  outlierFiltersToValues,
  withPage,
} from "@/lib/discovery/feed-url";
import {
  listFeedChannels,
  listGlobalOutliers,
  listNicheOptions,
  listNiches,
} from "@/lib/services/niche-feed";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  FeedFilterPanel,
  type FilterField,
} from "@/components/features/niche-finder/feed-filter-panel";
import { FeedPagination } from "@/components/features/niche-finder/feed-pagination";
import { OutlierCard } from "@/components/features/outliers/outlier-card";
import { ChannelGrid } from "@/app/(app)/niches/channel-grid";
import { NicheGrid } from "@/app/(app)/niches/niche-grid";
import type { RequestContext } from "@/lib/context";
import type {
  ChannelFeedFilters,
  NicheFeedFilters,
  OutlierFeedFilters,
} from "@/lib/services/niche-feed";

// Niche-Discovery-Engine.md §9. Server-rendered tab bodies: each reads only
// our DB/cache (0 credits, 0 YouTube quota, D-072).

function FeedLayout({
  filters,
  children,
}: {
  filters: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      {filters}
      <div className="min-w-0 flex-1 space-y-4">{children}</div>
    </div>
  );
}

function FeedEmpty({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="rounded-md border border-border-subtle bg-bg-surface-1">
      <EmptyState icon={icon} message={message} />
      <p className="-mt-8 pb-10 text-center text-body-sm">
        <Link href="/niches?tab=search" className="text-accent hover:underline">
          Try a live search
        </Link>
      </p>
    </div>
  );
}

const STATUS_OPTIONS = [
  { value: "rising", label: "Rising" },
  { value: "active", label: "Active" },
  { value: "saturated", label: "Saturated" },
  { value: "declining", label: "Declining" },
];

export async function NichesSection({
  ctx,
  filters,
}: {
  ctx: RequestContext;
  filters: NicheFeedFilters;
}) {
  const page = await listNiches(ctx, filters);
  const values = nicheFiltersToValues(filters);
  const fields: FilterField[] = [
    { kind: "number", key: "minScore", label: "Min score", min: 0, max: 100 },
    { kind: "number", key: "maxScore", label: "Max score", min: 0, max: 100 },
    { kind: "select", key: "status", label: "Status", options: STATUS_OPTIONS },
    {
      kind: "select",
      key: "sort",
      label: "Sort by",
      defaultValue: "score",
      options: [
        { value: "score", label: "Opportunity score" },
        { value: "trend", label: "7-day trend" },
        { value: "newest", label: "Newest niche" },
      ],
    },
  ];
  const lastPage = page.page * page.pageSize >= page.total;

  return (
    <FeedLayout
      filters={
        <FeedFilterPanel
          key={JSON.stringify(values)}
          tab="niches"
          fields={fields}
          values={values}
        />
      }
    >
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

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "pt", label: "Portuguese" },
  { value: "hi", label: "Hindi" },
  { value: "ur", label: "Urdu" },
  { value: "ar", label: "Arabic" },
  { value: "de", label: "German" },
  { value: "fr", label: "French" },
  { value: "id", label: "Indonesian" },
  { value: "ja", label: "Japanese" },
];

export async function ChannelsSection({ filters }: { filters: ChannelFeedFilters }) {
  const [page, nicheOptions] = await Promise.all([listFeedChannels(filters), listNicheOptions()]);
  const values = channelFiltersToValues(filters);
  const nicheSelect = nicheOptions.map((n) => ({ value: n.slug, label: n.name }));
  const fields: FilterField[] = [
    { kind: "select", key: "niche", label: "Niche", options: nicheSelect },
    { kind: "date", key: "after", label: "Started after" },
    { kind: "date", key: "before", label: "Started before" },
    { kind: "number", key: "minSubs", label: "Min subscribers", min: 0 },
    { kind: "number", key: "maxSubs", label: "Max subscribers", min: 0 },
    { kind: "number", key: "minViews", label: "Min avg views", min: 0 },
    { kind: "number", key: "maxViews", label: "Max avg views", min: 0 },
    { kind: "number", key: "minOutlier", label: "Min outlier score", min: 0, step: 0.1 },
    { kind: "toggle", key: "faceless", label: "Faceless only" },
    { kind: "toggle", key: "noKids", label: "Exclude kids content" },
    { kind: "toggle", key: "shorts", label: "Has Shorts" },
    { kind: "toggle", key: "monetized", label: "Likely monetized (est.)" },
    { kind: "select", key: "lang", label: "Language", options: LANGUAGE_OPTIONS },
    {
      kind: "select",
      key: "sort",
      label: "Sort by",
      defaultValue: "outlier_score",
      options: [
        { value: "outlier_score", label: "Outlier score" },
        { value: "avg_views", label: "Avg views" },
        { value: "newest", label: "Newest channel" },
        { value: "subscribers", label: "Subscribers" },
      ],
    },
  ];

  return (
    <FeedLayout
      filters={
        <FeedFilterPanel
          key={JSON.stringify(values)}
          tab="channels"
          fields={fields}
          values={values}
        />
      }
    >
      {page.items.length === 0 ? (
        <FeedEmpty icon={<Users />} message="No discovered channels match these filters yet." />
      ) : (
        <>
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

export async function OutliersSection({ filters }: { filters: OutlierFeedFilters }) {
  const [page, nicheOptions] = await Promise.all([listGlobalOutliers(filters), listNicheOptions()]);
  const values = outlierFiltersToValues(filters);
  const fields: FilterField[] = [
    {
      kind: "select",
      key: "niche",
      label: "Niche",
      options: nicheOptions.map((n) => ({ value: n.slug, label: n.name })),
    },
    { kind: "number", key: "minMultiple", label: "Min multiple (x)", min: 3, step: 0.5 },
    {
      kind: "select",
      key: "within",
      label: "Published within",
      defaultValue: "30",
      options: [
        { value: "7", label: "7 days" },
        { value: "30", label: "30 days" },
        { value: "90", label: "90 days" },
      ],
    },
  ];

  return (
    <FeedLayout
      filters={
        <FeedFilterPanel
          key={JSON.stringify(values)}
          tab="outliers"
          fields={fields}
          values={values}
        />
      }
    >
      {page.items.length === 0 ? (
        <FeedEmpty icon={<Flame />} message="No outliers match these filters yet." />
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
