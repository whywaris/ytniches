import type { ReactNode, SVGProps } from "react";

import { cn } from "@/lib/utils";

// D-082 illustration system (concept A): glass tiles, a thin white
// outline, and one orange element per picture -- always "the signal".
// Colours are CSS variables only (no hex); no SVG filters, so they stay
// cheap to paint. Gradient ids are unique per illustration.

const glassTile = {
  fill: "var(--glass-bg-strong)",
  stroke: "var(--glass-border)",
  strokeWidth: 1,
} satisfies SVGProps<SVGRectElement>;

const faintBar = { fill: "var(--glass-highlight)" } satisfies SVGProps<SVGRectElement>;

function Glow({
  id,
  cx,
  cy,
  r,
  strong = false,
}: {
  id: string;
  cx: number;
  cy: number;
  r: number;
  strong?: boolean;
}) {
  return (
    <>
      <defs>
        <radialGradient id={id}>
          <stop
            offset="0%"
            style={{ stopColor: "var(--accent)", stopOpacity: strong ? 0.45 : 0.28 }}
          />
          <stop offset="100%" style={{ stopColor: "var(--accent)", stopOpacity: 0 }} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
    </>
  );
}

function Art({
  viewBox,
  label,
  className,
  children,
}: {
  viewBox: string;
  /** Alt text; omit for a decorative picture next to its own words. */
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox={viewBox}
      className={cn("h-auto w-full", className)}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      focusable="false"
      overflow="visible"
    >
      {label ? <title>{label}</title> : null}
      {children}
    </svg>
  );
}

// A channel card: avatar circle and two text bars.
function ChannelTile({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={14} {...glassTile} />
      <circle cx={x + 26} cy={y + 28} r={10} {...faintBar} />
      <rect x={x + 44} y={y + 20} width={w * 0.38} height={7} rx={3.5} {...faintBar} />
      <rect x={x + 44} y={y + 32} width={w * 0.24} height={6} rx={3} {...faintBar} opacity={0.6} />
    </g>
  );
}

export function HeroArt({ className }: { className?: string }) {
  return (
    <Art
      viewBox="0 0 560 420"
      label="Glass channel cards with an orange line rising across them to a glowing point"
      className={className}
    >
      <Glow id="hero-glow" cx={420} cy={120} r={200} strong />
      <ChannelTile x={40} y={200} w={250} h={150} />
      <ChannelTile x={150} y={120} w={260} h={160} />
      <ChannelTile x={270} y={40} w={250} h={150} />
      {/* Bars in the middle card: one upload far above the rest. */}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={176 + i * 22}
          y={240 - [18, 24, 16, 22, 20][i]!}
          width={12}
          height={[18, 24, 16, 22, 20][i]}
          rx={3}
          {...faintBar}
        />
      ))}
      <path
        d="M70 330 C 150 320, 190 290, 250 270 S 360 200, 420 150 S 480 96, 500 84"
        fill="none"
        stroke="var(--accent)"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <circle cx={500} cy={84} r={16} style={{ fill: "var(--glow-accent)" }} />
      <circle cx={500} cy={84} r={7} fill="var(--accent)" />
    </Art>
  );
}

export function FindArt() {
  const cells = Array.from({ length: 12 }, (_, i) => ({ col: i % 4, row: Math.floor(i / 4) }));
  return (
    <Art viewBox="0 0 240 170">
      <Glow id="find-glow" cx={148} cy={82} r={70} />
      {cells.map(({ col, row }) => (
        <rect
          key={`${col}-${row}`}
          x={24 + col * 50}
          y={20 + row * 46}
          width={40}
          height={36}
          rx={8}
          {...glassTile}
        />
      ))}
      <rect
        x={122}
        y={64}
        width={48}
        height={44}
        rx={10}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2.5}
      />
      <circle cx={170} cy={64} r={5} fill="var(--accent)" />
    </Art>
  );
}

export function UnderstandArt() {
  const heights = [44, 52, 38, 48, 118, 46];
  return (
    <Art viewBox="0 0 240 170">
      <Glow id="understand-glow" cx={156} cy={50} r={70} />
      <line
        x1={20}
        y1={96}
        x2={222}
        y2={96}
        stroke="var(--glass-highlight)"
        strokeWidth={1.5}
        strokeDasharray="5 5"
      />
      {heights.map((h, i) => (
        <rect
          key={i}
          x={28 + i * 32}
          y={150 - h}
          width={22}
          height={h}
          rx={5}
          {...(i === 4 ? { fill: "var(--accent)" } : glassTile)}
        />
      ))}
      <path
        d="M156 20 L167 8 L178 20"
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Art>
  );
}

export function PlanArt() {
  const marked = new Set([3, 9, 16, 22]);
  return (
    <Art viewBox="0 0 240 170">
      <Glow id="plan-glow" cx={120} cy={100} r={80} />
      <rect x={24} y={16} width={192} height={18} rx={6} {...glassTile} />
      {Array.from({ length: 28 }, (_, i) => {
        const x = 24 + (i % 7) * 28;
        const y = 44 + Math.floor(i / 7) * 28;
        const isNext = i === 16;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={22}
            height={22}
            rx={5}
            {...(isNext
              ? { fill: "var(--accent)" }
              : marked.has(i)
                ? { fill: "var(--accent-subtle)", stroke: "var(--accent-border)" }
                : glassTile)}
          />
        );
      })}
    </Art>
  );
}

export function NicheStepArt() {
  return (
    <Art viewBox="0 0 240 120">
      <Glow id="niche-glow" cx={120} cy={60} r={60} />
      {[
        { x: 16, w: 64 },
        { x: 88, w: 72 },
        { x: 168, w: 56 },
      ].map(({ x, w }, i) =>
        i === 1 ? (
          <g key={i}>
            <rect
              x={x}
              y={44}
              width={w}
              height={32}
              rx={16}
              fill="var(--accent-subtle)"
              stroke="var(--accent)"
              strokeWidth={2}
            />
            <circle cx={x + 18} cy={60} r={5} fill="var(--accent)" />
            <rect x={x + 30} y={57} width={w - 44} height={6} rx={3} {...faintBar} />
          </g>
        ) : (
          <g key={i}>
            <rect x={x} y={44} width={w} height={32} rx={16} {...glassTile} />
            <rect x={x + 16} y={57} width={w - 32} height={6} rx={3} {...faintBar} />
          </g>
        ),
      )}
    </Art>
  );
}

export function TrackStepArt() {
  return (
    <Art viewBox="0 0 240 120">
      <Glow id="track-glow" cx={176} cy={34} r={56} />
      <ChannelTile x={16} y={30} w={100} h={62} />
      <ChannelTile x={124} y={30} w={100} h={62} />
      <circle cx={210} cy={30} r={9} fill="var(--accent)" />
      <path
        d="M206 30 L209 33 L215 27"
        fill="none"
        stroke="var(--text-inverse)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Art>
  );
}

export function CalendarStepArt() {
  return (
    <Art viewBox="0 0 240 120">
      <Glow id="calendar-glow" cx={196} cy={60} r={56} />
      <line x1={24} y1={60} x2={216} y2={60} stroke="var(--glass-border)" strokeWidth={2} />
      {[40, 104, 168].map((x) => (
        <rect key={x} x={x - 20} y={30} width={40} height={20} rx={6} {...glassTile} />
      ))}
      {[40, 104].map((x) => (
        <circle key={x} cx={x} cy={60} r={6} {...glassTile} />
      ))}
      <circle cx={200} cy={60} r={9} fill="var(--accent)" />
    </Art>
  );
}
