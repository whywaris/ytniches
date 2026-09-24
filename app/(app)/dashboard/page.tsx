import { Suspense } from "react";

import { getRequestContext } from "@/lib/context";
import {
  getOnboardingProfile,
  getProfileSummary,
  shouldShowFinishOnboardingBanner,
} from "@/lib/services/onboarding";
import { listMyWorkspaceMemberships } from "@/lib/services/workspace";
import { ComingUp } from "@/components/features/dashboard/coming-up";
import { SectionSkeleton } from "@/components/features/dashboard/dashboard-section";
import { LatestUploads } from "@/components/features/dashboard/latest-uploads";
import { NextStepCard } from "@/components/features/dashboard/next-step-card";
import { OutliersThisWeek } from "@/components/features/dashboard/outliers-this-week";
import { StatsStrip } from "@/components/features/dashboard/stats-strip";
import { FinishOnboardingBanner } from "@/app/(app)/dashboard/finish-onboarding-banner";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — YTNiches",
};

function greetingFor(timeZone: string): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone }).format(
      new Date(),
    ),
  );
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

// UI-UX-Flow.md §4.5, redesigned: greeting + one next step, then outliers,
// uploads, what's coming up, and a compact stats line. Only the greeting
// data is awaited here; every section streams in its own Suspense so one
// slow query never holds up the rest. ctx is resolved once and passed down.
export default async function DashboardPage() {
  const ctx = await getRequestContext();
  const [profile, onboarding, memberships] = await Promise.all([
    getProfileSummary(ctx),
    getOnboardingProfile(ctx),
    listMyWorkspaceMemberships(ctx),
  ]);
  const workspaceId = memberships[0]?.workspaceId ?? null;
  const firstName = profile.name?.split(" ")[0];

  return (
    <div className="pb-10">
      {shouldShowFinishOnboardingBanner(onboarding) ? <FinishOnboardingBanner /> : null}

      <h1 className="text-h2 font-semibold text-text-primary">
        Good {greetingFor(profile.timeZone)}
        {firstName ? `, ${firstName}` : ""}
      </h1>

      <Suspense fallback={<SectionSkeleton />}>
        <NextStepCard ctx={ctx} workspaceId={workspaceId} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton rows={2} />}>
        <OutliersThisWeek ctx={ctx} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton rows={3} height="h-16" />}>
        <LatestUploads ctx={ctx} />
      </Suspense>

      {workspaceId ? (
        <Suspense fallback={<SectionSkeleton rows={2} height="h-20" />}>
          <ComingUp ctx={ctx} workspaceId={workspaceId} />
        </Suspense>
      ) : null}

      <Suspense fallback={<SectionSkeleton height="h-6" />}>
        <StatsStrip ctx={ctx} />
      </Suspense>
    </div>
  );
}
