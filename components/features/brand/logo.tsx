import { cn } from "@/lib/utils";
import {
  BRAND_ORANGE,
  LOCKUP_VIEWBOX,
  MARK,
  MARK_VIEWBOX,
  MARK_WHITE,
  WORDMARK_TEXT_D,
} from "@/components/features/brand/logo-paths";

function MarkShapes() {
  return (
    <>
      <rect width="32" height="32" rx={MARK.tileRadius} fill={BRAND_ORANGE} />
      <path
        d={MARK.ringD}
        fill="none"
        stroke={MARK_WHITE}
        strokeWidth={MARK.ringWidth}
        strokeLinecap="round"
      />
      <circle cx={MARK.dot.cx} cy={MARK.dot.cy} r={MARK.dot.r} fill={MARK_WHITE} />
    </>
  );
}

export interface LogoProps {
  /** "lockup" = tile + "YTNiches"; "mark" = tile only (collapsed sidebar). */
  variant?: "lockup" | "mark";
  /** Inside a link that already names the destination ("YTNiches home"). */
  decorative?: boolean;
  className?: string;
}

// The full-colour brand logo (D-068). Text follows the current text colour,
// so one component serves dark and light themes.
function Logo({ variant = "lockup", decorative = false, className }: LogoProps) {
  const a11y = decorative
    ? ({ "aria-hidden": true } as const)
    : ({ role: "img", "aria-label": "YTNiches" } as const);

  if (variant === "mark") {
    return (
      <svg viewBox={MARK_VIEWBOX} className={cn("size-8 shrink-0", className)} {...a11y}>
        <MarkShapes />
      </svg>
    );
  }

  return (
    <svg viewBox={LOCKUP_VIEWBOX} className={cn("h-8 w-auto shrink-0", className)} {...a11y}>
      <MarkShapes />
      <path d={WORDMARK_TEXT_D} fill="currentColor" />
    </svg>
  );
}

export { Logo };
