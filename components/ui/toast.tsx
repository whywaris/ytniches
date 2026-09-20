import * as React from "react";

import { Toast as RadixToast } from "radix-ui";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

import { cn } from "@/lib/utils";

// Design-System.md §5.9.
export type ToastVariant = "info" | "success" | "warning" | "error";

const ICONS: Record<ToastVariant, React.ComponentType<{ className?: string }>> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

const TONE_CLASSES: Record<ToastVariant, string> = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
};

export interface ToastProps {
  variant: ToastVariant;
  title: string;
  description?: string;
  duration: number;
  onOpenChange: (open: boolean) => void;
}

function Toast({ variant, title, description, duration, onOpenChange }: ToastProps) {
  const Icon = ICONS[variant];

  return (
    <RadixToast.Root
      duration={duration}
      onOpenChange={onOpenChange}
      className={cn(
        "elev-2 flex items-start gap-2 rounded-md p-3",
        "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-full data-[state=open]:duration-slow",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out data-[swipe=end]:animate-out",
      )}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", TONE_CLASSES[variant])} aria-hidden="true" />
      <div className="flex-1">
        <RadixToast.Title className="text-body-sm font-medium text-text-primary">
          {title}
        </RadixToast.Title>
        {description ? (
          <RadixToast.Description className="text-caption text-text-secondary">
            {description}
          </RadixToast.Description>
        ) : null}
      </div>
      <RadixToast.Close aria-label="Dismiss" className="text-text-tertiary hover:text-text-primary">
        <X className="size-4" />
      </RadixToast.Close>
    </RadixToast.Root>
  );
}

export { Toast };
