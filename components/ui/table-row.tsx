import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { DENSITY_PADDING } from "@/components/ui/table-header";
import type { ColumnDef, TableDensity } from "@/components/ui/table";

export interface TableRowProps<T> {
  row: T;
  rowKey: string;
  columns: ColumnDef<T>[];
  selectable: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  onRowClick?: (row: T) => void;
  density: TableDensity;
}

function TableRow<T>({
  row,
  rowKey,
  columns,
  selectable,
  selected,
  onToggleSelect,
  onRowClick,
  density,
}: TableRowProps<T>) {
  return (
    <tr
      data-state={selected ? "selected" : undefined}
      onClick={onRowClick ? () => onRowClick(row) : undefined}
      className={cn(
        "group border-b border-border-subtle last:border-0 hover:bg-bg-hover",
        onRowClick && "cursor-pointer",
        selected && "bg-bg-hover",
      )}
    >
      {selectable ? (
        <td
          className={cn("w-10 px-3", DENSITY_PADDING[density])}
          onClick={(event) => event.stopPropagation()}
        >
          <Checkbox
            aria-label={`Select row ${rowKey}`}
            checked={selected}
            onCheckedChange={onToggleSelect}
          />
        </td>
      ) : null}
      {columns.map((column) => (
        <td
          key={column.key}
          className={cn(
            "px-3 text-text-primary",
            DENSITY_PADDING[density],
            column.sticky &&
              cn(
                "sticky left-0 z-10",
                selected ? "bg-bg-hover" : "bg-bg-base group-hover:bg-bg-hover",
              ),
          )}
        >
          {column.accessor(row)}
        </td>
      ))}
    </tr>
  );
}

export { TableRow };
