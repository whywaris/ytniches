"use client";

import { useEffect } from "react";

import NextError from "next/error";

import * as Sentry from "@sentry/nextjs";

// Required by the App Router setup: this is what catches errors thrown in
// the root layout itself, which error.tsx boundaries elsewhere can't.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
