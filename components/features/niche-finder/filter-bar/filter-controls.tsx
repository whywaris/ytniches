"use client";

import * as React from "react";

import { ChevronDown } from "lucide-react";

import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";
import { NumberInput } from "@/components/ui/number-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TextInput } from "@/components/ui/text-input";
import { Tooltip } from "@/components/ui/tooltip";
import { filterKeys, type FeedFilterDef } from "@/lib/discovery/feed-filters";

// D-077: one control per filter definition, used in the bar's chips, the
// "+ More filters" panel and the mobile sheet alike.

export type FilterValues = Record<string, string | undefined>;

function isSet(values: FilterValues, def: FeedFilterDef): boolean {
  return filterKeys(def).some((key) => values[key] !== undefined && values[key] !== "");
}

// "Subscribers: 1K–10K", "Language: English" -- the chip / active-chip text.
export function summarize(def: FeedFilterDef, values: FilterValues): string | null {
  if (!isSet(values, def)) return null;
  const control = def.control;
  switch (control.kind) {
    case "range": {
      const min = values[control.minKey];
      const max = values[control.maxKey];
      const preset = control.presets.find(
        (p) => String(p.min ?? "") === (min ?? "") && String(p.max ?? "") === (max ?? ""),
      );
      if (preset) return preset.label;
      if (min && max) return `${formatCount(Number(min))}–${formatCount(Number(max))}`;
      return min ? `${formatCount(Number(min))}+` : `Up to ${formatCount(Number(max))}`;
    }
    case "options":
      return (
        control.options.find((option) => option.value === values[control.key])?.label ??
        values[control.key] ??
        null
      );
    case "toggle":
      return "On";
    case "date":
    case "number":
      return `${values[control.key]}${control.kind === "number" && control.suffix ? control.suffix : ""}`;
  }
}

export interface FilterControlProps {
  def: FeedFilterDef;
  values: FilterValues;
  onChange: (patch: FilterValues) => void;
  disabled?: boolean;
  idPrefix: string;
}

function OptionButton({
  pressed,
  label,
  hint,
  disabled,
  onClick,
}: {
  pressed: boolean;
  label: string;
  hint?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  const button = (
    <button
      type="button"
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-sm border px-2.5 py-1 text-body-sm transition-colors duration-fast",
        pressed
          ? "border-accent-border bg-accent-subtle text-accent-text"
          : "border-border-default text-text-secondary hover:bg-bg-hover hover:text-text-primary",
        "disabled:pointer-events-none disabled:opacity-50",
      )}
    >
      {label}
    </button>
  );
  return hint ? <Tooltip content={hint}>{button}</Tooltip> : button;
}

export function FilterControl({ def, values, onChange, disabled, idPrefix }: FilterControlProps) {
  const control = def.control;
  const id = `${idPrefix}-${def.id}`;

  switch (control.kind) {
    case "range": {
      const min = values[control.minKey] ?? "";
      const max = values[control.maxKey] ?? "";
      return (
        <div className="flex flex-col gap-3">
          <div role="group" aria-label={`${def.label} presets`} className="flex flex-wrap gap-1.5">
            {control.presets.map((preset) => {
              const pressed = min === String(preset.min ?? "") && max === String(preset.max ?? "");
              return (
                <OptionButton
                  key={preset.label}
                  label={preset.label}
                  pressed={pressed}
                  disabled={disabled}
                  onClick={() =>
                    onChange(
                      pressed
                        ? { [control.minKey]: undefined, [control.maxKey]: undefined }
                        : {
                            [control.minKey]: preset.min?.toString(),
                            [control.maxKey]: preset.max?.toString(),
                          },
                    )
                  }
                />
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <NumberInput
              id={`${id}-min`}
              label="Min"
              min={0}
              value={min}
              disabled={disabled}
              onChange={(event) => onChange({ [control.minKey]: event.target.value || undefined })}
            />
            <NumberInput
              id={`${id}-max`}
              label="Max"
              min={0}
              value={max}
              disabled={disabled}
              onChange={(event) => onChange({ [control.maxKey]: event.target.value || undefined })}
            />
          </div>
        </div>
      );
    }
    case "options": {
      const current = values[control.key];
      // Long lists (niches) read better as a select.
      if (control.options.length > 12) {
        return (
          <Select
            label={def.label}
            placeholder="Any"
            options={control.options}
            value={current ?? ""}
            disabled={disabled}
            onValueChange={(value) => onChange({ [control.key]: value || undefined })}
          />
        );
      }
      return (
        <div role="group" aria-label={def.label} className="flex flex-wrap gap-1.5">
          <OptionButton
            label="Any"
            pressed={current === undefined}
            disabled={disabled}
            onClick={() => onChange({ [control.key]: undefined })}
          />
          {control.options.map((option) => (
            <OptionButton
              key={option.value}
              label={option.label}
              hint={option.hint}
              pressed={current === option.value}
              disabled={disabled}
              onClick={() => onChange({ [control.key]: option.value })}
            />
          ))}
        </div>
      );
    }
    case "toggle":
      return (
        <label htmlFor={id} className="flex items-center justify-between gap-3 text-body-sm">
          <span className="text-text-primary">{def.label}</span>
          <Switch
            id={id}
            checked={values[control.key] === "1"}
            disabled={disabled}
            onCheckedChange={(checked) => onChange({ [control.key]: checked ? "1" : undefined })}
          />
        </label>
      );
    case "date":
      return (
        <TextInput
          id={id}
          type="date"
          label={def.label}
          value={values[control.key] ?? ""}
          disabled={disabled}
          onChange={(event) => onChange({ [control.key]: event.target.value || undefined })}
        />
      );
    case "number":
      return (
        <NumberInput
          id={id}
          label={def.label}
          min={control.min}
          step={control.step}
          value={values[control.key] ?? ""}
          disabled={disabled}
          onChange={(event) => onChange({ [control.key]: event.target.value || undefined })}
        />
      );
  }
}

// A dropdown chip in the bar: label + current value, control in a popover.
export function FilterChip(props: FilterControlProps) {
  const summary = summarize(props.def, props.values);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-sm border px-3 text-body-sm transition-colors duration-fast",
            summary
              ? "border-accent-border bg-accent-subtle text-accent-text"
              : "border-border-default text-text-secondary hover:bg-bg-hover hover:text-text-primary",
          )}
        >
          <span>
            {props.def.label}
            {summary ? <span className="font-medium">: {summary}</span> : null}
          </span>
          <ChevronDown aria-hidden="true" className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent aria-label={`${props.def.label} filter`} className="w-80">
        <p className="mb-3 text-body-sm font-medium text-text-primary">{props.def.label}</p>
        <FilterControl {...props} />
      </PopoverContent>
    </Popover>
  );
}
