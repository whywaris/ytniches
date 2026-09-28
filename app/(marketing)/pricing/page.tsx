import { BETA_MODE } from "@/lib/billing/beta";
import { TRIAL_PITCH } from "@/lib/billing/plans";
import { BetaBanner } from "@/components/features/billing/beta-banner";
import { PricingClient } from "@/app/(marketing)/pricing/pricing-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — YTNiches",
};

// Application-Flow.md §2.1 (public route, no auth). UI-UX-Flow.md §8.1.3 /
// Monetization.md §2: 3 tiers, Pro recommended, monthly/annual toggle.
export default function PricingPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-16">
      <div className="text-center">
        <h1 className="font-display text-h1 font-normal text-text-primary md:text-display-sm">
          Pricing
        </h1>
        <p className="mt-2 text-body text-text-secondary">
          {TRIAL_PITCH}. No credit card required.
        </p>
      </div>
      {BETA_MODE ? <BetaBanner className="mx-auto w-full max-w-xl" /> : null}
      {/* The tier cards' titles are h3s; keep the outline h1 -> h2 -> h3. */}
      <h2 className="sr-only">Plans</h2>
      <PricingClient />
    </div>
  );
}
