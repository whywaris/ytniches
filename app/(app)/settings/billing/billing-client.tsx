"use client";

import * as React from "react";

import {
  cancelSubscriptionAction,
  getBillingPortalUrlAction,
} from "@/app/(app)/settings/billing/actions";
import type { AccountState, SubscriptionStatus } from "@/lib/services/billing";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Tag } from "@/components/ui/tag";
import { useToast } from "@/components/ui/toast-provider";
import { BETA_MODE } from "@/lib/billing/beta";
import { isAnnualPeriod, nextMonthlyAnniversary } from "@/lib/billing/cycles";
import { BETA_PLAN, TIER_INFO, TRIAL } from "@/lib/billing/plans";
import { SUPPORT_EMAIL } from "@/lib/site";
import { BetaBanner } from "@/components/features/billing/beta-banner";
import { UpgradeModal } from "@/components/features/billing/upgrade-modal";

export interface BillingClientProps {
  subscription: SubscriptionStatus | null;
  creditsBalance: number;
}

const ACCOUNT_STATE_LABEL: Record<AccountState, string> = {
  trialing: "Trial",
  active: "Active",
  cancelling: "Cancelling at period end",
  past_due: "Payment failed",
  paused: "Paused",
  expired_trial: "Trial ended",
  expired: "Expired",
};

// Inferred from the period length (no billing-frequency column).
function inferredFrequencyLabel(currentPeriodStart: string, currentPeriodEnd: string): "mo" | "yr" {
  return isAnnualPeriod(currentPeriodStart, currentPeriodEnd) ? "yr" : "mo";
}

// D-081: a beta trial never ends, so it shows when its credits next refill
// instead of an end date.
function renewalLabel(subscription: SubscriptionStatus): string {
  if (subscription.accountState !== "trialing") return "Next billing date";
  return BETA_MODE ? "Credits refill" : "Trial ends";
}

function renewalDate(subscription: SubscriptionStatus): Date {
  if (subscription.accountState !== "trialing") return new Date(subscription.currentPeriodEnd);
  if (BETA_MODE) {
    return nextMonthlyAnniversary(new Date(subscription.currentPeriodStart), new Date());
  }
  return new Date(subscription.trialEndsAt ?? subscription.currentPeriodEnd);
}

// UI-UX-Flow.md §8.1.3. No sub-nav shell (see page.tsx's comment) --
// standalone card. Payment method + billing history intentionally aren't
// rendered here (Monetization.md §6.8: "User accesses all invoices in
// Creem customer portal, linked from /settings/billing" -- the portal
// link below is that link, not a separate fetch+table on our end).
function BillingClient({ subscription, creditsBalance }: BillingClientProps) {
  const { showToast } = useToast();
  const [showUpgrade, setShowUpgrade] = React.useState(false);
  const [confirmingCancel, setConfirmingCancel] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(false);
  const [openingPortal, setOpeningPortal] = React.useState(false);

  const hasPaidSubscription = subscription?.providerSubscriptionId != null;
  const canManage =
    hasPaidSubscription &&
    subscription != null &&
    subscription.accountState !== "expired" &&
    subscription.accountState !== "expired_trial";

  async function handleManagePlan() {
    setOpeningPortal(true);
    const result = await getBillingPortalUrlAction();
    setOpeningPortal(false);
    if (!result.ok) {
      showToast({ title: "No billing portal available yet", variant: "error" });
      return;
    }
    window.location.href = result.value;
  }

  async function handleCancel() {
    setCancelling(true);
    const result = await cancelSubscriptionAction();
    setCancelling(false);
    setConfirmingCancel(false);
    if (!result.ok) {
      showToast({ title: "Couldn't cancel — try again", variant: "error" });
      return;
    }
    showToast({
      title: "Cancellation scheduled for the end of your billing period",
      variant: "success",
    });
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-8">
      <h1 className="text-h3 text-text-primary">Billing</h1>
      {BETA_MODE && !hasPaidSubscription ? <BetaBanner /> : null}

      <Card padding="lg">
        <CardHeader>
          <h2 className="text-h4 text-text-primary">Current plan</h2>
          {subscription ? (
            <Tag tone={subscription.accountState === "active" ? "success" : "warning"}>
              {ACCOUNT_STATE_LABEL[subscription.accountState]}
            </Tag>
          ) : null}
        </CardHeader>

        {subscription ? (
          <div className="flex flex-col gap-3">
            <div>
              {/* D-081: a beta account's trial is the Beta plan ($0). */}
              <p className="text-h3 text-text-primary">
                {BETA_MODE && subscription.accountState === "trialing"
                  ? BETA_PLAN.label
                  : TIER_INFO[subscription.tier].label}
              </p>
              {subscription.accountState === "trialing" ||
              subscription.accountState === "expired_trial" ? (
                <p className="text-body-sm text-text-secondary">
                  {BETA_MODE
                    ? `$${BETA_PLAN.price}/mo · Free during beta · ${BETA_PLAN.monthlyCredits} credits every month`
                    : `Free ${TRIAL.days}-day trial`}
                </p>
              ) : (
                <p className="text-body-sm text-text-secondary">
                  ${TIER_INFO[subscription.tier].monthlyPrice}/
                  {inferredFrequencyLabel(
                    subscription.currentPeriodStart,
                    subscription.currentPeriodEnd,
                  )}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-6 text-body-sm text-text-secondary">
              <div>
                <p className="text-caption text-text-tertiary">Credits remaining</p>
                <p className="text-body font-medium text-text-primary">
                  {creditsBalance.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-caption text-text-tertiary">{renewalLabel(subscription)}</p>
                <p className="text-body font-medium text-text-primary">
                  {renewalDate(subscription).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* D-051: a self-serve change opens a second subscription and
                  bills both, so paid-to-paid changes go through support. */}
              {hasPaidSubscription ? (
                <Button asChild>
                  <a href={`mailto:${SUPPORT_EMAIL}?subject=Change%20my%20plan`}>
                    Email us to change plans
                  </a>
                </Button>
              ) : BETA_MODE ? null : (
                <Button onClick={() => setShowUpgrade(true)}>Upgrade</Button>
              )}
              {canManage ? (
                <Button
                  variant="secondary"
                  loading={openingPortal}
                  onClick={() => void handleManagePlan()}
                >
                  Manage plan
                </Button>
              ) : null}
              {canManage && subscription.accountState !== "cancelling" ? (
                <Button variant="ghost" onClick={() => setConfirmingCancel(true)}>
                  Cancel plan
                </Button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-body-sm text-text-secondary">No active plan.</p>
            {BETA_MODE ? null : (
              <Button onClick={() => setShowUpgrade(true)} className="w-fit">
                Upgrade
              </Button>
            )}
          </div>
        )}
      </Card>

      <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />

      <ConfirmDialog
        open={confirmingCancel}
        onOpenChange={setConfirmingCancel}
        title="Cancel your plan?"
        description={
          subscription
            ? `You'll keep access until ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}. Cancel anyway?`
            : "Cancel anyway?"
        }
        confirmLabel="Cancel plan"
        destructive
        loading={cancelling}
        onConfirm={() => void handleCancel()}
      />
    </div>
  );
}

export { BillingClient };
