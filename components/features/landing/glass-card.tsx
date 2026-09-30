import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

// D-082: the marketing glass surface (Design-System.md §2.8). Marketing
// only -- the app keeps its elevation tokens.
function GlassCard({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("glass rounded-xl p-6", className)} {...props} />;
}

export { GlassCard };
