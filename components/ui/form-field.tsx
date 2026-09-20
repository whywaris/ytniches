import * as React from "react";

import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Shared shell for every input-family component (§5.2 states:
// default/focus/disabled/error). Height matches Button's md size (36px)
// for visual consistency between inputs and buttons in the same row.
export const inputVariants = cva(
  "h-9 w-full rounded-sm border bg-bg-surface-1 px-3 text-body text-text-primary outline-none " +
    "transition-colors duration-fast ease-out placeholder:text-text-tertiary " +
    "disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      invalid: {
        false: "border-border-default focus:border-accent focus:ring-2 focus:ring-accent-subtle",
        true: "border-error focus:border-error focus:ring-2 focus:ring-error/20",
      },
    },
    defaultVariants: {
      invalid: false,
    },
  },
);

// Design-System.md §5.2 modifiers: helper text, error message, char count.
// Shared layout used internally by every input-family component so the
// label/helper/error/char-count wiring (including aria-describedby) is
// done once, not per input type.
export interface FormFieldProps {
  label?: string;
  htmlFor: string;
  helperId: string;
  errorId: string;
  helperText?: string;
  errorMessage?: string;
  charCount?: { current: number; max: number };
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

function FormField({
  label,
  htmlFor,
  helperId,
  errorId,
  helperText,
  errorMessage,
  charCount,
  required,
  className,
  children,
}: FormFieldProps) {
  const hasError = Boolean(errorMessage);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <label htmlFor={htmlFor} className="text-body-sm font-medium text-text-primary">
          {label}
          {required ? (
            <span className="text-error" aria-hidden="true">
              {" "}
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {children}
      {hasError || helperText || charCount ? (
        <div className="flex items-start justify-between gap-2">
          {hasError ? (
            <p id={errorId} role="alert" className="text-caption text-error">
              {errorMessage}
            </p>
          ) : helperText ? (
            <p id={helperId} className="text-caption text-text-tertiary">
              {helperText}
            </p>
          ) : (
            <span />
          )}
          {charCount ? (
            <span className="shrink-0 text-caption text-text-tertiary">
              {charCount.current}/{charCount.max}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export { FormField };
