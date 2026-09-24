import { formatUsd } from "@/lib/admin-metrics";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { getRevenueReport } from "@/lib/services/admin";
import { Card } from "@/components/ui/card";
import { MrrChart } from "@/components/features/admin/admin-charts";
import { StatCard } from "@/components/features/admin/stat-card";

// PRD.md §9.4 (coupons, retry actions, and new/expansion breakdown
// deferred -- D-052). Revenue = stored Creem prices only.
export default async function AdminRevenuePage() {
  const report = await getRevenueReport();
  const tiers = Object.entries(report.byTier).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-8">
      <h1 className="text-h2 font-semibold text-text-primary">Revenue</h1>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Current MRR" value={formatUsd(report.currentMrrCents)} />
        <StatCard label="Refunds (recent)" value={report.refunds.length} />
        <StatCard label="Past-due subscriptions" value={report.pastDueCount} />
      </div>

      <section aria-labelledby="mrr-trend">
        <h2 id="mrr-trend" className="mb-2 text-h4 font-semibold text-text-primary">
          MRR, last 12 months
        </h2>
        <Card>
          <MrrChart series={report.series} />
        </Card>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <section aria-labelledby="by-tier">
          <h2 id="by-tier" className="mb-2 text-h4 font-semibold text-text-primary">
            MRR by plan
          </h2>
          <Card padding="sm">
            {tiers.length > 0 ? (
              <ul className="divide-y divide-border-subtle">
                {tiers.map(([tier, cents]) => (
                  <li key={tier} className="flex justify-between px-2 py-2 text-body-sm">
                    <span className="text-text-primary capitalize">{tier}</span>
                    <span className="text-text-primary">{formatUsd(cents)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-2 py-2 text-body-sm text-text-secondary">No paying subscriptions.</p>
            )}
          </Card>
        </section>

        <section aria-labelledby="refunds">
          <h2 id="refunds" className="mb-2 text-h4 font-semibold text-text-primary">
            Refunds
          </h2>
          <Card padding="sm">
            {report.refunds.length > 0 ? (
              <ul className="divide-y divide-border-subtle">
                {report.refunds.map((refund) => (
                  <li
                    key={refund.createdAt}
                    className="flex justify-between gap-3 px-2 py-2 text-body-sm"
                  >
                    <span className="text-text-primary">
                      {refund.amountCents != null
                        ? formatUsd(refund.amountCents)
                        : "Amount unknown"}
                    </span>
                    <span className="text-caption text-text-secondary">
                      {formatRelativeTime(refund.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-2 py-2 text-body-sm text-text-secondary">No refunds.</p>
            )}
          </Card>
        </section>

        <section aria-labelledby="failed-payments">
          <h2 id="failed-payments" className="mb-2 text-h4 font-semibold text-text-primary">
            Failed payments
          </h2>
          <Card padding="sm">
            {report.failedPayments.length > 0 ? (
              <ul className="divide-y divide-border-subtle">
                {report.failedPayments.map((payment) => (
                  <li
                    key={`${payment.createdAt}-${payment.eventType}`}
                    className="flex justify-between gap-3 px-2 py-2 text-body-sm"
                  >
                    <span className="truncate font-mono text-caption text-text-primary">
                      {payment.subscriptionId ?? payment.eventType}
                    </span>
                    <span className="shrink-0 text-caption text-text-secondary">
                      {formatRelativeTime(payment.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-2 py-2 text-body-sm text-text-secondary">No failed payments.</p>
            )}
          </Card>
        </section>
      </div>
    </div>
  );
}
