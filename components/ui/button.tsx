import * as React from "react";

import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

// Design-System.md §5.1. icon-left / icon-right modifiers are achieved
// by composition (place an icon before/after the label as children) —
// flex + gap handles ordering, no separate prop needed. icon-only uses
// the `iconOnly` variant below.
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-sm font-medium " +
    "transition-colors duration-fast ease-out outline-none whitespace-nowrap " +
    "focus-visible:ring-2 focus-visible:ring-accent-subtle focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base " +
    "disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-accent text-text-inverse hover:bg-accent-hover active:bg-accent-hover",
        secondary:
          "border border-border-default bg-bg-surface-1 text-text-primary hover:bg-bg-hover active:bg-bg-active",
        ghost: "bg-transparent text-text-primary hover:bg-bg-hover active:bg-bg-active",
        destructive: "bg-error/10 text-error hover:bg-error/20 active:bg-error/30",
        link: "h-auto bg-transparent p-0 text-accent underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-6 px-2 text-caption gap-1 [&_svg]:size-3",
        sm: "h-8 px-3 text-body-sm [&_svg]:size-3.5",
        md: "h-9 px-4 text-body [&_svg]:size-4",
        lg: "h-10 px-5 text-body-lg [&_svg]:size-4",
      },
      fullWidth: {
        true: "w-full",
      },
      iconOnly: {
        true: "aspect-square px-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

function Button({
  className,
  variant,
  size,
  fullWidth,
  iconOnly,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, fullWidth, iconOnly, className }))}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" aria-hidden="true" />
          {children}
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
