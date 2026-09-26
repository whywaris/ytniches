"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Sidebar, SidebarSection, useSidebar } from "@/components/ui/sidebar";
import { SidebarItem } from "@/components/ui/sidebar-item";
import {
  DASHBOARD_NAV,
  HELP_NAV,
  NAV_GROUPS,
  activeNavHref,
  type NavItem,
} from "@/components/features/shell/nav-config";

export interface AppSidebarProps {
  hasWorkspace: boolean;
  trackedChannelCount: number;
  promptCount: number;
  onOpenSearch: () => void;
}

function NavLink({ item, active, count }: { item: NavItem; active: boolean; count?: number }) {
  const Icon = item.icon;
  return (
    <SidebarItem asChild icon={<Icon />} label={item.label} count={count} active={active}>
      <Link href={item.href}>{item.label}</Link>
    </SidebarItem>
  );
}

// Brand + search sit inside the Sidebar so they read its collapsed state:
// wordmark -> "Y" mark, search field -> icon-only button.
function SidebarHeader({ onOpenSearch }: { onOpenSearch: () => void }) {
  const { collapsed } = useSidebar();
  return (
    <div className="mb-3 px-3 pt-1">
      <Link
        href="/dashboard"
        aria-label="YTNiches home"
        className="flex h-9 items-center text-h4 font-semibold tracking-tight text-text-primary"
      >
        {collapsed ? (
          <span className="flex size-8 items-center justify-center rounded-sm bg-accent-subtle text-accent">
            Y
          </span>
        ) : (
          "YTNiches"
        )}
      </Link>
      <button
        type="button"
        onClick={onOpenSearch}
        aria-label="Search (Cmd+K)"
        className={cn(
          "mt-2 flex h-8 w-full items-center gap-2 rounded-sm border border-border-subtle bg-bg-base text-body-sm text-text-secondary outline-none",
          "transition-colors duration-fast hover:bg-bg-hover focus-visible:ring-2 focus-visible:ring-accent-subtle",
          collapsed ? "justify-center px-0" : "px-2.5",
        )}
      >
        <Search className="size-3.5 shrink-0" aria-hidden="true" />
        {collapsed ? null : (
          <>
            <span className="flex-1 text-left">Search</span>
            <kbd className="text-caption">⌘K</kbd>
          </>
        )}
      </button>
    </div>
  );
}

// UI-UX-Flow.md §4.1 as regrouped in the dashboard redesign: Dashboard,
// then Research / Create / Plan (Plan only with a workspace). Counts are
// badges on the page's own item, not duplicate "library" links.
function AppSidebar({
  hasWorkspace,
  trackedChannelCount,
  promptCount,
  onOpenSearch,
}: AppSidebarProps) {
  const pathname = usePathname();
  const groups = NAV_GROUPS.filter((group) => hasWorkspace || !group.workspaceOnly);
  const active = activeNavHref(pathname, [
    DASHBOARD_NAV,
    ...groups.flatMap((group) => group.items),
  ]);
  const counts = { trackedChannels: trackedChannelCount, prompts: promptCount };

  return (
    <Sidebar>
      <SidebarHeader onOpenSearch={onOpenSearch} />
      <SidebarSection>
        <NavLink item={DASHBOARD_NAV} active={active === DASHBOARD_NAV.href} />
      </SidebarSection>
      {groups.map((group) => (
        <SidebarSection key={group.title} title={group.title}>
          {group.items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={active === item.href}
              count={item.count ? counts[item.count] : undefined}
            />
          ))}
        </SidebarSection>
      ))}
      <SidebarSection>
        <NavLink item={HELP_NAV} active={false} />
      </SidebarSection>
    </Sidebar>
  );
}

export { AppSidebar };
