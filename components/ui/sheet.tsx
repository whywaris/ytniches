"use client";

import * as React from "react";

import { Dialog as RadixDialog } from "radix-ui";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Design-System.md §5.16. A bottom sheet: the Modal primitive's dialog
// behaviour (focus trap, Esc, backdrop close, aria-modal) anchored to the
// bottom edge, for mobile surfaces like the Niche Finder filters. Footer
// stays pinned while the body scrolls.
export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

function Sheet({ open, onOpenChange, title, description, children, footer }: SheetProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/60",
            "data-[state=open]:animate-in data-[state=open]:fade-in",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out",
          )}
        />
        <RadixDialog.Content
          aria-modal="true"
          className={cn(
            "elev-3 fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-lg border-t border-border-default bg-bg-surface-1 outline-none",
            "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=open]:duration-slow",
            "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=closed]:duration-slow",
          )}
        >
          <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
            <div>
              <RadixDialog.Title className="text-h4 font-semibold text-text-primary">
                {title}
              </RadixDialog.Title>
              {description ? (
                <RadixDialog.Description className="text-body-sm text-text-secondary">
                  {description}
                </RadixDialog.Description>
              ) : null}
            </div>
            <RadixDialog.Close asChild>
              <Button variant="ghost" size="sm" iconOnly aria-label="Close">
                <X />
              </Button>
            </RadixDialog.Close>
          </div>
          {children ? (
            <div className="flex-1 overflow-y-auto px-4 py-4 text-body text-text-primary">
              {children}
            </div>
          ) : null}
          {footer ? <div className="border-t border-border-subtle px-4 py-3">{footer}</div> : null}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

export { Sheet };
