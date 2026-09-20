import * as React from "react";

import { cn } from "@/lib/utils";

// Design-System.md §5.8 ("skeleton matching content shape, never spinners
// over data views") + §4.4 ("loading skeletons pulse at a 1500ms cycle").
// Tailwind's animate-pulse defaults to a 2s cycle; the inline style
// overrides just the duration (inline style always wins over a class's
// shorthand, regardless of what other longhands that shorthand sets).
function LoadingSkeleton({ className, style, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn("animate-pulse rounded-sm bg-bg-surface-2", className)}
      style={{ animationDuration: "1500ms", ...style }}
      {...props}
    />
  );
}

export { LoadingSkeleton };
