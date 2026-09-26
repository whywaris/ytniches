"use client";

import Link from "next/link";

import { capture } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/ui/button";
import { LIFT } from "@/components/features/landing/lift";

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

export { CtaLink };
