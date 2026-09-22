"use client";

import * as React from "react";

import Link from "next/link";

import { X } from "lucide-react";

import { readLocalStorage, writeLocalStorage } from "@/lib/local-storage";
import { Button } from "@/components/ui/button";

const DISMISSED_KEY = "ytniches:onboarding_banner_dismissed";

// UI-UX-Flow.md §3 "Skip behavior": a subtle banner for skipped users,
// linking back to onboarding. Dismissal is a per-viewer convenience, not
// state anyone else needs to see -- localStorage only, no DB column.
function FinishOnboardingBanner() {
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from an external system (localStorage) post-mount, same pattern as niche-finder-client's view preference
    setDismissed(readLocalStorage(DISMISSED_KEY, false, (raw) => raw === "true"));
  }, []);

  if (dismissed) return null;

  return (
    <div
      role="alert"
      className="mb-4 flex items-center justify-between gap-3 rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-body-sm text-warning"
    >
      <Link href="/onboarding" className="font-medium hover:underline">
        Finish setting up your account &rarr;
      </Link>
      <Button
        variant="ghost"
        size="sm"
        iconOnly
        aria-label="Dismiss"
        onClick={() => {
          setDismissed(true);
          writeLocalStorage(DISMISSED_KEY, "true");
        }}
      >
        <X className="text-warning" aria-hidden="true" />
      </Button>
    </div>
  );
}

export { FinishOnboardingBanner };
