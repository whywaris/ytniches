import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Design-System.md §5.10. Small count indicator. "-subtle" background is
// achieved via Tailwind's native opacity modifier (e.g. bg-success/12)
// rather than pre-defining separate `-subtle` CSS custom properties for
// every semantic/object color.
const badgeVariants = cva(
  "inline-flex h-4 min-w-4 shrink-0 items-center justify-center px-1 text-caption font-medium leading-none",
  {
    variants: {
      tone: {
        neutral: "bg-bg-surface-2 text-text-secondary",
        accent: "bg-accent-subtle text-accent",
        success: "bg-success/12 text-success",
        warning: "bg-warning/12 text-warning",
        error: "bg-error/12 text-error",
        info: "bg-info/12 text-info",
      },
      shape: {
        circle: "rounded-full",
        rounded: "rounded-xs",
      },
    },
    defaultVariants: {
      tone: "neutral",
      shape: "circle",
    },
  },
);

export interface BadgeProps
  extends React.ComponentProps<"span">, VariantProps<typeof badgeVariants> {}

function Badge({ className, tone, shape, ...props }: BadgeProps) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ tone, shape, className }))} {...props} />
  );
}

export { Badge, badgeVariants };
