import { getDiscoveryAdminReport } from "@/lib/services/admin";
import { StatCard } from "@/components/features/admin/stat-card";
import { DiscoveryControls } from "@/app/(admin)/admin/discovery/discovery-controls";
import { NicheSuggestions } from "@/app/(admin)/admin/discovery/niche-suggestions";

// Niche-Discovery-Engine.md §6 / D-069: seed management + manual job
// triggers. Quota usage per job lives on API Quotas.
export default async function AdminDiscoveryPage() {
  const report = await getDiscoveryAdminReport();

  return (
    <div className="space-y-8">
      <h1 className="text-h2 font-semibold text-text-primary">Discovery Engine</h1>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Seeds" value={report.seeds.length.toLocaleString()} />
        <StatCard label="Discovered" value={report.channelsDiscovered.toLocaleString()} />
        <StatCard label="Enriched" value={report.channelsEnriched.toLocaleString()} />
        <StatCard label="Classified" value={report.channelsClassified.toLocaleString()} />
        <StatCard label="Niches" value={report.niches.toLocaleString()} />
        <StatCard
          label="Outliers"
          value={report.outliers.toLocaleString()}
          hint={
            report.latestSnapshotDate ? `Scores from ${report.latestSnapshotDate}` : "No scores yet"
          }
        />
      </div>

      <NicheSuggestions suggestions={report.suggestions} />

      <DiscoveryControls seeds={report.seeds} />
    </div>
  );
}
