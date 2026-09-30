import Link from "next/link";

import { TRIAL_PITCH } from "@/lib/billing/plans";
import { softwareJsonLd } from "@/lib/seo/software-json-ld";
import { Button } from "@/components/ui/button";
import { BetaPricing } from "@/components/features/billing/beta-pricing";
import { PricingClient } from "@/app/(marketing)/pricing/pricing-client";

// UI-UX-Flow.md §8.1.3 / Monetization.md §2: 3 tiers, Pro recommended,
// monthly/annual toggle. D-081: while BETA_MODE is on, one Beta card ($0)
// with the paid plans below as "Plans after beta"; turning BETA_MODE off
// brings the normal plans back with nothing else to change. `betaMode` is
// a prop (not read here) so both states are testable.
function PricingContent({ betaMode }: { betaMode: boolean }) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareJsonLd(`${TRIAL_PITCH}.`, betaMode)),
        }}
      />
      <div className="text-center">
        <h1 className="font-display text-h1 font-normal text-text-primary md:text-display-sm">
          Pricing
        </h1>
        <p className="mt-2 text-body text-text-secondary">
          {TRIAL_PITCH}. No credit card required.
        </p>
      </div>
      {/* Plan titles are h3s; keep the outline h1 -> h2 -> h3. */}
      {betaMode ? (
        <>
          <h2 className="sr-only">Beta plan</h2>
          <BetaPricing
            betaAction={
              <Button asChild fullWidth>
                <Link href="/signup">Start free</Link>
              </Button>
            }
          />
        </>
      ) : (
        <>
          <h2 className="sr-only">Plans</h2>
          <PricingClient />
        </>
      )}
    </div>
  );
}

export { PricingContent };
