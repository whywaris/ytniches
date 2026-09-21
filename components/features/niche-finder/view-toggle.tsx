"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { NicheFinderView } from "@/components/features/niche-finder/types";

// UI-UX-Flow.md §5.2 "View toggle: Grid | List | Comparison (segmented
// control)". No dedicated segmented-control primitive exists in
// components/ui/ — composed from Button variants instead of adding one.
export interface ViewToggleProps {
  value: NicheFinderView;
  onValueChange: (value: NicheFinderView) => void;
  comparisonDisabled?: boolean;
  className?: string;
}

const OPTIONS: { value: NicheFinderView; label: string }[] = [
  { value: "grid", label: "Grid" },
  { value: "list", label: "List" },
  { value: "comparison", label: "Comparison" },
];

function ViewToggle({
  value,
  onValueChange,
  comparisonDisabled = false,
  className,
}: ViewToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="View"
      className={cn("inline-flex gap-0.5 rounded-sm border border-border-default p-0.5", className)}
    >
      {OPTIONS.map((option) => {
        // Disabled, not hidden, when fewer than 2 channels are selected —
        // hiding it would confuse users who don't know the feature exists.
        // No Tooltip primitive exists in components/ui/, so the native
        // `title` attribute carries the explanation instead of a new one.
        const isDisabled = option.value === "comparison" && comparisonDisabled;
        const isActive = value === option.value;
        return (
          <Button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            size="sm"
            variant={isActive ? "secondary" : "ghost"}
            disabled={isDisabled}
            title={isDisabled ? "Select 2+ channels to compare" : undefined}
            onClick={() => onValueChange(option.value)}
            className="rounded-xs"
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}

export { ViewToggle };
