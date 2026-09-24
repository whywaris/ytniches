import { z } from "zod";

import { ADMIN_USERS_PAGE_SIZE, listUsers } from "@/lib/services/admin";
import { pluralize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UsersTable } from "@/app/(admin)/admin/users/users-table";

// Filters live in the query string (Application-Flow.md §2.5), validated
// here at the trust boundary before reaching the RPC.
const FiltersSchema = z.object({
  q: z.string().max(200).optional(),
  tier: z.enum(["starter", "pro", "team"]).optional().catch(undefined),
  status: z.enum(["active", "suspended"]).optional().catch(undefined),
  from: z.string().date().optional().catch(undefined),
  to: z.string().date().optional().catch(undefined),
  page: z.coerce.number().int().min(1).catch(1),
});

const SELECT =
  "h-9 rounded-sm border border-border-default bg-bg-surface-1 px-2 text-body-sm text-text-primary";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const filters = FiltersSchema.parse(await searchParams);
  const { users, total } = await listUsers({
    search: filters.q,
    tier: filters.tier,
    status: filters.status,
    signedUpFrom: filters.from,
    signedUpTo: filters.to,
    page: filters.page,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-h2 font-semibold text-text-primary">Users</h1>

      <form method="get" className="flex flex-wrap items-end gap-3" aria-label="Filter users">
        <label className="flex flex-col gap-1 text-caption text-text-secondary">
          Search
          <input
            name="q"
            defaultValue={filters.q}
            placeholder="Email or name"
            className={`${SELECT} w-56`}
          />
        </label>
        <label className="flex flex-col gap-1 text-caption text-text-secondary">
          Plan
          <select name="tier" defaultValue={filters.tier ?? ""} className={SELECT}>
            <option value="">Any</option>
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
            <option value="team">Team</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-caption text-text-secondary">
          Account
          <select name="status" defaultValue={filters.status ?? ""} className={SELECT}>
            <option value="">Any</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-caption text-text-secondary">
          Signed up from
          <input type="date" name="from" defaultValue={filters.from} className={SELECT} />
        </label>
        <label className="flex flex-col gap-1 text-caption text-text-secondary">
          to
          <input type="date" name="to" defaultValue={filters.to} className={SELECT} />
        </label>
        <Button type="submit" size="sm" variant="secondary">
          Apply
        </Button>
      </form>

      <p className="text-body-sm text-text-secondary">
        {total} {pluralize(total, "user")}
      </p>
      <UsersTable
        users={users}
        total={total}
        page={filters.page}
        pageSize={ADMIN_USERS_PAGE_SIZE}
      />
    </div>
  );
}
