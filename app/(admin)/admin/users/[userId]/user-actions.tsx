"use client";

import * as React from "react";

import { formatUsd } from "@/lib/admin-metrics";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TextInput } from "@/components/ui/text-input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast-provider";
import {
  getRefundPreviewAction,
  grantCreditsAction,
  refundLastPaymentAction,
  suspendUserAction,
  unsuspendUserAction,
} from "@/app/(admin)/admin/users/[userId]/actions";

type ActionError = { type: string; message?: string };

const ERROR_COPY: Record<string, string> = {
  forbidden: "You're not allowed to do that.",
  not_found: "User not found.",
  cannot_suspend_self: "You can't suspend your own account.",
  no_paid_subscription: "This user has no paid subscription to refund.",
  no_transaction: "Creem has no payment on record for this subscription.",
  already_requested: "A refund for this payment was already requested.",
  transaction_changed: "A newer payment appeared. Reopen the refund dialog to review it.",
};

function describe(error: ActionError): string {
  return error.message ?? ERROR_COPY[error.type] ?? "Something went wrong.";
}

const DATE_TIME = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function UserActions({
  userId,
  suspended,
  hasPaidSubscription,
}: {
  userId: string;
  suspended: boolean;
  hasPaidSubscription: boolean;
}) {
  const { showToast } = useToast();
  const [pending, startTransition] = React.useTransition();

  const [grantAmount, setGrantAmount] = React.useState("");
  const [grantReason, setGrantReason] = React.useState("");
  const [suspendReason, setSuspendReason] = React.useState("");
  const [suspendOpen, setSuspendOpen] = React.useState(false);
  const [refund, setRefund] = React.useState<{
    transactionId: string;
    amountCents: number;
    paidAt: string;
    alreadyRequested: boolean;
  } | null>(null);

  function report(result: { ok: true } | { ok: false; error: ActionError }, success: string) {
    showToast(
      result.ok
        ? { title: success, variant: "success" }
        : { title: describe(result.error), variant: "error" },
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <h2 className="text-body font-semibold text-text-primary">Grant credits</h2>
        <form
          className="mt-3 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            startTransition(async () => {
              const result = await grantCreditsAction({
                userId,
                amount: grantAmount,
                reason: grantReason,
              });
              report(result, `Granted ${grantAmount} credits.`);
              if (result.ok) {
                setGrantAmount("");
                setGrantReason("");
              }
            });
          }}
        >
          <TextInput
            label="Credits"
            type="number"
            min={1}
            value={grantAmount}
            onChange={(event) => setGrantAmount(event.target.value)}
            required
          />
          <Textarea
            label="Reason (required)"
            value={grantReason}
            onChange={(event) => setGrantReason(event.target.value)}
            required
            minLength={3}
            maxLength={500}
          />
          <Button
            type="submit"
            size="sm"
            loading={pending}
            disabled={!grantAmount || grantReason.trim().length < 3}
          >
            Grant credits
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="text-body font-semibold text-text-primary">
          {suspended ? "Account suspended" : "Suspend account"}
        </h2>
        {suspended ? (
          <div className="mt-3 space-y-3">
            <p className="text-body-sm text-text-secondary">
              The user can&apos;t sign in or use the app.
            </p>
            <Button
              size="sm"
              variant="secondary"
              loading={pending}
              onClick={() =>
                startTransition(async () => {
                  report(await unsuspendUserAction({ userId }), "Account unsuspended.");
                })
              }
            >
              Unsuspend
            </Button>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <p className="text-body-sm text-text-secondary">
              Signs them out everywhere immediately and blocks sign-in.
            </p>
            <Textarea
              label="Reason (required)"
              value={suspendReason}
              onChange={(event) => setSuspendReason(event.target.value)}
              maxLength={500}
            />
            <Button
              size="sm"
              variant="destructive"
              disabled={suspendReason.trim().length < 3}
              onClick={() => setSuspendOpen(true)}
            >
              Suspend
            </Button>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-body font-semibold text-text-primary">Refund last payment</h2>
        <p className="mt-3 text-body-sm text-text-secondary">
          Full refund through Creem. Our records update when Creem&apos;s webhook arrives.
        </p>
        <Button
          className="mt-3"
          size="sm"
          variant="secondary"
          disabled={!hasPaidSubscription}
          loading={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await getRefundPreviewAction({ userId });
              if (result.ok) setRefund(result.value);
              else report(result, "");
            })
          }
        >
          Review refund
        </Button>
      </Card>

      <ConfirmDialog
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
        title="Suspend this account?"
        description="They're signed out of every session right away and can't sign back in until you unsuspend them."
        confirmLabel="Suspend"
        destructive
        loading={pending}
        onConfirm={() =>
          startTransition(async () => {
            const result = await suspendUserAction({ userId, reason: suspendReason });
            report(result, "Account suspended.");
            setSuspendOpen(false);
            if (result.ok) setSuspendReason("");
          })
        }
      />

      <ConfirmDialog
        open={refund !== null}
        onOpenChange={(open) => !open && setRefund(null)}
        title={refund?.alreadyRequested ? "Refund already requested" : "Refund this payment?"}
        description={
          refund
            ? refund.alreadyRequested
              ? `A refund for the ${formatUsd(refund.amountCents)} payment on ${DATE_TIME.format(new Date(refund.paidAt))} was already sent to Creem.`
              : `Refund ${formatUsd(refund.amountCents)} paid on ${DATE_TIME.format(new Date(refund.paidAt))} (Creem transaction ${refund.transactionId}). This can't be undone.`
            : undefined
        }
        confirmLabel={
          refund?.alreadyRequested
            ? "Close"
            : `Refund ${refund ? formatUsd(refund.amountCents) : ""}`
        }
        destructive={!refund?.alreadyRequested}
        loading={pending}
        onConfirm={() => {
          if (!refund || refund.alreadyRequested) {
            setRefund(null);
            return;
          }
          const transactionId = refund.transactionId;
          startTransition(async () => {
            const result = await refundLastPaymentAction({ userId, transactionId });
            report(result, "Refund sent to Creem.");
            setRefund(null);
          });
        }}
      />
    </div>
  );
}

export { UserActions };
