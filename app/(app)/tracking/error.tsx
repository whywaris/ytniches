"use client";

import { useEffect } from "react";

import * as Sentry from "@sentry/nextjs";

import { ErrorState } from "@/components/ui/error-state";

// TRD.md §2.6: "Every route has an error.tsx (fallback with retry action)."
// This only catches unexpected throws — the expected feed states (empty,
// loading, service error) are handled inline in tracking-client.tsx per
// TRD.md §3.3, never thrown.
export default function TrackingError({
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
      <ErrorState message="Something went wrong loading your tracked channels." onRetry={reset} />
    </div>
  );
}
