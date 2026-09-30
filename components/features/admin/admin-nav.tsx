"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/revenue", label: "Revenue" },
  { href: "/admin/api-quotas", label: "API Quotas" },
  { href: "/admin/discovery", label: "Discovery" },
];

// UI-UX-Flow.md §8.2 sub-nav, trimmed to the modules built (D-052 defers
// Blog CMS, Tools, Automation, module 6).
function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto">
      {ADMIN_NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-sm px-3 py-1.5 text-body-sm whitespace-nowrap text-text-secondary hover:bg-bg-hover hover:text-text-primary",
              active && "bg-bg-active text-text-primary",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export { AdminNav };
