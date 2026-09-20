import * as React from "react";

import { Popover as RadixPopover } from "radix-ui";
import { SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { ColumnDef, TableDensity } from "@/components/ui/table";

export interface TableToolbarProps<T> {
  columns: ColumnDef<T>[];
  visibleColumnKeys: Set<string>;
  onToggleColumn: (key: string) => void;
  density: TableDensity;
  onDensityChange: (density: TableDensity) => void;
  selectedRows: T[];
  renderBulkActions?: (selectedRows: T[], clearSelection: () => void) => React.ReactNode;
  onClearSelection: () => void;
}

function TableToolbar<T>({
  columns,
  visibleColumnKeys,
  onToggleColumn,
  density,
  onDensityChange,
  selectedRows,
  renderBulkActions,
  onClearSelection,
}: TableToolbarProps<T>) {
  if (selectedRows.length > 0) {
    return (
      <div className="flex items-center justify-between border-b border-border-subtle bg-bg-surface-1 px-3 py-2">
        <span className="text-body-sm text-text-primary">{selectedRows.length} selected</span>
        <div className="flex items-center gap-2">
          {renderBulkActions?.(selectedRows, onClearSelection)}
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            Clear
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2 border-b border-border-subtle bg-bg-surface-1 px-3 py-2">
      <div className="flex items-center rounded-sm border border-border-default p-0.5">
        <button
          type="button"
          onClick={() => onDensityChange("compact")}
          aria-pressed={density === "compact"}
          className={cn(
            // text-secondary, not text-tertiary: fails WCAG AA against
            // bg-surface-1 at this size — see DECISIONS.md review, 2026-09-20.
            "rounded-xs px-2 py-1 text-caption",
            density === "compact" ? "bg-bg-hover text-text-primary" : "text-text-secondary",
          )}
        >
          Compact
        </button>
        <button
          type="button"
          onClick={() => onDensityChange("comfortable")}
          aria-pressed={density === "comfortable"}
          className={cn(
            "rounded-xs px-2 py-1 text-caption",
            density === "comfortable" ? "bg-bg-hover text-text-primary" : "text-text-secondary",
          )}
        >
          Comfortable
        </button>
      </div>
      <RadixPopover.Root>
        <RadixPopover.Trigger asChild>
          <Button variant="ghost" size="sm">
            <SlidersHorizontal /> Columns
          </Button>
        </RadixPopover.Trigger>
        <RadixPopover.Portal>
          <RadixPopover.Content
            align="end"
            sideOffset={4}
            className="elev-2 z-50 w-48 rounded-md p-1"
          >
            {columns.map((column) => {
              const checkboxId = `col-vis-${column.key}`;
              return (
                <label
                  key={column.key}
                  htmlFor={checkboxId}
                  className="flex h-9 cursor-pointer items-center gap-2 rounded-sm px-2 text-body-sm text-text-primary hover:bg-bg-hover"
                >
                  <Checkbox
                    id={checkboxId}
                    checked={visibleColumnKeys.has(column.key)}
                    onCheckedChange={() => onToggleColumn(column.key)}
                  />
                  {column.header}
                </label>
              );
            })}
          </RadixPopover.Content>
        </RadixPopover.Portal>
      </RadixPopover.Root>
    </div>
  );
}

export { TableToolbar };
