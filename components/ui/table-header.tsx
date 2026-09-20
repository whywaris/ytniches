import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import type { ColumnDef, TableDensity, TableSort } from "@/components/ui/table";

export const DENSITY_PADDING: Record<TableDensity, string> = {
  compact: "py-3",
  comfortable: "py-6",
};

export interface TableHeaderProps<T> {
  columns: ColumnDef<T>[];
  selectable: boolean;
  allSelected: boolean;
  someSelected: boolean;
  onToggleSelectAll: () => void;
  sort: TableSort | null;
  onSortChange: (key: string) => void;
  density: TableDensity;
}

function TableHeader<T>({
  columns,
  selectable,
  allSelected,
  someSelected,
  onToggleSelectAll,
  sort,
  onSortChange,
  density,
}: TableHeaderProps<T>) {
  return (
    <thead className="border-b border-border-subtle bg-bg-surface-1 text-left">
      <tr>
        {selectable ? (
          <th className={cn("w-10 px-3", DENSITY_PADDING[density])}>
            <Checkbox
              aria-label="Select all rows"
              checked={someSelected ? "indeterminate" : allSelected}
              onCheckedChange={onToggleSelectAll}
            />
          </th>
        ) : null}
        {columns.map((column) => {
          const isSorted = sort?.key === column.key;
          return (
            <th
              key={column.key}
              style={column.width ? { width: column.width } : undefined}
              className={cn(
                // text-secondary, not text-tertiary: axe caught tertiary
                // failing WCAG AA (3.65:1, needs 4.5:1) at this size against
                // bg-surface-1 — see DECISIONS.md review, 2026-09-20.
                "px-3 text-caption font-semibold text-text-secondary uppercase",
                DENSITY_PADDING[density],
                column.sticky && "sticky left-0 z-10 bg-bg-surface-1",
              )}
            >
              {column.sortable ? (
                <button
                  type="button"
                  onClick={() => onSortChange(column.key)}
                  className="flex items-center gap-1 outline-none hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent-subtle"
                >
                  {column.header}
                  {isSorted ? (
                    sort!.direction === "asc" ? (
                      <ArrowUp className="size-3" />
                    ) : (
                      <ArrowDown className="size-3" />
                    )
                  ) : (
                    <ChevronsUpDown className="size-3 opacity-50" />
                  )}
                </button>
              ) : (
                column.header
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

export { TableHeader };
