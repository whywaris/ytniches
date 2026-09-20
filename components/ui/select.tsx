import * as React from "react";

import { Select as RadixSelect } from "radix-ui";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { FormField, inputVariants } from "@/components/ui/form-field";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

function Select({
  label,
  helperText,
  errorMessage,
  required,
  placeholder = "Select...",
  options,
  value,
  defaultValue,
  onValueChange,
  disabled,
  className,
}: SelectProps) {
  const id = React.useId();
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;
  const invalid = Boolean(errorMessage);

  return (
    <FormField
      label={label}
      htmlFor={id}
      helperId={helperId}
      errorId={errorId}
      helperText={helperText}
      errorMessage={errorMessage}
      required={required}
      className={className}
    >
      <RadixSelect.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <RadixSelect.Trigger
          id={id}
          data-slot="select-trigger"
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : helperText ? helperId : undefined}
          className={cn(inputVariants({ invalid }), "flex items-center justify-between gap-2")}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <ChevronDown className="size-4 text-text-tertiary" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content
            className="elev-2 z-50 overflow-hidden rounded-md"
            position="popper"
            sideOffset={4}
          >
            <RadixSelect.Viewport className="p-1">
              {options.map((option) => (
                <RadixSelect.Item
                  key={option.value}
                  value={option.value}
                  className="relative flex h-9 cursor-pointer items-center rounded-sm px-3 pr-8 text-body text-text-primary outline-none select-none data-[highlighted]:bg-bg-hover"
                >
                  <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator className="absolute right-3 flex items-center">
                    <Check className="size-4 text-accent" />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </FormField>
  );
}

export { Select };
