import Link from "next/link";
import { notFound } from "next/navigation";

import { formatUsd, monthlyAmountCents } from "@/lib/admin-metrics";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { getUserDetail } from "@/lib/services/admin";
import { pluralize } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { UserActions } from "@/app/(admin)/admin/users/[userId]/user-actions";

const DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-caption text-text-secondary">{label}</dt>
      <dd className="mt-0.5 text-body-sm text-text-primary">{children}</dd>
    </div>
  );
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(userId)) notFound();
  const user = await getUserDetail(userId);
  if (!user) notFound();

  const sub = user.subscription;
  const hasPaidSubscription = Boolean(sub?.providerSubscriptionId);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/users"
          className="text-body-sm text-text-secondary hover:text-text-primary"
        >
          ← Users
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-h2 font-semibold text-text-primary">{user.email ?? user.id}</h1>
          {user.suspendedAt ? <Tag tone="error">Suspended</Tag> : null}
          {user.role === "super_admin" ? <Tag tone="warning">Super admin</Tag> : null}
        </div>
        {user.suspendedReason ? (
          <p className="mt-1 text-body-sm text-error">Suspended: {user.suspendedReason}</p>
        ) : null}
      </div>

      <Card>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Name">{user.name ?? "—"}</Field>
          <Field label="Signed up">{DATE.format(new Date(user.createdAt))}</Field>
          <Field label="Last active">
            {user.lastActiveAt ? formatRelativeTime(user.lastActiveAt) : "—"}
          </Field>
          <Field label="Credit balance">{user.creditBalance}</Field>
          <Field label="Plan">{sub ? `${sub.tier} · ${sub.status}` : "None"}</Field>
          <Field label="Price">
            {sub?.amountCents != null && sub.billingInterval
              ? `${formatUsd(sub.amountCents)} / ${sub.billingInterval} (${formatUsd(
                  monthlyAmountCents(sub.amountCents, sub.billingInterval),
                )} MRR)`
              : sub?.providerSubscriptionId
                ? "Not recorded"
                : "Trial"}
          </Field>
          <Field label="Renews / ends">
            {sub ? DATE.format(new Date(sub.currentPeriodEnd)) : "—"}
          </Field>
          <Field label="Creem subscription">
            <span className="font-mono text-caption">{sub?.providerSubscriptionId ?? "—"}</span>
          </Field>
        </dl>
      </Card>

      <UserActions
        userId={user.id}
        suspended={user.suspendedAt !== null}
        hasPaidSubscription={hasPaidSubscription}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <section aria-labelledby="credit-events">
          <h2 id="credit-events" className="mb-2 text-h4 font-semibold text-text-primary">
            Recent activity
          </h2>
          <Card padding="sm">
            {user.recentCreditEvents.length > 0 ? (
              <ul className="divide-y divide-border-subtle">
                {user.recentCreditEvents.map((event) => (
                  <li key={event.id} className="flex items-center gap-3 px-2 py-2 text-body-sm">
                    <span
                      className={`w-14 shrink-0 font-mono ${event.amount < 0 ? "text-text-secondary" : "text-success"}`}
                    >
                      {event.amount > 0 ? `+${event.amount}` : event.amount}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-text-primary">
                      {event.reason}
                    </span>
                    <span className="shrink-0 text-caption text-text-secondary">
                      {formatRelativeTime(event.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-2 py-2 text-body-sm text-text-secondary">No credit activity.</p>
            )}
          </Card>
        </section>

        <section aria-labelledby="tracked-channels">
          <h2 id="tracked-channels" className="mb-2 text-h4 font-semibold text-text-primary">
            {user.trackedChannels.length} tracked{" "}
            {pluralize(user.trackedChannels.length, "channel")}
          </h2>
          <Card padding="sm">
            {user.trackedChannels.length > 0 ? (
              <ul className="divide-y divide-border-subtle">
                {user.trackedChannels.map((channel) => (
                  <li
                    key={channel.channelId}
                    className="flex justify-between gap-3 px-2 py-2 text-body-sm"
                  >
                    <span className="truncate text-text-primary">{channel.name}</span>
                    <span className="shrink-0 text-caption text-text-secondary">
                      since {DATE.format(new Date(channel.trackedSince))}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-2 py-2 text-body-sm text-text-secondary">
                Not tracking any channels.
              </p>
            )}
          </Card>

          <h2 className="mt-6 mb-2 text-h4 font-semibold text-text-primary">Admin actions</h2>
          <Card padding="sm">
            {user.recentAdminActions.length > 0 ? (
              <ul className="divide-y divide-border-subtle">
                {user.recentAdminActions.map((action) => (
                  <li key={action.id} className="flex justify-between gap-3 px-2 py-2 text-body-sm">
                    <span className="text-text-primary">
                      {action.action}
                      {action.status !== "completed" ? ` (${action.status})` : ""}
                    </span>
                    <span className="text-caption text-text-secondary">
                      {formatRelativeTime(action.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-2 py-2 text-body-sm text-text-secondary">None yet.</p>
            )}
          </Card>
        </section>
      </div>
    </div>
  );
}
