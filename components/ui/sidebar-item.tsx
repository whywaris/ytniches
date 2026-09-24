import * as React from "react";

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

// asChild deliberately doesn't route through Slot.Root: Slot.Root clones
// its own props onto a single child element, but doesn't let that child's
// *content* be replaced -- and every caller here wants real routing (a
// <Link>) while still getting the exact same icon/label/count/collapsed
// markup this component already builds, not a second copy of that markup
// duplicated at each call site. cloneElement covers both: the wrapper
// element (Link, or a plain <a>) receives this component's className/
// aria/data-slot, and its children become the constructed content below.
function SidebarItem({
  icon,
  label,
  count,
  active,
  nested,
  asChild = false,
  className,
  children,
  ...props
}: SidebarItemProps) {
  const { collapsed } = useSidebar();

  const sharedClassName = cn(
    "flex h-9 w-full items-center gap-2.5 border-l-2 border-transparent px-3 text-body-sm text-text-secondary",
    "transition-colors duration-fast ease-out outline-none",
    "hover:bg-bg-hover hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent-subtle",
    active && "border-accent bg-accent-subtle text-text-primary",
    nested && !collapsed && "pl-7",
    className,
  );

  const content = (
    <>
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
    </>
  );

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string }>;
    return React.cloneElement(child, {
      ...props,
      "data-slot": "sidebar-item",
      "aria-current": active ? "page" : undefined,
      "aria-label": collapsed ? label : undefined,
      className: cn(sharedClassName, child.props.className),
      children: content,
    } as React.ComponentProps<"a">);
  }

  return (
    <button
      type="button"
      data-slot="sidebar-item"
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
      className={sharedClassName}
      {...props}
    >
      {content}
    </button>
  );
}

export { SidebarItem };
