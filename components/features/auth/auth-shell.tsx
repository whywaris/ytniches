import type { ReactNode } from "react";

import Link from "next/link";

import { Logo } from "@/components/features/brand/logo";

// UI-UX-Flow.md §2.5: the frame every auth page shares.
function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base px-6 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Link href="/" aria-label="YTNiches home" className="mb-6 inline-flex text-text-primary">
            <Logo decorative className="h-8" />
          </Link>
          <h1 className="text-h2 font-semibold text-text-primary">{title}</h1>
          {subtitle ? <p className="mt-1 text-body-sm text-text-secondary">{subtitle}</p> : null}
        </div>
        {children}
      </div>
    </div>
  );
}

function OrDivider() {
  return (
    <div className="flex items-center gap-3 text-caption text-text-secondary">
      <span className="h-px flex-1 bg-border-subtle" />
      or
      <span className="h-px flex-1 bg-border-subtle" />
    </div>
  );
}

export { AuthShell, OrDivider };
