import Link from "next/link";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account suspended — YTNiches",
  robots: { index: false },
};

// Public on purpose: a suspended user's session has already been revoked,
// so this must render without auth. Middleware sends suspended users here
// from any app/admin route; auth/callback does too when a banned user
// tries to sign in again.
export default function SuspendedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-base px-6">
      <div className="max-w-md text-center">
        <h1 className="text-h2 font-semibold text-text-primary">Your account is suspended</h1>
        <p className="mt-3 text-body text-text-secondary">
          You can&apos;t use YTNiches while your account is suspended. If you think this is a
          mistake, reply to any email you&apos;ve received from us and we&apos;ll look into it.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block text-body-sm font-medium text-accent-text hover:underline"
        >
          Back to ytniches.com
        </Link>
      </div>
    </main>
  );
}
