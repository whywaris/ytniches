import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getRequestContext } from "@/lib/context";
import { getOnboardingProfile, shouldShowFinishOnboardingBanner } from "@/lib/services/onboarding";
import { signOut } from "@/app/(app)/actions";
import { FinishOnboardingBanner } from "@/app/(app)/dashboard/finish-onboarding-banner";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — YTNiches",
};

// Placeholder landing page for Phase 0's auth flow (middleware redirects
// here on successful login). Real dashboard is Phase 1 (UI-UX-Flow.md
// §4.5).
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ctx = await getRequestContext();
  const onboarding = await getOnboardingProfile(ctx);
  const showFinishOnboardingBanner = shouldShowFinishOnboardingBanner(onboarding);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-base px-6 text-center">
      {showFinishOnboardingBanner ? (
        <div className="w-full max-w-md">
          <FinishOnboardingBanner />
        </div>
      ) : null}
      <h1 className="text-h1 font-semibold text-text-primary">Dashboard — coming in Phase 1</h1>
      {user?.email ? (
        <p className="text-body-sm text-text-secondary">Signed in as {user.email}</p>
      ) : null}
      <form action={signOut}>
        <Button type="submit" variant="ghost">
          Log out
        </Button>
      </form>
    </div>
  );
}
