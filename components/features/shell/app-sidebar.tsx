"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Bookmark, BookOpen } from "lucide-react";

import { Sidebar, SidebarSection } from "@/components/ui/sidebar";
import { SidebarItem } from "@/components/ui/sidebar-item";
import { PRIMARY_NAV, TEAM_NAV, type NavItem } from "@/components/features/shell/nav-config";

export interface AppSidebarProps {
  hasWorkspace: boolean;
  trackedChannelCount: number;
  promptCount: number;
}

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, pathname, count }: { item: NavItem; pathname: string; count?: number }) {
  const Icon = item.icon;
  return (
    <SidebarItem
      asChild
      icon={<Icon />}
      label={item.label}
      count={count}
      active={isActive(pathname, item.href)}
    >
      <Link href={item.href}>{item.label}</Link>
    </SidebarItem>
  );
}

// UI-UX-Flow.md §4.1, reconciled with D-037's proposal: Team section only
// renders for a user with a workspace membership (no greyed items for
// non-Team users -- confirmed call). "Library" section title avoids
// colliding on-screen with the Team section's own "Workspace" nav item,
// which points at the real /workspace feature.
function AppSidebar({ hasWorkspace, trackedChannelCount, promptCount }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarSection>
        {PRIMARY_NAV.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </SidebarSection>

      {hasWorkspace ? (
        <>
          <div className="mx-3 my-1 h-px bg-border-subtle" />
          <SidebarSection title="Team">
            {TEAM_NAV.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} />
            ))}
          </SidebarSection>
        </>
      ) : null}

      <div className="mx-3 my-1 h-px bg-border-subtle" />
      <SidebarSection title="Library">
        <SidebarItem
          asChild
          icon={<Bookmark />}
          label="Saved channels"
          count={trackedChannelCount}
          active={isActive(pathname, "/tracking")}
        >
          <Link href="/tracking">Saved channels</Link>
        </SidebarItem>
        <SidebarItem
          asChild
          icon={<BookOpen />}
          label="Prompt library"
          count={promptCount}
          active={isActive(pathname, "/prompts")}
        >
          <Link href="/prompts">Prompt library</Link>
        </SidebarItem>
      </SidebarSection>
    </Sidebar>
  );
}

export { AppSidebar };
