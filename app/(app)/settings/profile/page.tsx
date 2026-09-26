import { getRequestContext } from "@/lib/context";
import { getProfileSummary } from "@/lib/services/onboarding";
import { listTimeZones } from "@/lib/time-zone";
import { ProfileClient } from "@/app/(app)/settings/profile/profile-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile — YTNiches",
};

// UI-UX-Flow.md §8.1 Profile, first cut: the time zone (D-064), which sets
// when the digest arrives and how quiet hours are read.
export default async function ProfileSettingsPage() {
  const profile = await getProfileSummary(await getRequestContext());
  return <ProfileClient timeZone={profile.timeZone} timeZones={listTimeZones()} />;
}
