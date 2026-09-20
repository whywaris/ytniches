import * as React from "react";

import { Switch as RadixSwitch } from "radix-ui";

import { cn } from "@/lib/utils";

// Added beyond Design-System.md §5.2's literal list — Backend-Schema.md's
// boolean toggles (notifications_enabled, etc.) need a switch primitive.
// See DECISIONS.md review, 2026-09-20. Thumb is a fixed white, matching
// the near-universal switch convention (it sits on a colored track, not
// the page background, so it doesn't need theme-aware tokens).
function Switch({ className, ...props }: React.ComponentProps<typeof RadixSwitch.Root>) {
  return (
    <RadixSwitch.Root
      data-slot="switch"
      className={cn(
        "inline-flex h-5 w-9 shrink-0 items-center rounded-full bg-bg-surface-2 outline-none",
        "transition-colors duration-fast ease-out",
        "focus-visible:ring-2 focus-visible:ring-accent-subtle focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
        "data-[state=checked]:bg-accent",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadixSwitch.Thumb
        className={cn(
          "block size-4 translate-x-0.5 rounded-full bg-white shadow-sm",
          "transition-transform duration-fast ease-out data-[state=checked]:translate-x-4",
        )}
      />
    </RadixSwitch.Root>
  );
}

export { Switch };
