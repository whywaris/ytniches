import * as React from "react";

import { Tabs as RadixTabs } from "radix-ui";

import { cn } from "@/lib/utils";

// Added beyond Design-System.md §5's literal list, same as Switch (§5.2) —
// Competitor Tracking's add-channel modal and per-channel detail page both
// need tabbed navigation and no primitive existed. Radix supplies the
// roving-tabindex keyboard nav (arrow keys move focus, Home/End jump to
// first/last) and aria-selected/aria-controls wiring; this only styles it.
// See Design-System.md §5.12.
function Tabs({ className, ...props }: React.ComponentProps<typeof RadixTabs.Root>) {
  return (
    <RadixTabs.Root data-slot="tabs" className={cn("flex flex-col gap-3", className)} {...props} />
  );
}

function TabsList({ className, ...props }: React.ComponentProps<typeof RadixTabs.List>) {
  return (
    <RadixTabs.List
      data-slot="tabs-list"
      className={cn("inline-flex h-9 items-center gap-1 border-b border-border-subtle", className)}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof RadixTabs.Trigger>) {
  return (
    <RadixTabs.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-9 items-center px-3 text-body-sm font-medium text-text-secondary outline-none",
        "transition-colors duration-fast ease-out hover:text-text-primary",
        "focus-visible:ring-2 focus-visible:ring-accent-subtle focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[state=active]:text-text-primary",
        "after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-transparent after:content-['']",
        "data-[state=active]:after:bg-accent",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof RadixTabs.Content>) {
  return (
    <RadixTabs.Content
      data-slot="tabs-content"
      className={cn(
        "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-accent-subtle",
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
