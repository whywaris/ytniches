import * as React from "react";

import { cn } from "@/lib/utils";
import { FormField, inputVariants } from "@/components/ui/form-field";

// Design-System.md §5.2. Char count only reflects a controlled `value`
// (string) — supporting it for uncontrolled inputs would need internal
// state duplication for a rarely-used modifier.
export interface TextInputProps extends Omit<React.ComponentProps<"input">, "prefix"> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  showCharCount?: boolean;
}

function TextInput({
  id,
  label,
  helperText,
  errorMessage,
  prefix,
  suffix,
  className,
  maxLength,
  showCharCount,
  value,
  required,
  ...props
}: TextInputProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  const invalid = Boolean(errorMessage);

  return (
    <FormField
      label={label}
      htmlFor={inputId}
      helperId={helperId}
      errorId={errorId}
      helperText={helperText}
      errorMessage={errorMessage}
      required={required}
      charCount={
        showCharCount && maxLength && typeof value === "string"
          ? { current: value.length, max: maxLength }
          : undefined
      }
    >
      <div className="relative flex items-center">
        {prefix ? (
          <span className="pointer-events-none absolute left-3 flex items-center text-text-tertiary [&_svg]:size-4">
            {prefix}
          </span>
        ) : null}
        <input
          id={inputId}
          data-slot="text-input"
          className={cn(inputVariants({ invalid }), prefix && "pl-9", suffix && "pr-9", className)}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : helperText ? helperId : undefined}
          required={required}
          maxLength={maxLength}
          value={value}
          {...props}
        />
        {suffix ? (
          <span className="absolute right-3 flex items-center text-text-tertiary [&_svg]:size-4">
            {suffix}
          </span>
        ) : null}
      </div>
    </FormField>
  );
}

export { TextInput };
