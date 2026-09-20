import * as React from "react";

import { cn } from "@/lib/utils";
import { FormField, inputVariants } from "@/components/ui/form-field";

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  showCharCount?: boolean;
}

function Textarea({
  id,
  label,
  helperText,
  errorMessage,
  className,
  maxLength,
  showCharCount,
  value,
  required,
  rows = 4,
  ...props
}: TextareaProps) {
  const generatedId = React.useId();
  const textareaId = id ?? generatedId;
  const helperId = `${textareaId}-helper`;
  const errorId = `${textareaId}-error`;
  const invalid = Boolean(errorMessage);

  return (
    <FormField
      label={label}
      htmlFor={textareaId}
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
      <textarea
        id={textareaId}
        data-slot="textarea"
        rows={rows}
        className={cn(inputVariants({ invalid }), "h-auto resize-y py-2", className)}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? errorId : helperText ? helperId : undefined}
        required={required}
        maxLength={maxLength}
        value={value}
        {...props}
      />
    </FormField>
  );
}

export { Textarea };
