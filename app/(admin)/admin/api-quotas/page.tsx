import { getQuotaReport } from "@/lib/services/admin";
import { Card } from "@/components/ui/card";
import { QuotaChart } from "@/components/features/admin/admin-charts";
import { StatCard } from "@/components/features/admin/stat-card";

// PRD.md §9.5 / TRD.md §5.3. Read from the per-day Redis counters (8-day
// TTL). Per-endpoint breakdown and alerting deferred -- D-052.
export default async function AdminApiQuotasPage() {
  const report = await getQuotaReport();
  const pct = Math.round((report.today.used / report.limit) * 100);
  const remaining = Math.max(0, report.limit - report.today.used);

  return (
    <div className="space-y-8">
      <h1 className="text-h2 font-semibold text-text-primary">API Quotas</h1>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="YouTube units today"
          value={report.today.used.toLocaleString()}
          hint={`${pct}% of the ${report.limit.toLocaleString()} daily limit`}
        />
        <StatCard label="Remaining today" value={remaining.toLocaleString()} />
        <StatCard
          label="Soft limit"
          value={report.softLimit.toLocaleString()}
          hint="Non-critical calls stop above this"
        />
      </div>

      <section aria-labelledby="quota-trend">
        <h2 id="quota-trend" className="mb-2 text-h4 font-semibold text-text-primary">
          Last 7 days (UTC)
        </h2>
        <Card>
          <QuotaChart history={report.history} softLimit={report.softLimit} limit={report.limit} />
          <p className="mt-2 text-caption text-text-secondary">
            History starts from when the 8-day counter retention shipped; earlier days read as 0.
          </p>
        </Card>
      </section>
    </div>
  );
}
