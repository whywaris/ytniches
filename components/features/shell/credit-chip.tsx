import Link from "next/link";

import { Zap } from "lucide-react";

import { getRequestContext } from "@/lib/context";
import { getBalance } from "@/lib/credits";

// UI-UX-Flow.md §4.2 ("Credit balance chip... clickable, opens billing
// quick-view"). Streamed in its own Suspense boundary (see app-top-bar's
// use). Simplified to a direct link to /settings/billing rather than a
// separate popover quick-view component -- not worth a second UI surface
// just to preview the same numbers one click away.
async function CreditChip() {
  const ctx = await getRequestContext();
  const balance = await getBalance(ctx);

  return (
    <Link
      href="/settings/billing"
      className="flex h-8 items-center gap-1.5 rounded-sm border border-border-subtle px-2.5 text-body-sm text-text-secondary hover:bg-bg-hover hover:text-text-primary"
    >
      <Zap className="size-3.5 text-accent-text" aria-hidden="true" />
      {balance} credits
    </Link>
  );
}

export { CreditChip };
