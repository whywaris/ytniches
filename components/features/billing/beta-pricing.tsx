import type { ReactNode } from "react";

import { BetaPlanCard } from "@/components/features/billing/beta-plan-card";
import { PlansAfterBeta } from "@/components/features/billing/plans-after-beta";

// D-081: pricing while BETA_MODE is on -- the Beta card on top, the paid
// plans below as "Plans after beta". Shared by /pricing and the in-app
// plans modal, so both say the same thing.
function BetaPricing({ betaAction }: { betaAction?: ReactNode }) {
  return (
    <div className="flex flex-col gap-10">
      <BetaPlanCard action={betaAction} className="mx-auto w-full max-w-sm" />
      <PlansAfterBeta />
    </div>
  );
}

export { BetaPricing };
