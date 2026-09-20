import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface TablePaginationProps {
  page: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (page: number) => void;
}

function TablePagination({ page, pageSize, totalRows, onPageChange }: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const start = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalRows);

  return (
    <div className="flex items-center justify-between border-t border-border-subtle px-3 py-2 text-body-sm text-text-secondary">
      <span>{totalRows === 0 ? "0 results" : `${start}–${end} of ${totalRows}`}</span>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft />
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

export { TablePagination };
