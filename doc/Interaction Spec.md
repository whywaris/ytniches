# YTNiches — Interaction Spec

2026-09-19 · @Someone

---

## 1. Overview & Motion Foundations

This doc specifies the behavior of every interactive element on the landing page. Each `[INT: <id>]` marker in Landing-Page-Spec.md maps to a spec here.

### 1.1 Motion tokens (from Design-System.md §4.4)

All interactions use these tokens — do not invent new durations.

| Token | Duration | Easing | Use here |
| --- | --- | --- | --- |
| `motion-micro` | 100ms | ease-out | Button press, checkbox tick |
| `motion-fast` | 150ms | ease-out | Hover reveals, focus rings |
| `motion-default` | 200ms | ease-out | Standard transitions |
| `motion-slow` | 300ms | ease-in-out | Modals, panels, view cross-fades |
| `motion-page` | 400ms | ease-in-out | Page transitions (max) |

### 1.2 Interaction principles

1. **Motion serves meaning, not decoration.** If an animation doesn't clarify what happened or where something went, cut it.
2. **Anchor the change.** When something moves, the eye should already be on it. Never animate off-screen without a reason.
3. **Under 300ms feels responsive, over 400ms feels slow.** Nothing on the landing exceeds 400ms except deliberate video / demo pieces.
4. **Stagger reveals, don't cascade.** Staggering by 60–100ms adds rhythm; longer staggers feel unfinished.
5. **Don't chain animations.** One motion at a time per element. Multiple simultaneous motions overwhelm.
6. **Reduced-motion always respected.** Fallbacks specified per interaction (see §3).

### 1.3 Implementation library

- **Primary:** CSS transitions + transforms for anything simple (hover, fade, translate)
- **When JS needed:** Framer Motion (React) for orchestration, drag, layout animations, scroll-triggered
- **Never:** GSAP or a second animation library (avoid two systems doing the same thing)

### 1.4 Trigger types

| Trigger | When it fires |
| --- | --- |
| Hover | Pointer over element (desktop only) |
| Focus | Keyboard focus or programmatic |
| Active / press | Click / tap in progress |
| Click / tap | Discrete action |
| Scroll-into-view | Element enters viewport (once per session, unless spec says loop) |
| Drag | Pointer press + move on draggable element |
| Timer | Autoplay / loop (specified per interaction) |

## 2. Signature Interactions

One subsection per `[INT: <id>]` referenced in Landing-Page-Spec.md.

---

### `hero_video_autoplay`

- **Trigger:** page load (video enters viewport)
- **Behavior:** video plays muted on loop, poster image shown until first frame ready
- **Loops:** infinite
- **Reduced motion:** static poster image only; video does not autoplay
- **Mobile data saver:** if `Save-Data` header present, static poster only

---

### `hero_video_modal`

- **Trigger:** click on video or Play CTA
- **Behavior:** opens full-screen modal with video, unmuted, from start, with controls
- **Enter:** modal fades in over 200ms with backdrop
- **Exit:** Esc key or close button, fades out 150ms
- **Focus trap:** modal traps keyboard focus while open

---

### `scattered_tools_stagger`

- **Trigger:** section scrolls into viewport (once per page load)
- **Behavior:** each of 5–6 illustrated tool elements fades in + translates up 8px
- **Stagger:** 80ms per element, in reading order (left-to-right, top-to-bottom)
- **Duration per element:** 300ms ease-out
- **Reduced motion:** all elements appear together with no motion (instant)

---

### `creator_type_selector`

- **Trigger:** click on a creator-type card OR arrow key navigation (when focused)
- **Behavior:** selected card gets accent border + subtle scale (1.02); other cards return to default
- **Duration:** 150ms
- **Mobile drag:** horizontal drag scroll on the card strip (native touch scrolling with snap-to-card)
- **Keyboard:** left/right arrow keys move selection when focused

---

### `creator_type_crossfade`

- **Trigger:** creator type changes (via `creator_type_selector`)
- **Behavior:** preview panel content cross-fades to new type's preview
- **Duration:** 300ms ease-in-out
- **Height:** panel auto-heights; use `layout` from Framer Motion to animate height change smoothly
- **Reduced motion:** instant swap, no crossfade

---

### `bento_hover`

- **Trigger:** pointer enters a bento cell (desktop only)
- **Behavior:** cell bg darkens slightly (`bg-hover`), border becomes visible, cell scales 1.02
- **Duration:** 150ms ease-out
- **Exit:** reverse on pointer leave
- **Mobile:** no hover (touch only shows tap feedback: brief `bg-active` on tap)

---

### `view_switcher_crossfade`

- **Trigger:** user clicks a view type (Grid / List / Comparison / Insights)
- **Behavior:**
  1. Segmented control indicator slides to new position (200ms ease-out)
  2. Preview panel cross-fades to new view (300ms ease-in-out)
- **Sequence:** indicator moves first, panel follows with 50ms delay for visual anchoring
- **Reduced motion:** indicator jumps to position instantly; panel content swaps instantly

---

### `template_modal`

- **Trigger:** click on a template pill in the Templates showcase
- **Behavior:** modal opens with template contents (heading + description + preview of what the template contains + CTA to sign up)
- **Enter:** 300ms fade + slight scale from 0.95 to 1.0
- **Exit:** Esc or close, 150ms fade out
- **Focus trap:** yes

---

### `mode_toggle`

- **Trigger:** click on Beginner/Power toggle or drag the handle
- **Behavior:** toggle handle slides between positions; illustration below cross-fades between simple UI and full-filter UI variants
- **Duration:** 300ms ease-in-out for both handle + illustration
- **Reduced motion:** handle snaps to new position, illustration swaps instantly

---

### `ai_demo_loop`

- **Trigger:** section scrolls into viewport (starts on entry, loops)
- **Behavior:** 5-second sequence — URL text appears, processing indicator, then 5 prompt cards appear one by one (100ms stagger)
- **Pause on hover:** if pointer enters demo area, animation pauses at current frame; resumes on pointer leave
- **Loop delay:** 2 seconds between loops
- **Reduced motion:** static end-state (all 5 cards visible, no animation)

---

### `integration_hover`

- **Trigger:** pointer enters an integration logo (desktop only)
- **Behavior:** hovered logo becomes full color; other logos + surrounding elements dim to 40% opacity; tooltip with integration name + one-line description appears above
- **Duration:** 150ms
- **Exit:** reverse on pointer leave
- **Mobile:** tap logo to reveal tooltip; tap outside to dismiss

---

### `changelog_stagger`

- **Trigger:** section scrolls into viewport (once per page load)
- **Behavior:** each changelog entry fades in + translates up 4px
- **Stagger:** 60ms per entry
- **Duration per entry:** 250ms ease-out
- **Reduced motion:** all entries appear together instantly

---

### Global CTA button hover (applies to all primary/secondary buttons on landing)

- **Trigger:** pointer enters CTA
- **Behavior:** button lifts 2px (translateY), subtle shadow appears
- **Duration:** 150ms ease-out
- **Active state:** on press, button returns to base position (translateY 0) with slight bg darkening

## 3. Reduced Motion, Accessibility & Performance

### 3.1 Reduced motion

`prefers-reduced-motion: reduce` respected across every interaction. Global rule:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Per-interaction reduced-motion behavior specified in §2 for each. Rule of thumb: keep the final state, remove the motion between.

### 3.2 Keyboard accessibility

- **Every interactive element focusable via Tab** in document order
- **Focus ring visible always** (2px `accent-subtle` ring with 2px offset; per Design-System §6.2)
- **Enter / Space activates buttons + links** (browser default; don't override)
- **Arrow keys navigate within composite widgets** (creator-type selector, segmented control)
- **Escape closes modals** (`hero_video_modal`, `template_modal`)
- **Focus trap in modals** (Framer Motion / a focus-trap helper)
- **Focus returns to trigger element** after modal close

### 3.3 Touch device adaptations

Hover-based interactions don't work on touch. Adaptations:

| Interaction | Desktop behavior | Touch behavior |
| --- | --- | --- |
| `bento_hover` | Cell darkens on hover | Brief bg feedback on tap; no persistent hover state |
| `integration_hover` | Logo colorizes, others dim, tooltip appears | Tap logo → tooltip appears; tap elsewhere → dismiss |
| `creator_type_selector` | Click + hover | Native touch scroll on card strip; tap to select |
| Global button lift | 2px hover lift | No lift; tap-scale (0.98) on active |

### 3.4 Performance guardrails

- **Never animate `width`, `height`, `top`, `left`.** Use `transform` (translate, scale, rotate) and `opacity` — the only two properties that don't trigger layout / paint
- **Use `will-change` sparingly.** Only on elements that will animate imminently, remove after animation
- **Composite layer promotion for hero video** (`will-change: transform`) to keep it silky during scroll
- **Scroll-triggered animations use IntersectionObserver**, not scroll event listeners (much cheaper)
- **Framer Motion `layout` prop is expensive** — use it only where genuinely needed (creator\_type\_crossfade panel), not on lists of 10+ items
- **Cap concurrent animations at 3** — anything more overwhelms + tanks perf

### 3.5 Cross-browser + device notes

- **Safari:** test all animations; Safari sometimes ignores CSS variables in transitions — use fallback values
- **iOS momentum scroll:** don't intercept for anything visual on the landing (breaks native feel)
- **Older Android (< Chrome 100 equivalent):** reduce simultaneous animations further; consider disabling ai\_demo\_loop
- **Low-end mobile:** if `navigator.deviceMemory < 4` OR `navigator.connection.effectiveType === '2g'`, apply reduced-motion behavior even without user preference

### 3.6 Testing checklist

Before landing goes live, verify:

- [ ] Every interaction works with keyboard alone (no mouse)
- [ ] Every interaction works on touch (tap, drag)
- [ ] `prefers-reduced-motion: reduce` disables motion but preserves final states
- [ ] Screen reader announces state changes (e.g. creator type selection)
- [ ] Lighthouse Performance still ≥ 90 with all interactions active
- [ ] No console errors from animation library
- [ ] Animations perform smoothly (60 fps) on iPhone SE / mid-range Android
- [ ] Hero video respects `Save-Data` header (poster only)

---

**Doc dependencies:** This spec assumes Design-System.md motion tokens (§4.4) and Landing-Page-Spec.md's `[INT: <id>]` markers. When adding a new interaction, add its spec here + reference in Landing-Page-Spec first, before implementation.
