"use client";

import * as React from "react";

import { ChevronsLeft, ChevronsRight } from "lucide-react";

import { cn } from "@/lib/utils";

// Design-System.md §5.5. Collapsed 56px / expanded 240px, collapse
// preference persisted (TRD.md §2.3: "Persisted user prefs — localStorage
// via a small wrapper"). Routing is left to the consumer (SidebarItem
// supports asChild for next/link) — components/ui/ has no Next.js
// dependency.
const STORAGE_KEY = "ytniches:sidebar-collapsed";

interface SidebarContextValue {
  collapsed: boolean;
}

const SidebarContext = React.createContext<SidebarContextValue>({ collapsed: false });

function readStoredCollapsed(fallback: boolean) {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === null ? fallback : stored === "true";
  } catch {
    return fallback;
  }
}

export interface SidebarProps extends React.ComponentProps<"nav"> {
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

function Sidebar({
  defaultCollapsed = false,
  onCollapsedChange,
  className,
  children,
  ...props
}: SidebarProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  // Read the persisted value post-mount only: localStorage isn't
  // available during server rendering. Reading it in a lazy useState
  // initializer instead would read it during the client's first render
  // pass too, before hydration completes, producing a different value
  // than the server-rendered defaultCollapsed and triggering a hydration
  // mismatch. The one-render "flash of default state" this trades in is
  // the correct, deliberate cost — not something to optimize away.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from an external system (localStorage) post-mount, see above
    setCollapsed(readStoredCollapsed(defaultCollapsed));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount only
  }, []);

  function toggle() {
    setCollapsed((previous) => {
      const next = !previous;
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // Private browsing / disabled storage — degrade to session-only
        // state rather than throwing; persistence is a convenience.
      }
      onCollapsedChange?.(next);
      return next;
    });
  }

  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <nav
        data-slot="sidebar"
        className={cn(
          "flex h-full flex-col border-r border-border-subtle bg-bg-surface-1",
          "transition-[width] duration-default ease-out",
          collapsed ? "w-14" : "w-60",
          className,
        )}
        {...props}
      >
        <div className="flex-1 overflow-y-auto py-2">{children}</div>
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-10 shrink-0 items-center justify-center border-t border-border-subtle text-text-tertiary hover:text-text-primary"
        >
          {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
        </button>
      </nav>
    </SidebarContext.Provider>
  );
}

export interface SidebarSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

function SidebarSection({ title, children, className }: SidebarSectionProps) {
  const { collapsed } = React.useContext(SidebarContext);
  return (
    <div className={cn("mb-2", className)}>
      {title && !collapsed ? (
        <div className="px-3 pt-3 pb-1 text-[10px] font-semibold tracking-wide text-text-tertiary uppercase">
          {title}
        </div>
      ) : null}
      {children}
    </div>
  );
}

function useSidebar() {
  return React.useContext(SidebarContext);
}

export { Sidebar, SidebarSection, useSidebar };
