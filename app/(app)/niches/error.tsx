"use client";

import { useEffect } from "react";

import * as Sentry from "@sentry/nextjs";

import { ErrorState } from "@/components/ui/error-state";

// TRD.md §2.6: "Every route has an error.tsx (fallback with retry action)."
// This only catches unexpected throws (bugs, unhandled exceptions) — the
// expected error states (rate limit, insufficient credits, quota) are
// handled inline in niche-finder-client.tsx per TRD.md §3.3, never thrown.
export default function NichesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-16">
      <ErrorState message="Something went wrong loading channels." onRetry={reset} />
    </div>
  );
}
