"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { TableHeader } from "@/components/ui/table-header";
import { TableRow } from "@/components/ui/table-row";
import { TablePagination, type TablePaginationProps } from "@/components/ui/table-pagination";
import { TableToolbar } from "@/components/ui/table-toolbar";

// Design-System.md §5.4. API surface signed off 2026-09-20 (see chat):
// typed columns array (not JSX composition — column-visibility and sort
// need to introspect the full column set programmatically), Table owns
// selection state internally and always reports it via onSelectionChange,
// business actions on the selection are a renderBulkActions render prop,
// pagination only (no infinite scroll — nothing in the spec set calls
// for it, and Application-Flow.md §2.5's own preference is shareable
// ?page=N URL state).
export type TableDensity = "compact" | "comfortable";
export type TableSort = { key: string; direction: "asc" | "desc" };

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  /** Provide when `accessor` doesn't return a directly-comparable value
   * (e.g. JSX) — sorting falls back to String(accessor(row)) otherwise. */
  sortAccessor?: (row: T) => string | number;
  sortable?: boolean;
  /** First column only, per §5.4. */
  sticky?: boolean;
  width?: string;
  /** Default visibility; toggled at runtime via the column-visibility popover. */
  hidden?: boolean;
}

export interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  getRowKey: (row: T) => string;
  onSelectionChange?: (selectedRows: T[]) => void;
  renderBulkActions?: (selectedRows: T[], clearSelection: () => void) => React.ReactNode;
  defaultDensity?: TableDensity;
  /** Fires on every density change (compact/comfortable toggle) — lets a
   * consumer persist the preference (TRD.md §2.3), Table itself never
   * touches localStorage. Purely additive: omit it and nothing changes. */
  onDensityChange?: (density: TableDensity) => void;
  defaultSort?: TableSort;
  pagination?: TablePaginationProps;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  emptyState?: React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
}

const SKELETON_ROW_COUNT = 5;

function Table<T>({
  data,
  columns,
  getRowKey,
  onSelectionChange,
  renderBulkActions,
  defaultDensity = "comfortable",
  onDensityChange,
  defaultSort,
  pagination,
  loading,
  error,
  onRetry,
  emptyState,
  onRowClick,
  className,
}: TableProps<T>) {
  const [density, setDensity] = React.useState<TableDensity>(defaultDensity);
  const [sort, setSort] = React.useState<TableSort | null>(defaultSort ?? null);
  const [visibleKeys, setVisibleKeys] = React.useState<Set<string>>(
    () => new Set(columns.filter((column) => !column.hidden).map((column) => column.key)),
  );
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set());

  const selectable = Boolean(onSelectionChange) || Boolean(renderBulkActions);
  const visibleColumns = columns.filter((column) => visibleKeys.has(column.key));

  const sortedData = React.useMemo(() => {
    if (!sort) return data;
    const column = columns.find((candidate) => candidate.key === sort.key);
    if (!column) return data;
    const getValue = column.sortAccessor ?? ((row: T) => String(column.accessor(row)));
    const sorted = [...data].sort((a, b) => {
      const valueA = getValue(a);
      const valueB = getValue(b);
      if (valueA < valueB) return -1;
      if (valueA > valueB) return 1;
      return 0;
    });
    return sort.direction === "desc" ? sorted.reverse() : sorted;
  }, [data, sort, columns]);

  function handleDensityChange(next: TableDensity) {
    setDensity(next);
    onDensityChange?.(next);
  }

  function handleSortChange(key: string) {
    setSort((current) => {
      if (!current || current.key !== key) return { key, direction: "asc" };
      if (current.direction === "asc") return { key, direction: "desc" };
      return null;
    });
  }

  function notifySelection(keys: Set<string>) {
    onSelectionChange?.(data.filter((row) => keys.has(getRowKey(row))));
  }

  function toggleSelect(key: string) {
    setSelectedKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      notifySelection(next);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedKeys((current) => {
      const allSelected = data.length > 0 && data.every((row) => current.has(getRowKey(row)));
      const next = allSelected ? new Set<string>() : new Set(data.map(getRowKey));
      notifySelection(next);
      return next;
    });
  }

  function clearSelection() {
    setSelectedKeys(new Set());
    onSelectionChange?.([]);
  }

  function toggleColumn(key: string) {
    setVisibleKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  if (error) {
    return (
      <div className={cn("overflow-hidden rounded-md border border-border-subtle", className)}>
        <ErrorState onRetry={onRetry} />
      </div>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <div className={cn("overflow-hidden rounded-md border border-border-subtle", className)}>
        {emptyState ?? <EmptyState message="No results found." />}
      </div>
    );
  }

  const selectedRows = data.filter((row) => selectedKeys.has(getRowKey(row)));
  const allSelected = data.length > 0 && data.every((row) => selectedKeys.has(getRowKey(row)));
  const someSelected = !allSelected && data.some((row) => selectedKeys.has(getRowKey(row)));
  const columnSpan = visibleColumns.length + (selectable ? 1 : 0);

  return (
    <div className={cn("overflow-hidden rounded-md border border-border-subtle", className)}>
      <TableToolbar
        columns={columns}
        visibleColumnKeys={visibleKeys}
        onToggleColumn={toggleColumn}
        density={density}
        onDensityChange={handleDensityChange}
        selectedRows={selectedRows}
        renderBulkActions={renderBulkActions}
        onClearSelection={clearSelection}
      />
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-body-sm">
          <TableHeader
            columns={visibleColumns}
            selectable={selectable}
            allSelected={allSelected}
            someSelected={someSelected}
            onToggleSelectAll={toggleSelectAll}
            sort={sort}
            onSortChange={handleSortChange}
            density={density}
          />
          <tbody>
            {loading
              ? Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
                  <tr key={index}>
                    <td colSpan={columnSpan} className="p-2">
                      <LoadingSkeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              : sortedData.map((row) => {
                  const rowKey = getRowKey(row);
                  return (
                    <TableRow
                      key={rowKey}
                      row={row}
                      rowKey={rowKey}
                      columns={visibleColumns}
                      selectable={selectable}
                      selected={selectedKeys.has(rowKey)}
                      onToggleSelect={() => toggleSelect(rowKey)}
                      onRowClick={onRowClick}
                      density={density}
                    />
                  );
                })}
          </tbody>
        </table>
      </div>
      {pagination ? <TablePagination {...pagination} /> : null}
    </div>
  );
}

export { Table };
