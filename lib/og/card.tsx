import { ImageResponse } from "next/og";

import {
  BRAND_ORANGE,
  LOCKUP_VIEWBOX,
  MARK,
  MARK_WHITE,
  WORDMARK_TEXT_D,
} from "@/components/features/brand/logo-paths";

// Shared 1200x630 social card: the default for every page, plus blog and
// help articles. ImageResponse can't read CSS variables, so these mirror
// globals.css :root (bg-base, text-primary, text-secondary, accent-text);
// tests/lib/og/card.test.ts keeps them equal.
export const OG_COLORS = {
  bgBase: "#0a0a0b",
  textPrimary: "#f5f5f7",
  textSecondary: "#a1a1a6",
  accent: "#ff5a2e",
} as const;

export const OG_SIZE = { width: 1200, height: 630 };

function LogoLockup({ height }: { height: number }) {
  return (
    <svg viewBox={LOCKUP_VIEWBOX} width={(height * 135) / 32} height={height}>
      <rect width="32" height="32" rx={MARK.tileRadius} fill={BRAND_ORANGE} />
      <path
        d={MARK.ringD}
        fill="none"
        stroke={MARK_WHITE}
        strokeWidth={MARK.ringWidth}
        strokeLinecap="round"
      />
      <circle cx={MARK.dot.cx} cy={MARK.dot.cy} r={MARK.dot.r} fill={MARK_WHITE} />
      <path d={WORDMARK_TEXT_D} fill={OG_COLORS.textPrimary} />
    </svg>
  );
}

export function ogCard({
  eyebrow,
  title,
  footer,
}: {
  eyebrow?: string;
  title: string;
  footer?: string;
}): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: OG_COLORS.bgBase,
        color: OG_COLORS.textPrimary,
      }}
    >
      <LogoLockup height={56} />
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {eyebrow ? (
          <div style={{ display: "flex", fontSize: 28, color: OG_COLORS.accent, fontWeight: 600 }}>
            {eyebrow}
          </div>
        ) : null}
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>
          {title}
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 28, color: OG_COLORS.textSecondary }}>
        {footer ?? "ytniches.com"}
      </div>
    </div>,
    OG_SIZE,
  );
}
