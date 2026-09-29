"use client";

import * as React from "react";

import type { BillingFrequency } from "@/lib/billing";
import { BETA_NOTICE_LINE } from "@/lib/billing/beta";
import { TierCards } from "@/components/features/billing/tier-cards";

// D-081: the paid plans with their real prices (payment-provider review
// needs public pricing), muted, "Coming soon", no buttons.
function PlansAfterBeta() {
  const [billingFrequency, setBillingFrequency] = React.useState<BillingFrequency>("monthly");
  return (
    <section aria-labelledby="plans-after-beta" className="flex flex-col gap-4">
      <div className="text-center">
        <h2 id="plans-after-beta" className="text-h3 text-text-primary">
          Plans after beta
        </h2>
        <p className="mt-1 text-body-sm text-text-secondary">{BETA_NOTICE_LINE}</p>
      </div>
      <TierCards
        billingFrequency={billingFrequency}
        onBillingFrequencyChange={setBillingFrequency}
        comingSoon
      />
    </section>
  );
}

export { PlansAfterBeta };
