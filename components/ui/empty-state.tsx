import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Design-System.md §5.8. "Illustration/icon + one-line message + primary
// action."
export interface EmptyStateProps {
  icon?: React.ReactNode;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

function EmptyState({ icon, message, actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3 py-12 text-center", className)}>
      {icon ? <div className="text-text-tertiary [&_svg]:size-10">{icon}</div> : null}
      <p className="text-body text-text-secondary">{message}</p>
      {actionLabel && onAction ? (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export { EmptyState };
