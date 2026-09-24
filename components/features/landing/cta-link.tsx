"use client";

import Link from "next/link";

import { capture } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/ui/button";

// Interaction-Spec "Global CTA button hover": 2px lift + shadow on hover,
// back to base on press; touch gets a 0.98 tap-scale instead of a lift.
const LIFT =
  "transition-[transform,box-shadow,background-color] duration-fast ease-out " +
  "[@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:shadow-md " +
  "active:translate-y-0 [@media(hover:none)]:active:scale-[0.98] motion-reduce:hover:translate-y-0";

function CtaLink({
  href,
  event,
  eventProps,
  children,
  className,
  variant,
  size = "lg",
}: {
  href: string;
  event: string;
  eventProps?: Record<string, unknown>;
  children: React.ReactNode;
  className?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}) {
  return (
    <Button asChild variant={variant} size={size} className={cn(LIFT, className)}>
      <Link href={href} onClick={() => void capture(event, eventProps)}>
        {children}
      </Link>
    </Button>
  );
}

export { CtaLink, LIFT };
