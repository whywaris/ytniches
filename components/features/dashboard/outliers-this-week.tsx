import Link from "next/link";

import { listTopOutliers } from "@/lib/services/outliers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DashboardSection } from "@/components/features/dashboard/dashboard-section";
import { OutlierCard } from "@/components/features/outliers/outlier-card";
import type { RequestContext } from "@/lib/context";

// "trending" is listTopOutliers' fixed 7-day window -- exactly "this week".
async function OutliersThisWeek({ ctx }: { ctx: RequestContext }) {
  const outliers = await listTopOutliers(ctx, { view: "trending", limit: 6 });

  return (
    <DashboardSection
      id="dash-outliers"
      title="Outliers in your niche this week"
      viewAllHref="/outliers"
    >
      {outliers.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {outliers.map((outlier) => (
            <OutlierCard key={outlier.id} outlier={outlier} />
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <p className="flex-1 text-body-sm text-text-secondary">
            Outliers show up here once your tracked channels sync — videos beating their
            channel&apos;s usual views. Track a channel to start.
          </p>
          <Button asChild size="sm" variant="secondary">
            <Link href="/tracking">Track a channel</Link>
          </Button>
        </Card>
      )}
    </DashboardSection>
  );
}

export { OutliersThisWeek };
