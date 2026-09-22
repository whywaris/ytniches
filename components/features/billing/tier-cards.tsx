"use client";

import * as React from "react";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { BillingFrequency, Tier } from "@/lib/billing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";

// Monetization.md §2. Prices in whole dollars (display only -- Creem
// products carry the authoritative cents amounts, TRD.md §4.3). Feature
// bullets are the quantifiable per-tier numbers (§2.5's feature matrix) --
// Team's Phase 3 collaboration features aren't built yet, so they're left
// out of this MVP-era card rather than advertising something unusable.
const TIER_INFO: Record<
  Tier,
  { label: string; monthlyPrice: number; yearlyPrice: number; features: string[] }
> = {
  starter: {
    label: "Starter",
    monthlyPrice: 19,
    yearlyPrice: 190,
    features: ["200 credits / month", "Track up to 10 channels", "Refreshes every 24 hours"],
  },
  pro: {
    label: "Pro",
    monthlyPrice: 49,
    yearlyPrice: 490,
    features: [
      "1,000 credits / month",
      "Track up to 50 channels",
      "Refreshes every 6 hours",
      "Priority AI generation",
      "Email digests",
    ],
  },
  team: {
    label: "Team",
    monthlyPrice: 99,
    yearlyPrice: 990,
    features: [
      "3,000 credits / month",
      "Track up to 100 channels",
      "Refreshes hourly",
      "3 seats included",
    ],
  },
};

const TIERS: Tier[] = ["starter", "pro", "team"];
const RECOMMENDED_TIER: Tier = "pro";

function BillingFrequencyToggle({
  value,
  onChange,
}: {
  value: BillingFrequency;
  onChange: (value: BillingFrequency) => void;
}) {
  return (
    <div role="group" aria-label="Billing frequency" className="inline-flex items-center gap-1">
      <Button
        type="button"
        size="sm"
        variant={value === "monthly" ? "secondary" : "ghost"}
        aria-pressed={value === "monthly"}
        onClick={() => onChange("monthly")}
      >
        Monthly
      </Button>
      <Button
        type="button"
        size="sm"
        variant={value === "yearly" ? "secondary" : "ghost"}
        aria-pressed={value === "yearly"}
        onClick={() => onChange("yearly")}
      >
        Annual
        <Tag tone="success" className="ml-1">
          2 months free
        </Tag>
      </Button>
    </div>
  );
}

export interface TierCardsProps {
  billingFrequency: BillingFrequency;
  onBillingFrequencyChange: (value: BillingFrequency) => void;
  ctaLabel: string;
  onSelectTier: (tier: Tier) => void;
  selectedTier?: Tier;
  loadingTier?: Tier | null;
  className?: string;
}

// UI-UX-Flow.md §8.1.3 / Monetization.md §5.4: 3 tiers side-by-side,
// recommended (Pro) highlighted, monthly/annual toggle. Shared between
// /pricing (public) and the in-app upgrade modal -- only the CTA's
// behavior differs between the two call sites.
function TierCards({
  billingFrequency,
  onBillingFrequencyChange,
  ctaLabel,
  onSelectTier,
  selectedTier,
  loadingTier,
  className,
}: TierCardsProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex justify-center">
        <BillingFrequencyToggle value={billingFrequency} onChange={onBillingFrequencyChange} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {TIERS.map((tier) => {
          const info = TIER_INFO[tier];
          const price =
            billingFrequency === "monthly" ? info.monthlyPrice : Math.round(info.yearlyPrice / 12);
          const recommended = tier === RECOMMENDED_TIER;

          return (
            <Card
              key={tier}
              variant={selectedTier === tier ? "selected" : "base"}
              padding="lg"
              className={cn("flex flex-col gap-4", recommended && "border-accent")}
            >
              {recommended ? (
                <Tag tone="info" className="w-fit">
                  Recommended
                </Tag>
              ) : null}
              <div>
                <h3 className="text-h4 text-text-primary">{info.label}</h3>
                <p className="text-h3 text-text-primary">
                  ${price}
                  <span className="text-body-sm font-normal text-text-tertiary">/mo</span>
                </p>
                {billingFrequency === "yearly" ? (
                  <p className="text-caption text-text-tertiary">
                    ${info.yearlyPrice} billed annually
                  </p>
                ) : null}
              </div>
              <ul className="flex flex-1 flex-col gap-2">
                {info.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-body-sm text-text-secondary"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                fullWidth
                variant={recommended ? "primary" : "secondary"}
                loading={loadingTier === tier}
                onClick={() => onSelectTier(tier)}
              >
                {ctaLabel}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export { TierCards, TIER_INFO };
