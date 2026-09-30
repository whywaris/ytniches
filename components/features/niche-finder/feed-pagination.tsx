import * as React from "react";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export interface FeedPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  hrefFor: (page: number) => string;
}

function FeedPagination({ page, pageSize, total, hrefFor }: FeedPaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-3 pt-2">
      <p className="text-caption text-text-tertiary">
        Page {page} of {pages.toLocaleString()}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Button size="sm" variant="secondary" asChild>
            <Link href={hrefFor(page - 1)}>Previous</Link>
          </Button>
        ) : (
          <Button size="sm" variant="secondary" disabled>
            Previous
          </Button>
        )}
        {page < pages ? (
          <Button size="sm" variant="secondary" asChild>
            <Link href={hrefFor(page + 1)}>Next</Link>
          </Button>
        ) : (
          <Button size="sm" variant="secondary" disabled>
            Next
          </Button>
        )}
      </div>
    </nav>
  );
}

export { FeedPagination };
