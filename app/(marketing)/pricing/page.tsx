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
        <h1 className="text-h1 font-semibold text-text-primary">Pricing</h1>
        <p className="mt-2 text-body text-text-secondary">
          Start with a 14-day free trial of Pro. No credit card required.
        </p>
      </div>
      <PricingClient />
    </div>
  );
}
