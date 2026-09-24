import Link from "next/link";

import { listTopOutliers } from "@/lib/services/outliers";
import { getTrackedChannelCount } from "@/lib/services/tracking";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DashboardSection } from "@/components/features/dashboard/dashboard-section";
import { OutlierCard } from "@/components/features/outliers/outlier-card";
import type { RequestContext } from "@/lib/context";

// Only queried on the empty path: which empty state depends on whether the
// user tracks anything yet.
async function EmptyOutliers({ ctx }: { ctx: RequestContext }) {
  const tracking = (await getTrackedChannelCount(ctx)) > 0;
  return (
    <Card className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
      <p className="flex-1 text-body-sm text-text-secondary">
        {tracking
          ? "Nothing broke out this week. Outliers are videos beating their channel’s usual views by 3×. Tracking more channels helps."
          : "Outliers show up here once your tracked channels sync — videos beating their channel’s usual views. Track a channel to start."}
      </p>
      <Button asChild size="sm" variant="secondary">
        {tracking ? (
          <Link href="/niches">Find channels</Link>
        ) : (
          <Link href="/tracking">Track a channel</Link>
        )}
      </Button>
    </Card>
  );
}

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
        <EmptyOutliers ctx={ctx} />
      )}
    </DashboardSection>
  );
}

export { OutliersThisWeek };
