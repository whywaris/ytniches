import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Tailwind overloads the `text-*` prefix for both font-size and text-color
// utilities. tailwind-merge's default heuristics don't recognize our custom
// Design-System.md tokens in either group, so `text-body` (size) and
// `text-text-inverse` (color) get treated as the same conflict group and
// one silently gets dropped. Registering both groups explicitly fixes this
// for every component, not just the one where it was first noticed.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-lg",
            "display-sm",
            "h1",
            "h2",
            "h3",
            "h4",
            "body-lg",
            "body",
            "body-sm",
            "caption",
            "code",
          ],
        },
      ],
      "text-color": [
        {
          text: [
            "text-primary",
            "text-secondary",
            "text-tertiary",
            "text-disabled",
            "text-inverse",
            "accent",
            "success",
            "warning",
            "error",
            "info",
            "object-niches",
            "object-channels",
            "object-videos",
            "object-prompts",
            "object-calendar",
            "object-tasks",
            "object-outliers",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// "1 prompt" / "3 prompts". Pass `plural` for irregular words.
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return count === 1 ? singular : plural;
}
