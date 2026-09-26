import type { ReactNode } from "react";

import { getRequestContext } from "@/lib/context";
import { getProfileSummary } from "@/lib/services/onboarding";
import { listMyWorkspaceMemberships } from "@/lib/services/workspace";
import { getTrackedChannelCount } from "@/lib/services/tracking";
import { getPromptCount } from "@/lib/services/prompts";
import { ThemeProvider } from "@/components/theme-provider";
import { AppShell } from "@/components/features/shell/app-shell";
import { NotificationBell } from "@/components/features/shell/notification-bell";
import { CreditChip } from "@/components/features/shell/credit-chip";

// D-037. Wraps every (app) route except /onboarding (moved to
// app/onboarding/ -- UI-UX-Flow.md §3 spec's own "no sidebar" layout for
// that flow would otherwise be double-chromed by this shell). Sidebar/
// tier-gated data is fetched here and awaited (fast, already-cached-tier
// queries); notification count and credit balance are NOT awaited here --
// they're handed to AppShell as unresolved async components, each wrapped
// in its own <Suspense> inside app-top-bar.tsx, so a slow one never blocks
// this layout's own render.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const ctx = await getRequestContext();
  const [profile, memberships, trackedChannelCount, promptCount] = await Promise.all([
    getProfileSummary(ctx),
    listMyWorkspaceMemberships(ctx),
    getTrackedChannelCount(ctx),
    getPromptCount(ctx),
  ]);

  return (
    <ThemeProvider>
      <AppShell
        hasWorkspace={memberships.length > 0}
        trackedChannelCount={trackedChannelCount}
        promptCount={promptCount}
        profileName={profile.name}
        profileAvatarUrl={profile.avatarUrl}
        isSuperAdmin={profile.role === "super_admin"}
        detectTimeZone={profile.timeZoneSource === "default"}
        notificationBell={<NotificationBell />}
        creditChip={<CreditChip />}
      >
        {children}
      </AppShell>
    </ThemeProvider>
  );
}
