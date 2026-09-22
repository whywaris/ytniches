"use server";

import { getRequestContext } from "@/lib/context";
import { cancelSubscription, createCheckout, getBillingPortalUrl } from "@/lib/services/billing";
import type { BillingFrequency, Tier } from "@/lib/billing";
import type { Result } from "@/lib/result";

// Thin per CLAUDE.md's Server Action pattern. No redirect() here on
// purpose -- Next.js Server Actions can't redirect to an external URL
// cleanly, so this returns the checkout URL and the client navigates
// itself (components/features/billing/upgrade-modal.tsx).
export async function createCheckoutAction(
  tier: Tier,
  billingFrequency: BillingFrequency,
): Promise<Result<{ checkoutUrl: string }, { type: "no_email" }>> {
  const ctx = await getRequestContext();
  return createCheckout(ctx, tier, billingFrequency);
}

export async function getBillingPortalUrlAction(): Promise<
  Result<string, { type: "no_subscription" }>
> {
  const ctx = await getRequestContext();
  return getBillingPortalUrl(ctx);
}

export async function cancelSubscriptionAction(): Promise<
  Result<void, { type: "no_subscription" }>
> {
  const ctx = await getRequestContext();
  return cancelSubscription(ctx);
}
