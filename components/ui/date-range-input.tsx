import * as React from "react";

import { cn } from "@/lib/utils";
import { FormField, inputVariants } from "@/components/ui/form-field";

// Design-System.md §5.2 "date-range" type. Native <input type="date"> x2
// gives correct locale formatting, keyboard entry, and a native picker
// for free — no reason to build a custom calendar widget the doc never
// asked for.
export interface DateRangeInputProps {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (value: string) => void;
  onEndDateChange?: (value: string) => void;
  startLabel?: string;
  endLabel?: string;
  className?: string;
}

function DateRangeInput({
  label,
  helperText,
  errorMessage,
  required,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startLabel = "From",
  endLabel = "To",
  className,
}: DateRangeInputProps) {
  const groupId = React.useId();
  const helperId = `${groupId}-helper`;
  const errorId = `${groupId}-error`;
  const invalid = Boolean(errorMessage);

  return (
    <FormField
      label={label}
      htmlFor={`${groupId}-start`}
      helperId={helperId}
      errorId={errorId}
      helperText={helperText}
      errorMessage={errorMessage}
      required={required}
      className={className}
    >
      <div
        role="group"
        aria-describedby={invalid ? errorId : helperText ? helperId : undefined}
        className="flex items-center gap-2"
      >
        <input
          id={`${groupId}-start`}
          type="date"
          aria-label={startLabel}
          value={startDate}
          onChange={(event) => onStartDateChange?.(event.target.value)}
          className={cn(inputVariants({ invalid }))}
        />
        <span className="text-text-tertiary" aria-hidden="true">
          –
        </span>
        <input
          id={`${groupId}-end`}
          type="date"
          aria-label={endLabel}
          value={endDate}
          onChange={(event) => onEndDateChange?.(event.target.value)}
          className={cn(inputVariants({ invalid }))}
        />
      </div>
    </FormField>
  );
}

export { DateRangeInput };
