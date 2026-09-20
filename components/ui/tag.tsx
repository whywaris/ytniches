import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Design-System.md §5.10. Rectangular chip for object-type labels,
// status, categories. Object-type tones map to §2.6.
const tagVariants = cva(
  "inline-flex h-5 shrink-0 items-center gap-1 rounded-xs px-1.5 text-caption font-medium",
  {
    variants: {
      tone: {
        neutral: "bg-bg-surface-2 text-text-secondary",
        success: "bg-success/12 text-success",
        warning: "bg-warning/12 text-warning",
        error: "bg-error/12 text-error",
        info: "bg-info/12 text-info",
        niches: "bg-object-niches/12 text-object-niches",
        channels: "bg-object-channels/12 text-object-channels",
        videos: "bg-object-videos/12 text-object-videos",
        prompts: "bg-object-prompts/12 text-object-prompts",
        calendar: "bg-object-calendar/12 text-object-calendar",
        tasks: "bg-object-tasks/12 text-object-tasks",
        outliers: "bg-object-outliers/12 text-object-outliers",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

export interface TagProps extends React.ComponentProps<"span">, VariantProps<typeof tagVariants> {}

function Tag({ className, tone, ...props }: TagProps) {
  return <span data-slot="tag" className={cn(tagVariants({ tone, className }))} {...props} />;
}

export { Tag, tagVariants };
