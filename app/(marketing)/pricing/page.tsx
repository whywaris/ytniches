import { BETA_MODE } from "@/lib/billing/beta";
import { TRIAL_PITCH } from "@/lib/billing/plans";
import { PricingContent } from "@/app/(marketing)/pricing/pricing-content";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — YTNiches",
  description: `${TRIAL_PITCH}. No credit card required.`,
};

// Application-Flow.md §2.1 (public route, no auth).
export default function PricingPage() {
  return <PricingContent betaMode={BETA_MODE} />;
}
