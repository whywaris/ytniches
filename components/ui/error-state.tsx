import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Design-System.md §5.8. "Icon + friendly message + retry action."
export interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

function ErrorState({
  message = "Something went wrong loading this. Retry.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn("flex flex-col items-center gap-3 py-12 text-center", className)}
    >
      <AlertCircle className="size-10 text-error" aria-hidden="true" />
      <p className="text-body text-text-secondary">{message}</p>
      {onRetry ? (
        <Button size="sm" variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}

export { ErrorState };
