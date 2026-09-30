"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast-provider";
import type { FeedTab } from "@/lib/discovery/feed-url";
import type { UnlockFeedFilters } from "@/components/features/niche-finder/filter-bar/filter-bar";

// D-072: shown instead of results when a URL carries billable filters this
// user hasn't paid for in the last 24h (a shared link, back button). Page
// renders never charge; only this button (or the panel's Apply) does.
export interface FilteredViewGateProps {
  tab: FeedTab;
  values: Record<string, string>;
  unlock: UnlockFeedFilters;
}

function FilteredViewGate({ tab, values, unlock }: FilteredViewGateProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = React.useTransition();

  return (
    <Card className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
      <Lock className="size-5 shrink-0 text-text-tertiary" aria-hidden="true" />
      <div className="flex-1">
        <p className="text-body font-medium text-text-primary">Filtered search</p>
        <p className="text-body-sm text-text-secondary">
          This filtered view costs 1 credit, then it&apos;s free to re-run or page for 24 hours. The
          unfiltered feed is always free.
        </p>
      </div>
      <Button
        size="sm"
        loading={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await unlock(tab, values, crypto.randomUUID());
            if (result.ok) {
              router.refresh();
            } else {
              showToast({
                title:
                  result.error.type === "insufficient_credits"
                    ? "You need 1 credit for a filtered search."
                    : "Couldn't unlock this view.",
                variant: "error",
              });
            }
          })
        }
      >
        Show results (1 credit)
      </Button>
    </Card>
  );
}

export { FilteredViewGate };
