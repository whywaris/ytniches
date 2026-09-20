import * as React from "react";

import { Dialog as RadixDialog } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Design-System.md §5.7. Radix Dialog supplies the focus trap, Esc close,
// backdrop-click close, and role="dialog"/aria-modal/aria-labelledby
// wiring (DECISIONS.md D-023) — this just styles it to spec.
const modalContentVariants = cva(
  "elev-3 fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-full -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg outline-none " +
    "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=open]:duration-slow " +
    "data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 data-[state=closed]:duration-slow",
  {
    variants: {
      size: {
        sm: "max-w-[400px]",
        md: "max-w-[560px]",
        lg: "max-w-[800px]",
        xl: "max-w-[1120px]",
        full: "inset-0 top-0 left-0 h-full max-h-full max-w-full translate-x-0 translate-y-0 rounded-none",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface ModalProps extends VariantProps<typeof modalContentVariants> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

function Modal({ open, onOpenChange, title, description, children, footer, size }: ModalProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/60",
            "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:duration-slow",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:duration-slow",
          )}
        />
        {/* Radix's Dialog.Content sets role="dialog" + aria-labelledby/
            aria-describedby but not aria-modal (checked directly in
            node_modules — not documented behavior to rely on), so it's
            added explicitly here per the ARIA APG dialog pattern. */}
        <RadixDialog.Content aria-modal="true" className={cn(modalContentVariants({ size }))}>
          <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
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
            <div className="flex-1 overflow-y-auto px-6 py-4 text-body text-text-primary">
              {children}
            </div>
          ) : null}
          {footer ? (
            <div className="flex items-center justify-end gap-2 border-t border-border-subtle px-6 py-4">
              {footer}
            </div>
          ) : null}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

export { Modal };
