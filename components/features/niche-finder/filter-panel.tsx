"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField, inputVariants } from "@/components/ui/form-field";
import { MultiSelect } from "@/components/ui/multi-select";
import { NumberInput } from "@/components/ui/number-input";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import {
  DEFAULT_FILTER_VALUES,
  type NicheFilterValues,
} from "@/components/features/niche-finder/filter-values";

// UI-UX-Flow.md §5.1 filter panel. Controlled + presentational: the page
// owns the URL <-> values sync (Application-Flow.md §2.5 — filters live in
// the URL, not component state), this just renders `values` and reports
// changes. String fields for the numeric ranges (not number) so the native
// inputs stay controlled without empty-string/NaN edge cases; the page
// coerces to number before calling the Server Action.
//
// NicheFilterValues/DEFAULT_FILTER_VALUES live in filter-values.ts, not
// here, and are re-exported below for client-side consumers only — server
// code (url-filters.ts) must import the value directly from filter-values.ts.
// Importing a value export from a "use client" file (this one) from server
// code gets a client-reference proxy, not the real object; DEFAULT_FILTER_VALUES
// silently stopped being the real default shape when it lived here.
export { DEFAULT_FILTER_VALUES, type NicheFilterValues };

export interface FilterPanelProps {
  values: NicheFilterValues;
  onChange: (values: NicheFilterValues) => void;
  onSearch: () => void;
  onReset: () => void;
  className?: string;
}

const UPLOAD_FREQUENCY_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "weekly", label: "Weekly" },
  { value: "2-4-week", label: "2-4 per week" },
  { value: "daily-plus", label: "Daily+" },
];

const MONETIZED_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

// Placeholder reference lists, not exhaustive — no language/country
// reference list exists anywhere in the spec docs. Easy to extend in one
// place; not worth a shared constants file for a first pass.
const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "pt", label: "Portuguese" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "hi", label: "Hindi" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
];

const COUNTRY_OPTIONS = [
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "IN", label: "India" },
  { value: "DE", label: "Germany" },
  { value: "BR", label: "Brazil" },
  { value: "PH", label: "Philippines" },
];

function isAtDefault(values: NicheFilterValues): boolean {
  return (
    values.subscribersMin === "" &&
    values.subscribersMax === "" &&
    values.avgViewsMin === "" &&
    values.avgViewsMax === "" &&
    values.uploadFrequency === "any" &&
    values.monetized === "any" &&
    values.languages.length === 0 &&
    values.countries.length === 0 &&
    values.createdAfter === ""
  );
}

function FilterPanel({ values, onChange, onSearch, onReset, className }: FilterPanelProps) {
  const dateId = React.useId();

  function set<K extends keyof NicheFilterValues>(key: K, value: NicheFilterValues[K]) {
    onChange({ ...values, [key]: value });
  }

  // PRD.md §6.1: "disabled if no keyword AND all filters at default."
  const searchDisabled = values.keyword.trim() === "" && isAtDefault(values);

  return (
    <Card variant="base" padding="md" className={cn("sticky top-6 flex flex-col gap-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-h4 text-text-primary">Filters</h3>
        <Button variant="link" size="sm" onClick={onReset}>
          Reset
        </Button>
      </div>

      <SearchInput
        label="Keyword"
        placeholder="Try: sleep music, history facts"
        value={values.keyword}
        onChange={(event) => set("keyword", event.target.value)}
        onClear={() => set("keyword", "")}
      />

      <div className="grid grid-cols-2 gap-2">
        <NumberInput
          label="Subscribers min"
          value={values.subscribersMin}
          onChange={(event) => set("subscribersMin", event.target.value)}
        />
        <NumberInput
          label="Subscribers max"
          value={values.subscribersMax}
          onChange={(event) => set("subscribersMax", event.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <NumberInput
          label="Avg views min"
          value={values.avgViewsMin}
          onChange={(event) => set("avgViewsMin", event.target.value)}
        />
        <NumberInput
          label="Avg views max"
          value={values.avgViewsMax}
          onChange={(event) => set("avgViewsMax", event.target.value)}
        />
      </div>

      <Select
        label="Upload frequency"
        options={UPLOAD_FREQUENCY_OPTIONS}
        value={values.uploadFrequency}
        onValueChange={(value) =>
          set("uploadFrequency", value as NicheFilterValues["uploadFrequency"])
        }
      />

      <Select
        label="Monetized"
        options={MONETIZED_OPTIONS}
        value={values.monetized}
        onValueChange={(value) => set("monetized", value as NicheFilterValues["monetized"])}
      />

      <MultiSelect
        label="Language"
        options={LANGUAGE_OPTIONS}
        value={values.languages}
        onValueChange={(value) => set("languages", value)}
      />

      <MultiSelect
        label="Country"
        options={COUNTRY_OPTIONS}
        value={values.countries}
        onValueChange={(value) => set("countries", value)}
      />

      {/* Single date, not a range — DateRangeInput is for start/end pairs,
          reusing it for one field would be the wrong composition. Built
          from the same FormField + inputVariants DateRangeInput itself
          uses internally, not a new base component. */}
      <FormField
        label="Channel age"
        htmlFor={dateId}
        helperId={`${dateId}-helper`}
        errorId={`${dateId}-error`}
      >
        <input
          id={dateId}
          type="date"
          aria-label="Created after"
          value={values.createdAfter}
          onChange={(event) => set("createdAfter", event.target.value)}
          className={cn(inputVariants({}))}
        />
      </FormField>

      <Button fullWidth disabled={searchDisabled} onClick={onSearch}>
        Search
      </Button>
    </Card>
  );
}

export { FilterPanel };
