import Link from "next/link";

import { formatPercent, formatUsd } from "@/lib/admin-metrics";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { getAdminKpis } from "@/lib/services/admin";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/features/admin/stat-card";

// PRD.md §9.1. Every number is read live; MRR comes only from stored Creem
// prices (subscriptions.amount_cents), never inferred.
export default async function AdminDashboardPage() {
  const kpis = await getAdminKpis();
  const quotaPct = Math.round((kpis.quotaToday.used / kpis.quotaLimit) * 100);

  return (
    <div className="space-y-8">
      <h1 className="text-h2 font-semibold text-text-primary">Dashboard</h1>

      <section aria-label="Key metrics" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="MRR" value={formatUsd(kpis.mrrCents)} hint="From stored Creem prices" />
        <StatCard
          label="Total signups"
          value={kpis.totalSignups}
          hint={`${kpis.signupsLast30d} in the last 30 days`}
        />
        <StatCard
          label="Active users"
          value={`${kpis.activeLast7d} / ${kpis.activeLast30d}`}
          hint="Last 7 days / last 30 days"
        />
        <StatCard label="Trial → paid" value={formatPercent(kpis.trialConversion)} />
        <StatCard label="Churn (30 days)" value={formatPercent(kpis.churn30d)} />
        <StatCard
          label="YouTube quota today"
          value={`${kpis.quotaToday.used.toLocaleString()} units`}
          hint={`${quotaPct}% of ${kpis.quotaLimit.toLocaleString()}`}
        />
      </section>

      <section aria-labelledby="webhook-errors">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="webhook-errors" className="text-h4 font-semibold text-text-primary">
            Recent webhook errors
          </h2>
          <Link href="/admin/revenue" className="text-body-sm text-accent-text hover:underline">
            Revenue
          </Link>
        </div>
        <Card padding="sm">
          {kpis.recentWebhookErrors.length > 0 ? (
            <ul className="divide-y divide-border-subtle">
              {kpis.recentWebhookErrors.map((event) => (
                <li
                  key={`${event.createdAt}-${event.eventType}`}
                  className="px-2 py-2.5 text-body-sm"
                >
                  <span className="font-medium text-text-primary">{event.eventType}</span>
                  <span className="text-text-secondary">
                    {" "}
                    · {formatRelativeTime(event.createdAt)}
                  </span>
                  <p className="mt-0.5 font-mono text-caption text-error">{event.error}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-2 py-2 text-body-sm text-text-secondary">No webhook errors.</p>
          )}
        </Card>
      </section>
    </div>
  );
}
