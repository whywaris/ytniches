"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { SlidersHorizontal } from "lucide-react";

import { buildFeedUrl, type FeedTab } from "@/lib/discovery/feed-url";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TextInput } from "@/components/ui/text-input";

// Niche-Discovery-Engine.md §9.4. Field-driven so each tab declares its own
// filters server-side. Applying navigates to the new URL (filters live in
// the query string); a left panel on desktop, a bottom sheet on mobile.

export type FilterField =
  | {
      kind: "select";
      key: string;
      label: string;
      options: { value: string; label: string }[];
      /** A select with a default (e.g. sort) has no "Any" option. */
      defaultValue?: string;
    }
  | { kind: "number"; key: string; label: string; min?: number; max?: number; step?: number }
  | { kind: "date"; key: string; label: string }
  | { kind: "toggle"; key: string; label: string };

export type FilterValues = Record<string, string | undefined>;

export interface FeedFilterPanelProps {
  tab: FeedTab;
  fields: FilterField[];
  /** Current URL values. Render with `key` = these values serialised, so a
   * navigation (back/forward, a niche link) resets the draft. */
  values: FilterValues;
}

// Radix Select can't hold an empty value, so "any" stands in for "no filter".
const ANY = "any";

function FilterForm({
  fields,
  draft,
  setDraft,
  idPrefix,
}: {
  fields: FilterField[];
  draft: FilterValues;
  setDraft: React.Dispatch<React.SetStateAction<FilterValues>>;
  idPrefix: string;
}) {
  const set = (key: string, value: string | undefined) =>
    setDraft((current) => ({ ...current, [key]: value === "" ? undefined : value }));

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const id = `${idPrefix}-${field.key}`;
        switch (field.kind) {
          case "select": {
            const fallback = field.defaultValue ?? ANY;
            return (
              <Select
                key={field.key}
                label={field.label}
                options={
                  field.defaultValue
                    ? field.options
                    : [{ value: ANY, label: "Any" }, ...field.options]
                }
                value={draft[field.key] ?? fallback}
                onValueChange={(value) => set(field.key, value === fallback ? undefined : value)}
              />
            );
          }
          case "number":
            return (
              <TextInput
                key={field.key}
                id={id}
                label={field.label}
                type="number"
                inputMode="decimal"
                min={field.min}
                max={field.max}
                step={field.step}
                value={draft[field.key] ?? ""}
                onChange={(event) => set(field.key, event.target.value)}
              />
            );
          case "date":
            return (
              <TextInput
                key={field.key}
                id={id}
                label={field.label}
                type="date"
                value={draft[field.key] ?? ""}
                onChange={(event) => set(field.key, event.target.value)}
              />
            );
          case "toggle":
            return (
              <div key={field.key} className="flex items-center justify-between gap-3">
                <label htmlFor={id} className="text-body-sm text-text-primary">
                  {field.label}
                </label>
                <Switch
                  id={id}
                  checked={draft[field.key] === "1"}
                  onCheckedChange={(checked) => set(field.key, checked ? "1" : undefined)}
                />
              </div>
            );
        }
      })}
    </div>
  );
}

function FeedFilterPanel({ tab, fields, values }: FeedFilterPanelProps) {
  const router = useRouter();
  const [draft, setDraft] = React.useState<FilterValues>(values);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  // Page resets on every apply (it isn't in `draft`).
  const buildHref = (next: FilterValues) => buildFeedUrl(tab, next);

  const apply = () => {
    setSheetOpen(false);
    router.push(buildHref(draft));
  };
  const reset = () => {
    setDraft({});
    setSheetOpen(false);
    router.push(buildHref({}));
  };
  const activeCount = Object.values(values).filter((value) => value !== undefined).length;

  return (
    <>
      <div className="lg:hidden">
        <Button size="sm" variant="secondary" onClick={() => setSheetOpen(true)}>
          <SlidersHorizontal />
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </Button>
        <Modal
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          title="Filters"
          footer={
            <>
              <Button size="sm" variant="ghost" onClick={reset}>
                Reset
              </Button>
              <Button size="sm" onClick={apply}>
                Apply
              </Button>
            </>
          }
        >
          <FilterForm fields={fields} draft={draft} setDraft={setDraft} idPrefix="sheet" />
        </Modal>
      </div>

      <aside
        aria-label="Filters"
        className="hidden w-72 shrink-0 self-start rounded-md border border-border-subtle bg-bg-surface-1 p-4 lg:sticky lg:top-4 lg:block"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-body font-semibold text-text-primary">Filters</h2>
          <Button size="xs" variant="link" onClick={reset}>
            Reset
          </Button>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            apply();
          }}
        >
          <FilterForm fields={fields} draft={draft} setDraft={setDraft} idPrefix="panel" />
          <Button type="submit" size="sm" fullWidth className="mt-4">
            Apply filters
          </Button>
        </form>
      </aside>
    </>
  );
}

export { FeedFilterPanel };
