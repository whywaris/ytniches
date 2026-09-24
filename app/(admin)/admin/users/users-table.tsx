"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Table, type ColumnDef } from "@/components/ui/table";
import { Tag } from "@/components/ui/tag";
import type { AdminUserRow } from "@/lib/services/admin";

const DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

const COLUMNS: ColumnDef<AdminUserRow>[] = [
  {
    key: "email",
    header: "User",
    sticky: true,
    accessor: (row) => (
      <div className="min-w-0">
        <div className="truncate text-text-primary">{row.email}</div>
        {row.name ? (
          <div className="truncate text-caption text-text-secondary">{row.name}</div>
        ) : null}
      </div>
    ),
    sortAccessor: (row) => row.email,
  },
  {
    key: "tier",
    header: "Plan",
    accessor: (row) =>
      row.tier ? `${row.tier}${row.subscriptionStatus ? ` · ${row.subscriptionStatus}` : ""}` : "—",
  },
  {
    key: "status",
    header: "Account",
    accessor: (row) =>
      row.suspendedAt ? (
        <Tag tone="error">Suspended</Tag>
      ) : row.role === "super_admin" ? (
        <Tag>Admin</Tag>
      ) : (
        "Active"
      ),
  },
  {
    key: "createdAt",
    header: "Signed up",
    accessor: (row) => DATE.format(new Date(row.createdAt)),
    sortAccessor: (row) => row.createdAt,
  },
  {
    key: "lastActiveAt",
    header: "Last active",
    accessor: (row) => (row.lastActiveAt ? DATE.format(new Date(row.lastActiveAt)) : "—"),
    sortAccessor: (row) => row.lastActiveAt ?? "",
  },
];

// Server-paginated: page changes go through the URL so the list is
// shareable and the server re-queries (Application-Flow.md §2.5).
function UsersTable({
  users,
  total,
  page,
  pageSize,
}: {
  users: AdminUserRow[];
  total: number;
  page: number;
  pageSize: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <Table
      data={users}
      columns={COLUMNS}
      getRowKey={(row) => row.id}
      onRowClick={(row) => router.push(`/admin/users/${row.id}`)}
      emptyState={
        <p className="py-8 text-center text-body-sm text-text-secondary">No users match.</p>
      }
      pagination={{
        page,
        pageSize,
        totalRows: total,
        onPageChange: (next) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("page", String(next));
          router.push(`${pathname}?${params.toString()}`);
        },
      }}
    />
  );
}

export { UsersTable };
