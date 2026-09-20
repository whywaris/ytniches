# YTNiches — Design System

2026-09-19 · @Someone

---

## 1. Design Philosophy

YTNiches' interface is built on a 4-layer inspiration stack, with a personality overlay from Fibery. Every design decision falls out of these five references.

**The stack:**

| Layer               | Reference       | What it governs                                                             |
| ------------------- | --------------- | --------------------------------------------------------------------------- |
| Overall shell       | Linear          | Sidebar, navigation, command palette, settings, keyboard-first speed        |
| Research pages      | Ahrefs          | Filters, data tables, metric cards, drill-down flow                         |
| Relational objects  | Attio           | Card-based views, custom views (grid / list / kanban), colored object types |
| Calendar            | Notion Calendar | Drag-and-drop scheduling, color-coded events, smooth animations             |
| Personality overlay | Fibery          | Warm copy, illustrated empty states, playful microcopy                      |

**Core principles:**

1. **Dark mode is the primary experience.** Light mode is supported, not the reverse. Every component is designed dark-first, then adapted.
2. **Speed is a feature.** No skeleton screens longer than 400ms; command palette (Cmd+K) is available on every page.
3. **Warmth in copy, precision in data.** Empty states, tooltips, and CTAs can be playful; data displays are neutral and functional.
4. **One accent color, everything else grayscale.** No secondary brand colors. Object types get muted category colors (Attio pattern), not brand-color status.
5. **Icons are functional, not decorative.** Lucide only. No emoji as UI elements (except explicit user-authored content).
6. **Density is user-controlled where it matters.** Tables offer compact/comfortable density toggle; the rest is fixed to what's optimal.

## 2. Color System

Dark mode is the default and reference. Light mode tokens follow at the end.

### 2.1 Dark mode — background scale

Deepest to highest surface. Elevation is signalled by lightening, not shadow.

| Token          | Hex     | Use                           |
| -------------- | ------- | ----------------------------- |
| `bg-base`      | #0a0a0b | App background, deepest layer |
| `bg-surface-1` | #131315 | Cards, panels, table rows     |
| `bg-surface-2` | #1c1c1f | Modals, dropdowns, popovers   |
| `bg-hover`     | #232326 | Interactive hover overlay     |
| `bg-active`    | #2a2a2d | Active / pressed states       |

### 2.2 Dark mode — text

| Token            | Hex     | Use                              |
| ---------------- | ------- | -------------------------------- |
| `text-primary`   | #f5f5f7 | Headings, primary content        |
| `text-secondary` | #a1a1a6 | Body text, labels                |
| `text-tertiary`  | #6e6e73 | Supporting info, timestamps      |
| `text-disabled`  | #48484a | Disabled controls                |
| `text-inverse`   | #0a0a0b | Text on accent-color backgrounds |

> Note: text-tertiary (#6e6e73 light) clears AA against bg-base (#ffffff, ~4.6:1) but fails against bg-surface-1 (#f7f7f8, ~3.65:1). Use text-secondary on surface-1 backgrounds for body/label text. text-tertiary is safe for timestamps and supporting info on bg-base only.

### 2.3 Dark mode — borders

| Token            | Hex     | Use                           |
| ---------------- | ------- | ----------------------------- |
| `border-subtle`  | #232326 | Barely-visible dividers       |
| `border-default` | #38383a | Standard borders              |
| `border-strong`  | #48484a | Emphasis borders, focus rings |

### 2.4 Accent color

Single accent, used sparingly. **Recommendation:** Emerald.

| Token           | Value                    | Use                                      |
| --------------- | ------------------------ | ---------------------------------------- |
| `accent`        | #10b981                  | Primary buttons, active nav items, links |
| `accent-hover`  | #059669                  | Hover state                              |
| `accent-subtle` | rgba(16, 185, 129, 0.12) | Tag backgrounds, subtle emphasis         |
| `accent-border` | rgba(16, 185, 129, 0.35) | Borders of accent-tinted surfaces        |

> **Open decision:** Emerald is a recommendation because YouTube tools rarely use green (differentiation), it signals growth/monetization, and works well in dark mode. Alternatives: violet (Linear-esque), cyan (research-tool signal). Mac to confirm or override.

### 2.5 Semantic colors

| Token     | Hex     | Use                              |
| --------- | ------- | -------------------------------- |
| `success` | #4ade80 | Success states, positive metrics |
| `warning` | #fbbf24 | Warnings, degraded states        |
| `error`   | #f87171 | Errors, destructive actions      |
| `info`    | #60a5fa | Informational states, tooltips   |

### 2.6 Object type colors (Attio pattern)

Muted, distinguishable colors per object type. Used for icons, category badges, calendar events — never as full backgrounds.

| Object          | Color                    | Hex     |
| --------------- | ------------------------ | ------- |
| Niches          | Emerald (matches accent) | #10b981 |
| Channels        | Blue                     | #3b82f6 |
| Videos          | Violet                   | #8b5cf6 |
| Prompts         | Amber                    | #f59e0b |
| Calendar events | Teal                     | #14b8a6 |
| Tasks           | Rose                     | #f43f5e |
| Outliers        | Orange                   | #fb923c |

### 2.7 Light mode (alternative theme)

Complete mapping of every dark token to a light equivalent — same semantics, inverted brightness. `bg-base` → #ffffff, `text-primary` → #0a0a0b, `text-secondary` → #3c3c43, `border-default` → #d1d1d6, and so on. Full mapping ships as part of the Tailwind config.

## 3. Typography & Iconography

### 3.1 Font families

| Role                          | Family           | Fallback                |
| ----------------------------- | ---------------- | ----------------------- |
| UI (default)                  | Inter            | system-ui, sans-serif   |
| Display (marketing hero only) | Instrument Serif | Georgia, serif          |
| Monospace (code, IDs)         | JetBrains Mono   | ui-monospace, monospace |

Inter serves the app; Instrument Serif adds Fibery-style personality on the landing page only (never in-app).

### 3.2 Type scale

All values in `size / line-height` (px). Tailwind-aligned.

| Token        | Size / LH | Weight | Use                     |
| ------------ | --------- | ------ | ----------------------- |
| `display-lg` | 60 / 72   | 700    | Marketing hero          |
| `display-sm` | 48 / 56   | 700    | Landing section headers |
| `h1`         | 36 / 44   | 600    | Page titles             |
| `h2`         | 30 / 38   | 600    | Section headers         |
| `h3`         | 24 / 32   | 600    | Card titles             |
| `h4`         | 20 / 28   | 600    | Subsection headers      |
| `body-lg`    | 16 / 24   | 400    | Prominent body          |
| `body`       | 14 / 20   | 400    | Default UI text         |
| `body-sm`    | 13 / 18   | 400    | Secondary info          |
| `caption`    | 12 / 16   | 500    | Timestamps, labels      |
| `code`       | 13 / 20   | 400    | Mono for IDs, code      |

### 3.3 Font weights

- 400 Regular — body text
- 500 Medium — UI defaults, table content
- 600 Semibold — buttons, emphasis, small headings
- 700 Bold — page titles, display

### 3.4 Iconography

- **Library:** Lucide (React) — exclusive. No other icon library, ever.
- **Sizes:** 14, 16, 20, 24, 32 (px)
- **Stroke width:** 1.5–2 (Lucide default is 2)
- **Never mix icon libraries.** Emoji is never used as a UI element (allowed inside user-authored content).
- **Custom icons:** if a needed icon isn't in Lucide, draw it in the same visual style (2px stroke, rounded caps, consistent optical weight) rather than importing from another set.

## 4. Spacing, Shape & Motion

### 4.1 Spacing scale

Tailwind's default scale (4px base): `0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32` (multiply by 4 for px).

Common patterns:

- Component internal padding: `2` (8px) small, `3` (12px) medium, `4` (16px) large
- Section gaps: `6` (24px) related, `10` (40px) unrelated, `16` (64px) major sections
- Page margins: `6` (24px) mobile, `10` (40px) tablet, auto-centered on desktop (max-width 1440px)

### 4.2 Border radius

| Token         | Value  | Use                                     |
| ------------- | ------ | --------------------------------------- |
| `radius-xs`   | 4px    | Chips, tags, badges                     |
| `radius-sm`   | 6px    | Buttons, inputs, small cards            |
| `radius-md`   | 8px    | Cards                                   |
| `radius-lg`   | 12px   | Modals, elevated panels                 |
| `radius-xl`   | 16px   | Major surfaces (landing feature blocks) |
| `radius-full` | 9999px | Avatars, pills                          |

### 4.3 Elevation

Dark mode shadows are subtle. Rely on background lightening + border, not drop shadows alone.

| Token    | Style                                                                  | Use                     |
| -------- | ---------------------------------------------------------------------- | ----------------------- |
| `elev-0` | none                                                                   | Base surfaces           |
| `elev-1` | `border-subtle` + `bg-surface-1`                                       | Cards, table rows       |
| `elev-2` | `border-default` + `bg-surface-2` + `shadow-md`                        | Dropdowns, popovers     |
| `elev-3` | `border-default` + `bg-surface-2` + `shadow-xl` + top border highlight | Modals, command palette |

- `shadow-md`: `0 4px 12px rgba(0, 0, 0, 0.3)`
- `shadow-xl`: `0 20px 40px rgba(0, 0, 0, 0.5)`

### 4.4 Motion

| Token            | Duration | Easing      | Use                                |
| ---------------- | -------- | ----------- | ---------------------------------- |
| `motion-micro`   | 100ms    | ease-out    | Button press, checkbox tick        |
| `motion-fast`    | 150ms    | ease-out    | Hover, focus rings                 |
| `motion-default` | 200ms    | ease-out    | Standard transitions               |
| `motion-slow`    | 300ms    | ease-in-out | Modals, panels, larger transitions |
| `motion-page`    | 400ms    | ease-in-out | Page transitions (max)             |

- Respect `prefers-reduced-motion` — reduce to 50ms with linear easing
- Never animate more than 3 properties simultaneously
- Loading skeletons pulse at a 1500ms cycle

## 5. Component Library

Every component below has: variants, states (default / hover / focus / active / disabled / loading), and dark + light adaptations. Component implementation goes into a Storybook (see Implementation-Plan.md).

---

### 5.1 Buttons

- **Variants:** primary, secondary, ghost, destructive, link
- **Sizes:** xs (24h), sm (32h), md (36h — default), lg (40h)
- **Modifiers:** icon-left, icon-right, icon-only, full-width, loading

Primary uses `accent` background. Secondary uses `bg-surface-1` + `border-default`. Ghost is transparent with hover-only background. Destructive uses `error` semantic color.

---

### 5.2 Inputs

- **Types:** text, textarea, select, multi-select, search, date-range, number
- **States:** default, focus (accent border + subtle glow), disabled, error (error border + helper text)
- **Modifiers:** prefix icon, suffix icon/button, helper text, error message, char count

---

### 5.3 Cards

- **Variants:** base, interactive (hover state), selected (accent border)
- **Padding options:** sm (12), md (16 — default), lg (24)
- **Optional slots:** header, footer, actions

---

### 5.4 Tables

Critical for research pages. Follows Ahrefs pattern.

**Features:**

- Sortable columns (click header)
- Sticky first column (channel name in Niche Finder)
- Row hover (`bg-hover`)
- Row selection (checkboxes, bulk actions bar)
- Density toggle (compact / comfortable)
- Column visibility control
- Pagination or infinite scroll (per view)
- Empty state, loading state (skeleton rows), error state

---

### 5.5 Sidebar (Linear-style)

- Collapsed (56px) / expanded (240px) states
- Persists collapse preference per user
- Sections with uppercase headers (10px, tertiary color)
- Items: icon + label + optional count badge
- Active item: `accent-subtle` background + `accent` left border (2px)
- Nested items indent 16px, hidden when parent collapsed

---

### 5.6 Command palette (Cmd+K)

- Modal overlay, opens on Cmd/Ctrl+K from anywhere
- Groups: Recent, Navigation, Actions, Search
- Keyboard-only navigation (arrow keys, Enter, Esc)
- Fuzzy search
- Empty state: "Type to search or navigate…"

---

### 5.7 Modals

- **Sizes:** sm (400w), md (560w — default), lg (800w), xl (1120w), full-screen (mobile-first)
- **Structure:** header (title + close), body (scrollable), footer (actions right-aligned)
- **Confirmation dialog:** small, centered, primary action + cancel

---

### 5.8 Empty, loading, error states

Every data view must spec all three. Templates:

- **Empty:** illustration/icon + one-line message + primary action. Example: "You haven't saved any channels yet. Try Niche Finder to discover some."
- **Loading:** skeleton matching content shape. Never spinners over data views.
- **Error:** icon + friendly message + retry action. Example: "Something went wrong loading this. Retry."

---

### 5.9 Toasts & notifications

- **Position:** bottom-right (desktop), top (mobile)
- **Variants:** info, success, warning, error
- **Auto-dismiss:** 5s default, 8s for warning, sticky for error
- **Stack:** max 3 visible, older toasts fade

---

### 5.10 Badges & tags

- **Badge:** small count indicator, circle or rounded rectangle, single character or number
- **Tag:** rectangular chip with `radius-xs`, used for object-type labels, status, categories
- **Color:** semantic (success/warning/error) or object-type color, always `-subtle` background variant

---

### 5.11 Avatars

- **Sizes:** xs (20), sm (24), md (32 — default), lg (40), xl (56)
- **Fallback:** initials on `bg-surface-2` when no image
- **Group:** overlapping stack with count badge ("+3")

## 6. Data Visualization & Accessibility

### 6.1 Data visualization

Charts appear on: Niche Finder metric cards, Competitor Tracking activity graphs, Outlier Finder trend lines, Admin dashboards.

**Chart types allowed:** line, bar, sparkline (in tables), area (rare) **Chart types avoided:** pie (unless 2–3 segments max), radar, 3D anything, donut with more than 4 slices

**Colors:**

- Single series: `accent` (emerald)
- Comparison of 2–3: `accent` + object type colors (channels blue, videos violet)
- Trend: `accent` for the line, `success` / `error` semantic dots for anomalies

**Rules:**

- Every chart has: title, axis labels, unit indicators, legend (only if more than 1 series)
- Empty state: "No data yet" + icon (never a blank canvas)
- Loading: skeleton in the chart's shape (not a spinner over the chart)
- Tooltip on hover shows exact values
- Sparklines in table rows are unlabeled but tooltip on hover reveals values

**Library:** Recharts (Tailwind-compatible, React-native, works with server components).

---

### 6.2 Accessibility

**Baseline:** WCAG 2.1 AA compliance.

**Contrast (verified against a WCAG contrast checker):**

- Body text on `bg-base`: 4.5:1 minimum (current `text-primary` on `bg-base` ≈ 15:1 ✓)
- Large text and UI elements: 3:1 minimum
- Accent buttons: `accent` background with `text-inverse` meets AA
- Focus rings always visible; never `outline: none` without a replacement ring

**Keyboard:**

- Every interactive element is Tab-focusable
- Focus visible via ring (2px `accent-subtle` offset)
- Command palette (Cmd+K) available on every page
- Modal traps focus while open; Esc closes

**Screen reader:**

- Every icon-only button has `aria-label`
- Data tables use `<th scope>` and `<caption>` where applicable
- Live regions for notifications
- Skip-to-content link on every page

**Motion:**

- `prefers-reduced-motion` respected across all animations
- No auto-playing video without user opt-in

---

### 6.3 Developer handoff

> Note: Tailwind v4 is installed. Design tokens live in app/globals.css as @theme blocks, not tailwind.config.ts. Update this section before §2.4 work starts.

- Tailwind config generated from this spec: `tailwind.config.ts` in repo, tokens exported
- Component library maintained in Storybook (Phase 0 task in Implementation-Plan.md)
- Every new component reviews contrast + keyboard before merge
- Design tokens versioned; breaking changes go through a minor version bump + migration note
