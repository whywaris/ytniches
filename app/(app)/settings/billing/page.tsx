import { getRequestContext } from "@/lib/context";
import { getBalance } from "@/lib/credits";
import { getSubscriptionStatus } from "@/lib/services/billing";
import { BillingClient } from "@/app/(app)/settings/billing/billing-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing — YTNiches",
};

// UI-UX-Flow.md §8.1.3. No settings sub-nav shell exists yet anywhere in
// this codebase (Profile/Notifications/Connections/Preferences/Danger
// zone aren't built) -- this renders standalone, same as /onboarding and
// /dashboard currently do, not blocked on that separate shell task.
export default async function BillingPage() {
  const ctx = await getRequestContext();
  const [subscription, creditsBalance] = await Promise.all([
    getSubscriptionStatus(ctx),
    getBalance(ctx),
  ]);

  return <BillingClient subscription={subscription} creditsBalance={creditsBalance} />;
}
