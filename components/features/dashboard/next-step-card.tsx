import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { chooseNextStep } from "@/lib/dashboard";
import { getCalendarEntryCount } from "@/lib/services/calendar";
import { listTopOutliers } from "@/lib/services/outliers";
import { getPromptCount } from "@/lib/services/prompts";
import { getTrackedChannelCount } from "@/lib/services/tracking";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { RequestContext } from "@/lib/context";

// 7-day top outlier, else the last 30 days. Every tracking user needs it:
// no outlier means the card steers to "Track more channels" instead.
async function findTopOutlier(ctx: RequestContext) {
  const [week] = await listTopOutliers(ctx, { view: "trending", limit: 1 });
  if (week) return week;
  const [month] = await listTopOutliers(ctx, { view: "grid", published: 30, limit: 1 });
  return month ?? null;
}

async function NextStepCard({
  ctx,
  workspaceId,
}: {
  ctx: RequestContext;
  workspaceId: string | null;
}) {
  const [trackedChannelCount, promptCount] = await Promise.all([
    getTrackedChannelCount(ctx),
    getPromptCount(ctx),
  ]);
  const [topOutlier, calendarEntryCount] = await Promise.all([
    trackedChannelCount > 0 ? findTopOutlier(ctx) : null,
    workspaceId && promptCount > 0 ? getCalendarEntryCount(workspaceId) : null,
  ]);

  const step = chooseNextStep({
    trackedChannelCount,
    promptCount,
    hasWorkspace: workspaceId !== null,
    calendarEntryCount,
    topOutlier,
  });

  return (
    <Card
      padding="lg"
      className="mt-6 flex flex-col gap-4 border-accent-border bg-accent-subtle sm:flex-row sm:items-center"
    >
      <div className="flex-1">
        <p className="text-caption font-semibold tracking-wide text-accent-text uppercase">
          Next step
        </p>
        <h2 className="mt-1 text-h3 font-semibold text-text-primary">{step.title}</h2>
        <p className="mt-1 text-body-sm text-text-secondary">{step.body}</p>
      </div>
      <Button asChild>
        <Link href={step.href}>
          {step.cta} <ArrowRight aria-hidden="true" />
        </Link>
      </Button>
    </Card>
  );
}

export { NextStepCard };
