"use client";

import * as React from "react";

import { Tooltip as RadixTooltip } from "radix-ui";

import { cn } from "@/lib/utils";

// Design-System.md §5.15. Short explanatory text on hover AND keyboard
// focus (Radix wires aria-describedby). Never the only place important
// information lives: a tooltip explains, the trigger's own label names.
// The trigger must be focusable; wrap plain text in a <button type="button">.
// Brings its own Provider, so it works anywhere without app-level setup.
export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: "top" | "bottom" | "left" | "right";
}

function Tooltip({ content, children, side = "top" }: TooltipProps) {
  return (
    <RadixTooltip.Provider delayDuration={200}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            sideOffset={6}
            className={cn(
              "elev-2 z-50 max-w-64 rounded-sm border border-border-default bg-bg-surface-2 px-3 py-2 text-caption text-text-primary",
              "data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out",
            )}
          >
            {content}
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}

export { Tooltip };
