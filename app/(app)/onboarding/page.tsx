import { redirect } from "next/navigation";

import { getRequestContext } from "@/lib/context";
import { getOnboardingProfile } from "@/lib/services/onboarding";
import { OnboardingClient } from "@/app/(app)/onboarding/onboarding-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome — YTNiches",
};

// UI-UX-Flow.md §3. A completed (or skipped) user has nothing left to do
// here -- send them on, same as auth/callback/route.ts's own step >= 5
// branch. Everything below that is interactive; the actual 5-step flow
// lives in onboarding-client.tsx.
export default async function OnboardingPage() {
  const ctx = await getRequestContext();
  const profile = await getOnboardingProfile(ctx);

  if (profile.step >= 5) {
    redirect("/dashboard");
  }

  return (
    <OnboardingClient
      initialStep={profile.step}
      initialName={profile.name ?? ""}
      initialPrimaryGoal={profile.primaryGoal}
    />
  );
}
