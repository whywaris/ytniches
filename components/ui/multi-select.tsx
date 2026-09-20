import * as React from "react";

import { Popover as RadixPopover } from "radix-ui";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { FormField, inputVariants } from "@/components/ui/form-field";
import { Checkbox } from "@/components/ui/checkbox";
import { Tag } from "@/components/ui/tag";

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
  placeholder?: string;
  options: MultiSelectOption[];
  value: string[];
  onValueChange: (value: string[]) => void;
  className?: string;
}

function MultiSelect({
  label,
  helperText,
  errorMessage,
  required,
  placeholder = "Select...",
  options,
  value,
  onValueChange,
  className,
}: MultiSelectProps) {
  const id = React.useId();
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;
  const invalid = Boolean(errorMessage);

  function toggle(optionValue: string) {
    onValueChange(
      value.includes(optionValue)
        ? value.filter((entry) => entry !== optionValue)
        : [...value, optionValue],
    );
  }

  const selected = options.filter((option) => value.includes(option.value));

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
      <RadixPopover.Root>
        <RadixPopover.Trigger
          id={id}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : helperText ? helperId : undefined}
          className={cn(
            inputVariants({ invalid }),
            "flex h-auto min-h-9 items-center justify-between gap-1 py-1.5",
          )}
        >
          <span className="flex flex-1 flex-wrap gap-1">
            {selected.length === 0 ? (
              <span className="text-text-tertiary">{placeholder}</span>
            ) : (
              selected.map((option) => (
                <Tag key={option.value} tone="neutral">
                  {option.label}
                </Tag>
              ))
            )}
          </span>
          <ChevronDown className="size-4 shrink-0 text-text-tertiary" />
        </RadixPopover.Trigger>
        <RadixPopover.Portal>
          <RadixPopover.Content
            align="start"
            sideOffset={4}
            className="elev-2 z-50 w-[var(--radix-popover-trigger-width)] rounded-md p-1"
          >
            {options.map((option) => {
              const checkboxId = `${id}-${option.value}`;
              const checked = value.includes(option.value);
              return (
                <label
                  key={option.value}
                  htmlFor={checkboxId}
                  className="flex h-9 cursor-pointer items-center gap-2 rounded-sm px-3 text-body text-text-primary hover:bg-bg-hover"
                >
                  <Checkbox
                    id={checkboxId}
                    checked={checked}
                    onCheckedChange={() => toggle(option.value)}
                  />
                  {option.label}
                </label>
              );
            })}
          </RadixPopover.Content>
        </RadixPopover.Portal>
      </RadixPopover.Root>
    </FormField>
  );
}

export { MultiSelect };
