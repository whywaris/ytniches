"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import type { BillingFrequency } from "@/lib/billing";
import { TierCards } from "@/components/features/billing/tier-cards";

// Monetization.md §5.4: "Start free trial" -> /signup. The trial itself
// (Monetization.md §1.1: 14-day Pro trial, no card) activates on
// onboarding completion (lib/services/onboarding.ts's completeOnboarding/
// skipOnboarding), not at checkout -- picking a tier here is just
// pre-selecting intent for signup, not an actual Creem checkout, so this
// page needs no Server Action of its own.
function PricingClient() {
  const router = useRouter();
  const [billingFrequency, setBillingFrequency] = React.useState<BillingFrequency>("monthly");

  return (
    <TierCards
      billingFrequency={billingFrequency}
      onBillingFrequencyChange={setBillingFrequency}
      ctaLabel="Start free trial"
      onSelectTier={() => router.push("/signup")}
    />
  );
}

export { PricingClient };
