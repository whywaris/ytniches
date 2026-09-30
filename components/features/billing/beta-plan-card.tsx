import type { ReactNode } from "react";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { BETA_PLAN } from "@/lib/billing/plans";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";

// D-081: the one plan during the beta. Price, credits and features come from
// BETA_PLAN (lib/billing/plans.ts), never typed here. `action` is the CTA on
// /pricing ("Start free") or a "Your plan" tag in the app.
function BetaPlanCard({ action, className }: { action?: ReactNode; className?: string }) {
  return (
    <Card padding="lg" className={cn("flex flex-col gap-4 border-accent", className)}>
      <Tag tone="info" className="w-fit">
        Free during beta
      </Tag>
      <div>
        <h3 className="text-h4 text-text-primary">{BETA_PLAN.label}</h3>
        <p className="text-h3 text-text-primary">
          ${BETA_PLAN.price}
          <span className="text-body-sm font-normal text-text-secondary">/mo</span>
        </p>
        <p className="text-body-sm text-text-secondary">No credit card needed.</p>
      </div>
      <ul className="flex flex-1 flex-col gap-2">
        {BETA_PLAN.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-body-sm text-text-secondary">
            <Check className="mt-0.5 size-4 shrink-0 text-accent-text" aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>
      {action}
    </Card>
  );
}

export { BetaPlanCard };
