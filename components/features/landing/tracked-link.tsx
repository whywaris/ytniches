"use client";

import Link from "next/link";

import { capture } from "@/lib/analytics/client";

// A plain next/link that fires a landing analytics event on click.
function TrackedLink({
  href,
  event,
  eventProps,
  className,
  children,
}: {
  href: string;
  event: string;
  eventProps?: Record<string, unknown>;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={className} onClick={() => void capture(event, eventProps)}>
      {children}
    </Link>
  );
}

export { TrackedLink };
