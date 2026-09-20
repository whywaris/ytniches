"use client";

import * as React from "react";

import { Command } from "cmdk";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

// Design-System.md §5.6. Keyboard nav (arrow keys/Enter), fuzzy search,
// and Esc/focus-trap are all native cmdk + Radix Dialog behavior
// (DECISIONS.md D-023) — nothing custom to implement for those. The only
// thing this component owns is the global Cmd/Ctrl+K listener and
// styling.
export interface CommandPaletteItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  keywords?: string[];
  onSelect: () => void;
}

export interface CommandPaletteGroup {
  heading: string;
  items: CommandPaletteItem[];
}

export interface CommandPaletteProps {
  groups: CommandPaletteGroup[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
}

function CommandPalette({
  groups,
  open: openProp,
  onOpenChange,
  placeholder = "Type to search or navigate…",
}: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = openProp ?? internalOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      setInternalOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(!open);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      shouldFilter
      overlayClassName={cn(
        "fixed inset-0 z-50 bg-black/60",
        "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:duration-slow",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:duration-slow",
      )}
      contentClassName={cn(
        "elev-3 fixed top-1/4 left-1/2 z-50 w-full max-w-[560px] -translate-x-1/2 overflow-hidden rounded-lg",
        "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=open]:duration-slow",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 data-[state=closed]:duration-slow",
      )}
    >
      <div className="flex items-center gap-2 border-b border-border-subtle px-4">
        <Search className="size-4 shrink-0 text-text-tertiary" aria-hidden="true" />
        <Command.Input
          placeholder={placeholder}
          className="h-12 w-full bg-transparent text-body text-text-primary outline-none placeholder:text-text-tertiary"
        />
      </div>
      <Command.List className="max-h-80 overflow-y-auto p-2">
        <Command.Empty className="py-8 text-center text-body-sm text-text-tertiary">
          {placeholder}
        </Command.Empty>
        {groups.map((group) => (
          <Command.Group
            key={group.heading}
            heading={group.heading}
            className={cn(
              "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px]",
              "[&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-text-tertiary [&_[cmdk-group-heading]]:uppercase",
            )}
          >
            {group.items.map((item) => (
              <Command.Item
                key={item.id}
                value={item.label}
                keywords={item.keywords}
                onSelect={() => {
                  item.onSelect();
                  setOpen(false);
                }}
                className={cn(
                  "flex h-9 cursor-pointer items-center gap-2.5 rounded-sm px-2 text-body-sm text-text-primary",
                  "data-[selected=true]:bg-bg-hover",
                )}
              >
                {item.icon ? (
                  <span className="flex shrink-0 items-center [&_svg]:size-4" aria-hidden="true">
                    {item.icon}
                  </span>
                ) : null}
                <span className="flex-1 truncate">{item.label}</span>
                {item.shortcut ? (
                  <kbd className="text-caption text-text-tertiary">{item.shortcut}</kbd>
                ) : null}
              </Command.Item>
            ))}
          </Command.Group>
        ))}
      </Command.List>
    </Command.Dialog>
  );
}

export { CommandPalette };
