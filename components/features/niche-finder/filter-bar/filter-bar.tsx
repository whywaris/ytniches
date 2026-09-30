"use client";

import * as React from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Lock, SlidersHorizontal, Sparkles, X } from "lucide-react";

import { billableFilters, buildFeedUrl, type FeedTab } from "@/lib/discovery/feed-url";
import { filterKeys, type FeedFilterDef } from "@/lib/discovery/feed-filters";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast-provider";
import { Tooltip } from "@/components/ui/tooltip";
import {
  FilterChip,
  FilterControl,
  summarize,
  type FilterValues,
} from "@/components/features/niche-finder/filter-bar/filter-controls";

// D-077 (replaces the sidebar panel): a horizontal bar above full-width
// results. Filters live in the URL (spec §9.4). D-072: a custom filter set
// costs 1 credit per 24h; default feeds, niche-only and the presets are free.
// Charging happens only on "Show results", never while rendering.

export type UnlockFeedFilters = (
  tab: FeedTab,
  values: Record<string, string>,
  idempotencyKey: string,
) => Promise<{ ok: true; value: { charged: boolean } } | { ok: false; error: { type: string } }>;

export interface FilterPreset {
  id: string;
  label: string;
  hint: string;
}

export interface FilterBarProps {
  tab: FeedTab;
  /** Every filter for this tab (Pro ones go behind "+ More filters"). */
  defs: FeedFilterDef[];
  /** Applied values, from the URL. */
  values: FilterValues;
  isPro: boolean;
  /** The applied view is already free or paid for (no charge to re-show). */
  unlocked: boolean;
  unlock: UnlockFeedFilters;
  presets?: readonly FilterPreset[];
  sortOptions?: readonly { value: string; label: string }[];
  defaultSort?: string;
  /** Show the name search input (Channels tab). */
  searchKey?: string;
}

function defined(values: FilterValues): Record<string, string> {
  return Object.fromEntries(
    Object.entries(values).filter((entry): entry is [string, string] => !!entry[1]),
  );
}

function sameFilters(a: FilterValues, b: FilterValues): boolean {
  return JSON.stringify(billableFilters(a)) === JSON.stringify(billableFilters(b));
}

function FilterBar({
  tab,
  defs,
  values,
  isPro,
  unlocked,
  unlock,
  presets = [],
  sortOptions,
  defaultSort,
  searchKey,
}: FilterBarProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = React.useTransition();
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [moreOpen, setMoreOpen] = React.useState(false);

  const activePreset = values.preset;
  const sort = values.sort;
  // A preset is its own filter set; editing starts a fresh custom one.
  const applied: FilterValues = activePreset
    ? {}
    : { ...values, sort: undefined, preset: undefined };
  const [draft, setDraft] = React.useState<FilterValues>(applied);
  const patch = (next: FilterValues) => setDraft((current) => ({ ...current, ...next }));

  const basic = defs.filter((def) => def.tier === "basic");
  const pro = defs.filter((def) => def.tier === "pro");
  const lockedPro = !isPro;

  const draftChanged =
    !sameFilters(draft, applied) ||
    (activePreset !== undefined && Object.keys(defined(draft)).length > 0);
  const billable = billableFilters(draft) !== null;
  const costsCredit = billable && (draftChanged || !unlocked);

  const go = (next: FilterValues) => router.push(buildFeedUrl(tab, { ...next, sort }));

  const showResults = () =>
    startTransition(async () => {
      const next = defined(draft);
      if (costsCredit) {
        const result = await unlock(tab, next, crypto.randomUUID());
        if (!result.ok) {
          showToast({
            title:
              result.error.type === "insufficient_credits"
                ? "You need 1 credit for a filtered search. Top up or upgrade to continue."
                : "Couldn't apply these filters.",
            variant: "error",
          });
          return;
        }
      }
      setSheetOpen(false);
      go(next);
    });

  const removeApplied = (def: FeedFilterDef) => {
    const next = { ...applied };
    for (const key of filterKeys(def)) next[key] = undefined;
    go(next);
  };

  const activeChips = defs
    .map((def) => ({ def, summary: summarize(def, applied) }))
    .filter((chip) => chip.summary !== null);
  const searchValue = searchKey ? (draft[searchKey] ?? "") : "";
  const proActive = pro.filter((def) => summarize(def, draft) !== null).length;
  const buttonLabel = `Show results · ${costsCredit ? "1 credit" : "free"}`;

  const searchInput = searchKey ? (
    <SearchInput
      aria-label="Search channels by name"
      placeholder="Search channels"
      value={searchValue}
      onChange={(event) => patch({ [searchKey]: event.target.value || undefined })}
      onClear={() => patch({ [searchKey]: undefined })}
      onKeyDown={(event) => {
        if (event.key === "Enter") showResults();
      }}
    />
  ) : null;

  const sortSelect = sortOptions ? (
    <Select
      label="Sort by"
      options={[...sortOptions]}
      value={sort ?? defaultSort}
      onValueChange={(value) =>
        router.push(
          buildFeedUrl(tab, {
            ...(activePreset ? { preset: activePreset } : applied),
            sort: value === defaultSort ? undefined : value,
          }),
        )
      }
    />
  ) : null;

  const lockedNote = lockedPro ? (
    <p className="flex items-center gap-1.5 text-body-sm text-text-secondary">
      <Lock aria-hidden="true" className="size-3.5" />
      Pro filters.{" "}
      <Link href="/settings/billing" className="font-medium text-accent-text hover:underline">
        Upgrade to use them
      </Link>
    </p>
  ) : null;

  const presetRow =
    presets.length > 0 ? (
      <div role="group" aria-label="Presets" className="flex flex-wrap items-center gap-1.5">
        <span className="text-caption text-text-tertiary">Presets (free):</span>
        {presets.map((preset) => (
          <Tooltip key={preset.id} content={preset.hint}>
            <button
              type="button"
              aria-pressed={activePreset === preset.id}
              onClick={() => router.push(buildFeedUrl(tab, { preset: preset.id, sort }))}
              className={cn(
                "inline-flex h-7 items-center gap-1 rounded-full border px-3 text-caption transition-colors duration-fast",
                activePreset === preset.id
                  ? "border-accent-border bg-accent-subtle text-accent-text"
                  : "border-border-default text-text-secondary hover:bg-bg-hover hover:text-text-primary",
              )}
            >
              <Sparkles aria-hidden="true" className="size-3" />
              {preset.label}
            </button>
          </Tooltip>
        ))}
      </div>
    ) : null;

  const activeRow =
    activeChips.length > 0 || activePreset ? (
      <ul aria-label="Active filters" className="flex flex-wrap items-center gap-1.5">
        {activePreset ? (
          <li>
            <button
              type="button"
              onClick={() => go({})}
              className="inline-flex h-7 items-center gap-1 rounded-full bg-bg-surface-2 px-3 text-caption text-text-primary hover:bg-bg-hover"
              aria-label={`Remove preset ${presets.find((p) => p.id === activePreset)?.label ?? activePreset}`}
            >
              {presets.find((p) => p.id === activePreset)?.label ?? activePreset}
              <X aria-hidden="true" className="size-3" />
            </button>
          </li>
        ) : null}
        {activeChips.map(({ def, summary }) => (
          <li key={def.id}>
            <button
              type="button"
              onClick={() => removeApplied(def)}
              aria-label={`Remove ${def.label}: ${summary}`}
              className="inline-flex h-7 items-center gap-1 rounded-full bg-bg-surface-2 px-3 text-caption text-text-primary hover:bg-bg-hover"
            >
              {def.label}: {summary}
              <X aria-hidden="true" className="size-3" />
            </button>
          </li>
        ))}
        <li>
          <Button size="xs" variant="link" onClick={() => go({})}>
            Clear all
          </Button>
        </li>
      </ul>
    ) : null;

  return (
    <section aria-label="Filters" className="flex flex-col gap-3">
      {/* Desktop and tablet: the bar. */}
      <div className="hidden flex-col gap-3 rounded-md border border-border-subtle bg-bg-surface-1 p-3 md:flex">
        <div className="flex flex-wrap items-end gap-2">
          {searchInput ? <div className="w-64">{searchInput}</div> : null}
          {basic.map((def) => (
            <FilterChip key={def.id} def={def} values={draft} onChange={patch} idPrefix="bar" />
          ))}
          {pro.length > 0 ? (
            <Button
              size="sm"
              variant="ghost"
              aria-expanded={moreOpen}
              aria-controls="more-filters"
              onClick={() => setMoreOpen((open) => !open)}
            >
              {lockedPro ? <Lock /> : <SlidersHorizontal />}+ More filters
              {proActive > 0 ? ` (${proActive})` : ""}
            </Button>
          ) : null}
          <div className="ml-auto flex items-end gap-2">
            {sortSelect ? <div className="w-44">{sortSelect}</div> : null}
            <Button size="sm" loading={pending} onClick={showResults}>
              {buttonLabel}
            </Button>
          </div>
        </div>
        {moreOpen && pro.length > 0 ? (
          <div
            id="more-filters"
            className="grid gap-4 border-t border-border-subtle pt-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            <div className="sm:col-span-2 lg:col-span-3">{lockedNote}</div>
            {pro.map((def) => (
              <FilterControl
                key={def.id}
                def={def}
                values={draft}
                onChange={patch}
                disabled={lockedPro}
                idPrefix="more"
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Mobile: one button, everything in a bottom sheet. */}
      <div className="flex items-center gap-2 md:hidden">
        <Button size="sm" variant="secondary" onClick={() => setSheetOpen(true)}>
          <SlidersHorizontal />
          Filters{activeChips.length > 0 ? ` (${activeChips.length})` : ""}
        </Button>
        <Sheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          title="Filters"
          footer={
            <Button fullWidth loading={pending} onClick={showResults}>
              {buttonLabel}
            </Button>
          }
        >
          <div className="flex flex-col gap-5">
            {searchInput}
            {presetRow}
            {basic.map((def) => (
              <fieldset key={def.id} className="flex flex-col gap-2">
                <legend className="mb-1 text-body-sm font-medium text-text-primary">
                  {def.label}
                </legend>
                <FilterControl def={def} values={draft} onChange={patch} idPrefix="sheet" />
              </fieldset>
            ))}
            {pro.length > 0 ? (
              <fieldset className="flex flex-col gap-3 border-t border-border-subtle pt-4">
                <legend className="mb-1 text-body-sm font-medium text-text-primary">
                  More filters
                </legend>
                {lockedNote}
                {pro.map((def) => (
                  <FilterControl
                    key={def.id}
                    def={def}
                    values={draft}
                    onChange={patch}
                    disabled={lockedPro}
                    idPrefix="sheet"
                  />
                ))}
              </fieldset>
            ) : null}
            {sortSelect}
          </div>
        </Sheet>
      </div>

      <div className="hidden md:block">{presetRow}</div>
      {activeRow}
    </section>
  );
}

export { FilterBar };
