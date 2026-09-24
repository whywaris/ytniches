"use client";

import * as React from "react";

import { AnimatePresence, m } from "framer-motion";
import { Tabs as RadixTabs } from "radix-ui";

import { cn } from "@/lib/utils";

export interface SegmentOption {
  id: string;
  label: string;
}

// Landing-only (not a components/ui primitive -- D-037 follow-up call).
// Radix Tabs supplies roving tabindex + arrow-key selection + aria wiring
// (Interaction-Spec §3.2). The indicator slides via a CSS transform over
// equal-width segments (view_switcher_crossfade step 1, 200ms), and the
// panel cross-fades after a 50ms anchor delay (step 2, 300ms total).
function SegmentedTabs({
  options,
  value,
  onValueChange,
  label,
  className,
  children,
}: {
  options: SegmentOption[];
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  const index = Math.max(
    0,
    options.findIndex((option) => option.id === value),
  );

  return (
    <RadixTabs.Root value={value} onValueChange={onValueChange} className={className}>
      <RadixTabs.List
        aria-label={label}
        className={cn(
          "relative mx-auto grid w-fit rounded-full border border-border-default bg-bg-surface-1 p-1",
          options.length === 2 ? "grid-cols-2" : "grid-cols-4",
        )}
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-1 left-1 rounded-full bg-accent-subtle ring-1 ring-accent-border transition-transform duration-default ease-out motion-reduce:transition-none"
          style={{
            width: `calc((100% - 0.5rem) / ${options.length})`,
            transform: `translateX(${index * 100}%)`,
          }}
        />
        {options.map((option) => (
          <RadixTabs.Trigger
            key={option.id}
            value={option.id}
            className={cn(
              "relative z-10 rounded-full px-4 py-1.5 text-body-sm font-medium text-text-secondary outline-none",
              "transition-colors duration-fast hover:text-text-primary data-[state=active]:text-text-primary",
              "focus-visible:ring-2 focus-visible:ring-accent-subtle focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
            )}
          >
            {option.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      <RadixTabs.Content value={value} className="mt-8 outline-none" tabIndex={-1}>
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={value}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.15, delay: 0.05, ease: "easeInOut" } }}
            exit={{ opacity: 0, transition: { duration: 0.1, ease: "easeInOut" } }}
          >
            {children}
          </m.div>
        </AnimatePresence>
      </RadixTabs.Content>
    </RadixTabs.Root>
  );
}

export { SegmentedTabs };
