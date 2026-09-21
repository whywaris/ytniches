"use client";

import * as React from "react";

import { Bookmark, BookmarkCheck } from "lucide-react";

import { readLocalStorage, writeLocalStorage } from "@/lib/local-storage";
import { Avatar } from "@/components/ui/avatar";
import { Tag } from "@/components/ui/tag";
import { Table, type ColumnDef, type TableDensity } from "@/components/ui/table";
import type { TablePaginationProps } from "@/components/ui/table-pagination";
import type { NicheChannelResult } from "@/components/features/niche-finder/types";

// UI-UX-Flow.md §5.2 list view. Feature-specific ColumnDef[] on top of the
// Table primitive — per Table's own approved API, this is exactly what
// "no new base components in feature work" means: don't build a new Table,
// do build a domain column set on it.
export interface ChannelTableProps {
  channels: NicheChannelResult[];
  savedChannelIds: Set<string>;
  onSave: (channelId: string) => void;
  onOpen: (channelId: string) => void;
  onSelectionChange?: (selected: NicheChannelResult[]) => void;
  renderBulkActions?: (selected: NicheChannelResult[], clear: () => void) => React.ReactNode;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  pagination?: TablePaginationProps;
  className?: string;
}

const DENSITY_STORAGE_KEY = "ytniches:niche-finder-density";

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(Math.round(value));
}

function ChannelTable({
  channels,
  savedChannelIds,
  onSave,
  onOpen,
  onSelectionChange,
  renderBulkActions,
  loading,
  error,
  onRetry,
  pagination,
  className,
}: ChannelTableProps) {
  const [defaultDensity, setDefaultDensity] = React.useState<TableDensity>("comfortable");

  // Read the persisted preference post-mount only — same reasoning as
  // Sidebar's collapse state (Phase 0): localStorage isn't available
  // during server rendering, and reading it in a lazy initializer would
  // produce a client/server mismatch on first paint.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from an external system (localStorage) post-mount, see above
    setDefaultDensity(
      readLocalStorage<TableDensity>(DENSITY_STORAGE_KEY, "comfortable", (raw) =>
        raw === "compact" ? "compact" : "comfortable",
      ),
    );
  }, []);

  const columns = React.useMemo<ColumnDef<NicheChannelResult>[]>(
    () => [
      {
        key: "channel",
        header: "Channel",
        sticky: true,
        sortable: true,
        sortAccessor: (row) => row.name,
        accessor: (row) => (
          <div className="flex items-center gap-2">
            <Avatar
              size="sm"
              src={row.avatarUrl ?? undefined}
              fallback={row.name.slice(0, 2).toUpperCase()}
            />
            <span className="truncate">{row.name}</span>
          </div>
        ),
      },
      {
        key: "subs",
        header: "Subs",
        sortable: true,
        sortAccessor: (row) => row.subscriberCount,
        accessor: (row) => formatCount(row.subscriberCount),
      },
      {
        key: "videos",
        header: "Videos",
        sortable: true,
        sortAccessor: (row) => row.videoCount,
        accessor: (row) => formatCount(row.videoCount),
      },
      {
        key: "avgViews",
        header: "Avg views",
        sortable: true,
        sortAccessor: (row) => row.avgViewsLast30Days,
        accessor: (row) => formatCount(row.avgViewsLast30Days),
      },
      {
        key: "uploadFreq",
        header: "Upload freq",
        sortable: true,
        sortAccessor: (row) => row.uploadFrequencyPerWeek,
        accessor: (row) => `${row.uploadFrequencyPerWeek.toFixed(1)}/wk`,
      },
      {
        key: "monetized",
        header: "Monetized",
        accessor: (row) =>
          row.isMonetized === true ? (
            <Tag tone="success">Yes</Tag>
          ) : row.isMonetized === false ? (
            <Tag tone="neutral">No</Tag>
          ) : (
            <span className="text-text-tertiary">—</span>
          ),
      },
      {
        key: "language",
        header: "Language",
        accessor: (row) => row.language?.toUpperCase() ?? "—",
      },
      {
        key: "country",
        header: "Country",
        accessor: (row) => row.country ?? "—",
      },
      {
        key: "actions",
        header: "",
        accessor: (row) => {
          const saved = savedChannelIds.has(row.id);
          return (
            <button
              type="button"
              aria-label={saved ? "Remove from tracking" : "Save to tracking"}
              aria-pressed={saved}
              onClick={(event) => {
                event.stopPropagation();
                onSave(row.id);
              }}
              className="text-text-tertiary hover:text-accent"
            >
              {saved ? (
                <BookmarkCheck className="size-4 text-accent" aria-hidden="true" />
              ) : (
                <Bookmark className="size-4" aria-hidden="true" />
              )}
            </button>
          );
        },
      },
    ],
    [savedChannelIds, onSave],
  );

  return (
    <Table
      // `defaultDensity` only feeds Table's internal useState at mount —
      // it won't pick up the post-mount localStorage read otherwise. Since
      // it only changes once (comfortable -> the stored value, right after
      // mount) and Table has no expensive mount work, keying on it forces
      // exactly one cheap remount instead of silently ignoring the
      // persisted preference.
      key={defaultDensity}
      data={channels}
      columns={columns}
      getRowKey={(row) => row.id}
      onRowClick={(row) => onOpen(row.id)}
      onSelectionChange={onSelectionChange}
      renderBulkActions={renderBulkActions}
      defaultDensity={defaultDensity}
      onDensityChange={(next) => writeLocalStorage(DENSITY_STORAGE_KEY, next)}
      loading={loading}
      error={error}
      onRetry={onRetry}
      pagination={pagination}
      className={className}
    />
  );
}

export { ChannelTable };
