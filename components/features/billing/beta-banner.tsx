import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { BETA_BANNER } from "@/lib/billing/beta";

// D-081: the one beta notice, on /pricing, the upgrade modal and billing.
function BetaBanner({ className }: { className?: string }) {
  return (
    <p
      role="status"
      className={cn(
        "flex items-center justify-center gap-2 rounded-md border border-accent-border bg-accent-subtle px-4 py-3 text-body-sm font-medium text-text-primary",
        className,
      )}
    >
      <Sparkles aria-hidden="true" className="size-4 shrink-0 text-accent-text" />
      {BETA_BANNER}
    </p>
  );
}

export { BetaBanner };
