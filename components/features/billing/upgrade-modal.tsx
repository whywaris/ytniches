"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { createCheckoutAction } from "@/app/(app)/settings/billing/actions";
import type { BillingFrequency, Tier } from "@/lib/billing";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast-provider";
import { TierCards } from "@/components/features/billing/tier-cards";

export interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** UI-UX-Flow.md §5.9's upgrade prompts -- why the modal opened, shown as a one-line reason above the tiers. Omit for an explicit "Upgrade" click. */
  reason?: string;
}

// Monetization.md §5.4/§5.8: shown when credits are exhausted, a tier
// limit is hit, or the user clicks Upgrade directly. createCheckout
// returns a URL rather than redirecting server-side (Next.js Server
// Actions can't cleanly redirect to an external host) -- the client
// navigates itself once the URL comes back.
function UpgradeModal({ open, onOpenChange, reason }: UpgradeModalProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [billingFrequency, setBillingFrequency] = React.useState<BillingFrequency>("monthly");
  const [loadingTier, setLoadingTier] = React.useState<Tier | null>(null);

  async function handleSelectTier(tier: Tier) {
    setLoadingTier(tier);
    const result = await createCheckoutAction(tier, billingFrequency);
    setLoadingTier(null);

    if (!result.ok) {
      showToast({ title: "Couldn't start checkout", variant: "error" });
      return;
    }
    router.push(result.value.checkoutUrl);
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Upgrade your plan" size="xl">
      <div className="flex flex-col gap-4">
        {reason ? (
          <p role="alert" className="text-body-sm text-warning">
            {reason}
          </p>
        ) : null}
        <TierCards
          billingFrequency={billingFrequency}
          onBillingFrequencyChange={setBillingFrequency}
          ctaLabel="Continue"
          onSelectTier={(tier) => void handleSelectTier(tier)}
          loadingTier={loadingTier}
        />
      </div>
    </Modal>
  );
}

export { UpgradeModal };
