import * as React from "react";

import { Popover as RadixPopover } from "radix-ui";

import { cn } from "@/lib/utils";

// Design-System.md §5.14. Radix Popover supplies focus management, Esc and
// outside-click close, and aria-expanded/aria-controls on the trigger. Used
// for filter chips that hold a control (a range, a list), where a menu of
// actions (DropdownMenu) isn't the right semantics.
const Popover = RadixPopover.Root;
const PopoverTrigger = RadixPopover.Trigger;
const PopoverClose = RadixPopover.Close;

function PopoverContent({
  className,
  align = "start",
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof RadixPopover.Content>) {
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "elev-2 z-50 w-72 rounded-md border border-border-default bg-bg-surface-1 p-4 text-body-sm text-text-primary outline-none",
          "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95",
          className,
        )}
        {...props}
      />
    </RadixPopover.Portal>
  );
}

export { Popover, PopoverClose, PopoverContent, PopoverTrigger };
