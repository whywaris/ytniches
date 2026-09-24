import * as React from "react";

import { DropdownMenu as RadixDropdownMenu } from "radix-ui";

import { cn } from "@/lib/utils";

// Design-System.md §4.3 elev-2 token ("Dropdowns, popovers"). No dedicated
// Design-System.md subsection existed for this primitive before the app
// shell's account menu needed one -- restyled directly from Radix per the
// same pattern as select.tsx/command-palette.tsx (D-023).
export type DropdownMenuProps = React.ComponentProps<typeof RadixDropdownMenu.Root>;

function DropdownMenu(props: DropdownMenuProps) {
  return <RadixDropdownMenu.Root {...props} />;
}

export type DropdownMenuTriggerProps = React.ComponentProps<typeof RadixDropdownMenu.Trigger>;

function DropdownMenuTrigger({ className, ...props }: DropdownMenuTriggerProps) {
  return (
    <RadixDropdownMenu.Trigger
      data-slot="dropdown-menu-trigger"
      className={cn("outline-none", className)}
      {...props}
    />
  );
}

export type DropdownMenuContentProps = React.ComponentProps<typeof RadixDropdownMenu.Content>;

function DropdownMenuContent({
  className,
  sideOffset = 4,
  align = "end",
  ...props
}: DropdownMenuContentProps) {
  return (
    <RadixDropdownMenu.Portal>
      <RadixDropdownMenu.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        align={align}
        className={cn(
          "elev-2 z-50 min-w-44 overflow-hidden rounded-md p-1",
          "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=open]:duration-fast",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 data-[state=closed]:duration-fast",
          className,
        )}
        {...props}
      />
    </RadixDropdownMenu.Portal>
  );
}

export interface DropdownMenuItemProps extends React.ComponentProps<typeof RadixDropdownMenu.Item> {
  destructive?: boolean;
  asChild?: boolean;
}

function DropdownMenuItem({ className, destructive, ...props }: DropdownMenuItemProps) {
  return (
    <RadixDropdownMenu.Item
      data-slot="dropdown-menu-item"
      className={cn(
        "flex h-9 cursor-pointer items-center gap-2.5 rounded-sm px-2.5 text-body-sm outline-none select-none",
        "data-[highlighted]:bg-bg-hover",
        destructive ? "text-error" : "text-text-primary",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof RadixDropdownMenu.Separator>) {
  return (
    <RadixDropdownMenu.Separator
      data-slot="dropdown-menu-separator"
      className={cn("my-1 h-px bg-border-subtle", className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
};
