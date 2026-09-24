"use client";

import * as React from "react";

import { useRouter, usePathname } from "next/navigation";

import { Bookmark, Moon, Plus, Sparkles, Sun, UserPlus } from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { CommandPalette, type CommandPaletteGroup } from "@/components/ui/command-palette";
import { AppSidebar } from "@/components/features/shell/app-sidebar";
import { AppTopBar } from "@/components/features/shell/app-top-bar";
import { PRIMARY_NAV, TEAM_NAV, labelForPathname } from "@/components/features/shell/nav-config";
import { readRecentRoutes, recordRouteVisit } from "@/lib/client/recent-routes";

export interface AppShellProps {
  hasWorkspace: boolean;
  trackedChannelCount: number;
  promptCount: number;
  profileName: string | null;
  profileAvatarUrl: string | null;
  notificationBell: React.ReactNode;
  creditChip: React.ReactNode;
  children: React.ReactNode;
}

function AppShell({
  hasWorkspace,
  trackedChannelCount,
  promptCount,
  profileName,
  profileAvatarUrl,
  notificationBell,
  creditChip,
  children,
}: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [paletteOpen, setPaletteOpen] = React.useState(false);

  React.useEffect(() => {
    recordRouteVisit(pathname, labelForPathname(pathname));
  }, [pathname]);

  const navItems = hasWorkspace ? [...PRIMARY_NAV, ...TEAM_NAV] : PRIMARY_NAV;

  // UI-UX-Flow.md §4.3. "Recent" (D-049: localStorage, per-browser) reads
  // fresh at open time rather than being kept in state, since it only
  // needs to be current when the palette is actually opened.
  const groups: CommandPaletteGroup[] = [
    {
      heading: "Recent",
      items: readRecentRoutes()
        .filter((route) => route.path !== pathname)
        .map((route) => ({
          id: `recent-${route.path}`,
          label: route.label,
          onSelect: () => router.push(route.path),
        })),
    },
    {
      heading: "Navigation",
      items: navItems.map((item) => ({
        id: `nav-${item.href}`,
        label: item.label,
        icon: <item.icon />,
        onSelect: () => router.push(item.href),
      })),
    },
    {
      heading: "Actions",
      items: [
        {
          id: "action-new-search",
          label: "New search",
          icon: <Plus />,
          onSelect: () => router.push("/niches"),
        },
        {
          id: "action-save-channel",
          label: "Save channel by URL",
          icon: <Bookmark />,
          onSelect: () => router.push("/tracking"),
        },
        {
          id: "action-generate-prompt",
          label: "Generate prompt from URL",
          icon: <Sparkles />,
          onSelect: () => router.push("/prompts"),
        },
        ...(hasWorkspace
          ? [
              {
                id: "action-invite-teammate",
                label: "Invite teammate",
                icon: <UserPlus />,
                onSelect: () => router.push("/workspace"),
              },
            ]
          : []),
        {
          id: "action-toggle-theme",
          label: "Toggle theme",
          icon: theme === "dark" ? <Sun /> : <Moon />,
          onSelect: toggleTheme,
        },
      ],
    },
  ].filter((group) => group.items.length > 0);

  return (
    <div className="flex h-screen">
      <AppSidebar
        hasWorkspace={hasWorkspace}
        trackedChannelCount={trackedChannelCount}
        promptCount={promptCount}
        onOpenSearch={() => setPaletteOpen(true)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopBar
          profileName={profileName}
          profileAvatarUrl={profileAvatarUrl}
          notificationBell={notificationBell}
          creditChip={creditChip}
          onOpenCommandPalette={() => setPaletteOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1440px] px-6 pt-6 md:px-10">{children}</div>
        </main>
      </div>
      <CommandPalette groups={groups} open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}

export { AppShell };
