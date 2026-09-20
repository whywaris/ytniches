import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Design-System.md §5.3. Each variant fully specifies its own border
// class (rather than a shared base overridden per-variant) so there's
// no ambiguity about which border-color utility wins.
const cardVariants = cva("rounded-md bg-bg-surface-1", {
  variants: {
    variant: {
      base: "border border-border-subtle",
      interactive:
        "cursor-pointer border border-border-subtle transition-colors duration-fast ease-out hover:bg-bg-hover",
      selected: "border border-accent",
    },
    padding: {
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    },
  },
  defaultVariants: {
    variant: "base",
    padding: "md",
  },
});

export interface CardProps extends React.ComponentProps<"div">, VariantProps<typeof cardVariants> {}

function Card({ className, variant, padding, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, padding, className }))}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("mb-3 flex items-center justify-between", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("mt-3 flex items-center justify-between", className)}
      {...props}
    />
  );
}

function CardActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-actions" className={cn("flex items-center gap-2", className)} {...props} />
  );
}

export { Card, CardHeader, CardFooter, CardActions, cardVariants };
