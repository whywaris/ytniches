import * as React from "react";

import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/components/ui/sidebar";

// Design-System.md §5.5. Active: accent-subtle background + accent left
// border. Nested: 16px indent, only meaningful when expanded (collapsed
// mode shows icons only regardless of nesting).
export interface SidebarItemProps extends React.ComponentProps<"button"> {
  icon: React.ReactNode;
  label: string;
  count?: number;
  active?: boolean;
  nested?: boolean;
  asChild?: boolean;
}

function SidebarItem({
  icon,
  label,
  count,
  active,
  nested,
  asChild = false,
  className,
  ...props
}: SidebarItemProps) {
  const { collapsed } = useSidebar();
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="sidebar-item"
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
      className={cn(
        "flex h-9 w-full items-center gap-2.5 border-l-2 border-transparent px-3 text-body-sm text-text-secondary",
        "transition-colors duration-fast ease-out outline-none",
        "hover:bg-bg-hover hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent-subtle",
        active && "border-accent bg-accent-subtle text-text-primary",
        nested && !collapsed && "pl-7",
        className,
      )}
      {...props}
    >
      <span className="flex shrink-0 items-center [&_svg]:size-4" aria-hidden="true">
        {icon}
      </span>
      {!collapsed ? (
        <>
          <span className="flex-1 truncate text-left">{label}</span>
          {typeof count === "number" ? (
            <Badge tone={active ? "accent" : "neutral"}>{count}</Badge>
          ) : null}
        </>
      ) : null}
    </Comp>
  );
}

export { SidebarItem };
