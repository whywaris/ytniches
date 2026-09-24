import Link from "next/link";

import { cn } from "@/lib/utils";
import type { NavLinkItem } from "@/components/features/landing/content";

function SoonTag() {
  return (
    <span className="rounded-xs bg-bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-text-secondary uppercase">
      Soon
    </span>
  );
}

// href: null means the page isn't built -- plain text + "Soon", never a 404.
function SoonLink({
  item,
  className,
  onClick,
}: {
  item: NavLinkItem;
  className?: string;
  onClick?: () => void;
}) {
  if (item.href === null) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-text-secondary", className)}>
        {item.label}
        <SoonTag />
      </span>
    );
  }
  return (
    <Link href={item.href} onClick={onClick} className={cn("hover:text-text-primary", className)}>
      {item.label}
    </Link>
  );
}

export { SoonLink, SoonTag };
