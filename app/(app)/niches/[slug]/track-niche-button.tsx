"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-provider";
import { trackNicheAction } from "@/app/(app)/niches/actions";

export function TrackNicheButton({ slug }: { slug: string }) {
  const { showToast } = useToast();
  const [pending, startTransition] = React.useTransition();

  return (
    <Button
      loading={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await trackNicheAction(slug);
          if (!result.ok) {
            showToast({ title: "Couldn't track this niche.", variant: "error" });
          } else if (result.value.limitReached) {
            showToast({
              title: "You've reached your plan's tracked-channel limit.",
              variant: "warning",
            });
          } else {
            showToast({
              title: `Tracking ${result.value.tracked} top channels.`,
              variant: "success",
            });
          }
        })
      }
    >
      Track niche
    </Button>
  );
}
