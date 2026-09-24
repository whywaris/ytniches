"use client";

import * as React from "react";

import { usePathname } from "next/navigation";

import { LogOut, Settings, Search as SearchIcon } from "lucide-react";

import { labelForPathname } from "@/components/features/shell/nav-config";
import { Avatar } from "@/components/ui/avatar";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/app/(app)/actions";

export interface AppTopBarProps {
  profileName: string | null;
  profileAvatarUrl: string | null;
  notificationBell: React.ReactNode;
  creditChip: React.ReactNode;
  onOpenCommandPalette: () => void;
}

function initialsFor(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

// UI-UX-Flow.md §4.2. Height 56px, spans the content area (not above the
// sidebar). notificationBell/creditChip arrive as pre-rendered nodes from
// layout.tsx (each its own Suspense boundary around an async Server
// Component) -- this stays a client component only for usePathname() and
// the dropdown's interactivity, without owning either data fetch itself.
function AppTopBar({
  profileName,
  profileAvatarUrl,
  notificationBell,
  creditChip,
  onOpenCommandPalette,
}: AppTopBarProps) {
  const pathname = usePathname();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-subtle bg-bg-surface-1 px-4">
      <h1 className="text-body font-medium text-text-primary">{labelForPathname(pathname)}</h1>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex h-8 items-center gap-2 rounded-sm border border-border-subtle px-2.5 text-body-sm text-text-tertiary hover:bg-bg-hover"
        >
          <SearchIcon className="size-3.5" aria-hidden="true" />
          <kbd className="text-caption">⌘K</kbd>
        </button>

        <React.Suspense fallback={<LoadingSkeleton className="size-8 rounded-sm" />}>
          {notificationBell}
        </React.Suspense>

        <React.Suspense fallback={<LoadingSkeleton className="h-8 w-24 rounded-sm" />}>
          {creditChip}
        </React.Suspense>

        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full" aria-label="Account menu">
            <Avatar
              size="sm"
              src={profileAvatarUrl ?? undefined}
              fallback={initialsFor(profileName)}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <a href="/settings/billing">
                <Settings /> Billing
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onSelect={() => void signOut()}>
              <LogOut /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export { AppTopBar };
