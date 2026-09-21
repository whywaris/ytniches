"use client";

import * as React from "react";

import Image from "next/image";

import { Table, type ColumnDef } from "@/components/ui/table";
import type { VideoSummary } from "@/lib/services/channels";

// UI-UX-Flow.md §6.2 Videos tab. Feature-specific ColumnDef[] on the Table
// primitive, same pattern as niche-finder/channel-table.tsx.
export interface VideosTableProps {
  videos: VideoSummary[];
}

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(Math.round(value));
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

function VideosTable({ videos }: VideosTableProps) {
  const columns = React.useMemo<ColumnDef<VideoSummary>[]>(
    () => [
      {
        key: "title",
        header: "Video",
        sticky: true,
        sortable: true,
        sortAccessor: (row) => row.title,
        accessor: (row) => (
          <div className="flex items-center gap-2">
            <Image
              src={row.thumbnailUrl}
              alt=""
              width={64}
              height={36}
              className="h-9 w-16 shrink-0 rounded-xs object-cover"
              unoptimized
            />
            <span className="truncate">{row.title}</span>
          </div>
        ),
      },
      {
        key: "views",
        header: "Views",
        sortable: true,
        sortAccessor: (row) => row.viewCount,
        accessor: (row) => formatCount(row.viewCount),
      },
      {
        key: "published",
        header: "Published",
        sortable: true,
        sortAccessor: (row) => row.publishedAt,
        accessor: (row) => new Date(row.publishedAt).toLocaleDateString(),
      },
      {
        key: "duration",
        header: "Duration",
        sortable: true,
        sortAccessor: (row) => row.durationSeconds,
        accessor: (row) => formatDuration(row.durationSeconds),
      },
    ],
    [],
  );

  return (
    <Table
      data={videos}
      columns={columns}
      getRowKey={(row) => row.id}
      emptyState={
        <p className="py-12 text-center text-body-sm text-text-tertiary">No videos cached yet.</p>
      }
    />
  );
}

export { VideosTable };
