import * as React from "react";

import { Checkbox as RadixCheckbox } from "radix-ui";
import { Check, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

// Added beyond Design-System.md §5.2's literal list — required by §5.4
// Tables ("row selection (checkboxes)"). See DECISIONS.md review,
// 2026-09-20.
function Checkbox({ className, ...props }: React.ComponentProps<typeof RadixCheckbox.Root>) {
  return (
    <RadixCheckbox.Root
      data-slot="checkbox"
      className={cn(
        "group peer size-4 shrink-0 rounded-xs border border-border-default bg-bg-surface-1 outline-none",
        "focus-visible:ring-2 focus-visible:ring-accent-subtle focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
        "data-[state=checked]:border-accent data-[state=checked]:bg-accent",
        "data-[state=indeterminate]:border-accent data-[state=indeterminate]:bg-accent",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadixCheckbox.Indicator className="flex items-center justify-center text-text-inverse">
        <Check className="hidden size-3 group-data-[state=checked]:block" />
        <Minus className="hidden size-3 group-data-[state=indeterminate]:block" />
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
}

export { Checkbox };
