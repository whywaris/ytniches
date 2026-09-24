import Link from "next/link";

import { Radar, Sparkles, Zap } from "lucide-react";

import { getRequestContext } from "@/lib/context";
import { getBalance, getCreditsUsedThisMonth } from "@/lib/credits";
import {
  getOnboardingProfile,
  getProfileSummary,
  shouldShowFinishOnboardingBanner,
} from "@/lib/services/onboarding";
import { getActivityFeed, getTrackedChannelCount } from "@/lib/services/tracking";
import { getPromptCount } from "@/lib/services/prompts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/features/dashboard/metric-card";
import { FinishOnboardingBanner } from "@/app/(app)/dashboard/finish-onboarding-banner";
import {
  ContinueWhereLeftOff,
  StreakMetricCard,
} from "@/app/(app)/dashboard/dashboard-client-widgets";

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

// UI-UX-Flow.md §4.5. D-037: replaces the placeholder that stood in for
// this page while no app shell existed to provide navigation -- the shell
// now owns that job, so this page can focus purely on content.
export default async function DashboardPage() {
  const ctx = await getRequestContext();
  const [profile, onboarding, trackedChannelCount, promptCount, balance, creditsUsed, activity] =
    await Promise.all([
      getProfileSummary(ctx),
      getOnboardingProfile(ctx),
      getTrackedChannelCount(ctx),
      getPromptCount(ctx),
      getBalance(ctx),
      getCreditsUsedThisMonth(ctx),
      getActivityFeed(ctx, { limit: 10 }),
    ]);

  const showFinishOnboardingBanner = shouldShowFinishOnboardingBanner(onboarding);
  const isEmpty = trackedChannelCount === 0 && promptCount === 0;
  const greeting = greetingFor(profile.timeZone);
  const firstName = profile.name?.split(" ")[0];

  return (
    <div className="pb-10">
      {showFinishOnboardingBanner ? <FinishOnboardingBanner /> : null}

      <h1 className="text-h2 font-semibold text-text-primary">
        Good {greeting}
        {firstName ? `, ${firstName}` : ""}
      </h1>

      {isEmpty ? (
        <Card className="mt-4">
          <EmptyState message="Ready when you are. Try Niche Finder to discover channels." />
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/niches">Try Niche Finder</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <p className="mt-1 text-body-sm text-text-secondary">
            You have {balance} credits and {trackedChannelCount} tracked channel
            {trackedChannelCount === 1 ? "" : "s"}.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <MetricCard label="Tracked channels" value={trackedChannelCount} icon={Radar} />
            <MetricCard label="Saved prompts" value={promptCount} icon={Sparkles} />
            <MetricCard label="Credits used this month" value={creditsUsed} icon={Zap} />
            <StreakMetricCard />
          </div>

          <div className="mt-8">
            <ContinueWhereLeftOff />
          </div>

          <div className="mt-8">
            <h2 className="mb-2 text-body-sm font-semibold text-text-secondary">Recent activity</h2>
            {activity.ok && activity.value.notifications.length > 0 ? (
              <Card padding="sm">
                <ul className="divide-y divide-border-subtle">
                  {activity.value.notifications.map((notification) => (
                    <li key={notification.id} className="px-1 py-2.5 text-body-sm">
                      <div className="text-text-primary">{notification.title}</div>
                      {notification.body ? (
                        <div className="text-text-tertiary">{notification.body}</div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </Card>
            ) : (
              <p className="text-body-sm text-text-tertiary">No activity yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
