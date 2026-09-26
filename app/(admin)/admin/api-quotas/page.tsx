import { getQuotaReport } from "@/lib/services/admin";
import { Card } from "@/components/ui/card";
import { QuotaChart } from "@/components/features/admin/admin-charts";
import { StatCard } from "@/components/features/admin/stat-card";

// PRD.md §9.5 / TRD.md §5.3. Read from the per-day Redis counters (8-day
// TTL). Alerting deferred -- D-052. Per-source breakdown: D-069.

const SOURCE_LABELS: Record<string, string> = {
  search: "Live Niche Finder search",
  free_tools: "Free tools",
  channel_sync: "Tracked channel sync",
  discovery: "Discovery Engine: search",
  enrichment: "Discovery Engine: enrichment",
  app: "Other app calls",
};
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

      <section aria-labelledby="quota-sources">
        <h2 id="quota-sources" className="mb-2 text-h4 font-semibold text-text-primary">
          Today by source
        </h2>
        <Card>
          <table className="w-full text-left text-body-sm">
            <thead className="text-caption text-text-secondary">
              <tr>
                <th scope="col" className="py-2 font-medium">
                  Source
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  Units
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(report.bySource).map(([source, used]) => (
                <tr key={source} className="border-t border-border-subtle">
                  <td className="py-2 text-text-primary">{SOURCE_LABELS[source] ?? source}</td>
                  <td className="py-2 text-right text-text-secondary tabular-nums">
                    {used.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-caption text-text-secondary">
            Discovery jobs stop at {report.jobBudget.toLocaleString()} units/day, keeping the rest
            for live searches.
          </p>
        </Card>
      </section>

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
