# YTNiches — Landing Page Spec

2026-09-19 · @Someone

---

> **Superseded in part by D-082 (2026-09-28).** The landing page is now 8 sections: navbar, hero, what YTNiches does, how it works, pricing teaser, FAQ, final CTA and footer. It uses the marketing glass system (Design-System.md §2.8), and all copy lives in `components/features/landing/content.ts`. Sections 3–13 below were removed from `/`, the founder story (§11) included (it lives in the blog and author bio); the VS pages are linked from the footer instead.

## 1. Overview

This doc specs the STRUCTURE of the landing page — sections, layout, components, behavior. Content (copy, illustrations, video) is specced in dependent docs.

**How this doc works with others:**

| Doc                       | Provides                                                         |
| ------------------------- | ---------------------------------------------------------------- |
| **This doc**              | Section structure, layout, components, interactions, breakpoints |
| **Landing-Copy.md**       | Every headline, subhead, body line, CTA text (in Mac's voice)    |
| **Illustration-Brief.md** | Visual asset list + style guide + generation prompts             |
| **Interaction-Spec.md**   | Detailed behavior of interactive elements (drag, hover, toggle)  |
| **Hero-Video-Script.md**  | 60–90s hero video script + storyboard                            |
| **Design-System.md**      | Colors, typography, components, motion tokens                    |

**Style direction:** Fibery-inspired Option A (see DECISIONS.md D-003). Founder-first voice (D-004). Emerald accent (Design-System §2.4, pending Mac's confirmation).

**Structure at a glance (15 sections):**

1. Navbar
2. Hero (with video)
3. Problem visualization
4. Interactive creator-type explorer
5. Bento-grid features
6. View switcher
7. Templates showcase
8. Beginner-mode toggle
9. AI section
10. Integrations
11. Founder section
12. Public changelog
13. VS section
14. Final CTA
15. Footer

**Copy status:** Every section below marks copy fields as `[COPY: <what it needs>]` — filled from Landing-Copy.md once written.

**Illustration status:** Every section that needs a visual marks it as `[ILL: <asset id>]` — asset IDs mapped to briefs in Illustration-Brief.md.

**Interaction status:** Every section with interactivity marks it as `[INT: <interaction id>]` — detailed behavior in Interaction-Spec.md.

## 2. Sections 1–4

### Section 1: Navbar

**Layout:** full-width, height 72px, sticky on scroll (with subtle bg blur once scrolled).

**Contents (left to right):**

- Logo (YTNiches wordmark, links to `/`)
- Nav items: Blog, Free Tools, Pricing, Changelog, VS (each links to its page)
- Flex spacer
- "Log in" (secondary button)
- "Sign up free" (primary button)

**Mobile:** hamburger menu opens full-screen overlay with same items stacked.

**States:** default (transparent bg over hero), scrolled (`bg-base` + subtle border-bottom).

---

### Section 2: Hero

**Layout:** full viewport height on desktop (min 720px), 80vh on tablet, natural stack on mobile.

**Contents (centered, max-width 1120):**

- Optional eyebrow: `[COPY: eyebrow, e.g. "For faceless creators"]`
- Headline (H1, `display-lg`): `[COPY: hero headline, ~10-12 words]`
- Subhead (`body-lg`, tertiary color): `[COPY: subhead, 1–2 sentences]`
- Primary CTA row: "Sign up free" + "Watch 2-min demo" (secondary, with play icon)
- Below CTAs: social proof line: `[COPY: e.g. "Used by 1,000+ faceless creators"]` (grayed once numbers grow)
- Below social proof: hero video/mockup `[ILL: hero_video or hero_mockup]`

**Behavior:**

- Hero video autoplays muted, loops (`[INT: hero_video_autoplay]`)
- Click video → opens fullscreen modal with sound (`[INT: hero_video_modal]`)
- Small hover animation on CTAs (button lift 2px, subtle shadow)

**Background:** subtle radial gradient (accent tinted, very low opacity) from top-center, fading to `bg-base`.

---

### Section 3: Problem visualization

Fibery "scattered tools" city equivalent. Visual metaphor showing the mess YTNiches replaces.

**Layout:** two-column desktop (illustration 60% left / copy 40% right); stacked mobile.

**Contents:**

- Section eyebrow: `[COPY: e.g. "The current stack"]`
- Headline: `[COPY: e.g. "Every tool leaves you stranded"]`
- Illustration `[ILL: scattered_tools_metaphor]` — 5–6 labeled elements (TubeBuddy Trap, VidIQ Void, Spreadsheet Chaos, Random Notion Notes, AI Prompt Garbage) arranged as a chaotic "city"
- Below headline: 2–3 short paragraphs `[COPY: problem framing]`
- Transition line: `[COPY: e.g. "…until everything's in one place."]`

**Behavior:** on scroll into view, individual illustration elements fade in with 100ms stagger (`[INT: scattered_tools_stagger]`).

---

### Section 4: Interactive creator-type explorer

Fibery drag-to-explore equivalent. Users pick their creator type to see YTNiches tailored to them.

**Layout:** full-width, centered content max-width 1120.

**Contents:**

- Section eyebrow + headline: `[COPY: e.g. "See it for your channel type"]`
- Below: horizontal scroll (or drag) strip of creator-type cards `[INT: creator_type_selector]`. 5 cards: AI-voice explainer, Compilation, Documentary/history, Sleep music, Kids stories
- Below strip: preview panel that swaps content based on selected type. Contains:
  - Screenshot/mockup showing YTNiches results tuned to that type `[ILL: preview_<type>]`
  - 2–3 bullet points: `[COPY: what's different for this type]`

**Default state:** first card selected (AI-voice explainer).

**Behavior:** click a card to swap the preview. Smooth cross-fade transition on preview (`[INT: creator_type_crossfade]`).

**Mobile:** cards stack as vertical accordion, preview appears below selected card.

## 3. Sections 5–8

### Section 5: Bento-grid features

Grouped features shown as a Fibery-style bento grid. Three feature groups from PRD §5: Discovery, Intelligence, Execution.

**Layout:** irregular grid (bento). Desktop: 6–8 cells in staggered layout; tablet: 2 columns; mobile: single column stack.

**Bento cells (per group):**

- **Discovery** (large cell top-left): headline + illustration `[ILL: bento_discovery]` + one interactive preview swap between Niche Finder / Outlier Finder
- **Intelligence** (medium cell top-right): headline + illustration `[ILL: bento_intelligence]` covering Competitor Spy + AI Prompts
- **Execution** (wide cell middle row): headline + illustration `[ILL: bento_execution]` covering Content Calendar + Workspace
- Fill cells: 3–4 smaller feature callouts (Command palette, Dark mode, Keyboard-first, Real-time notifications) with icons

**Copy per cell:** `[COPY: feature group headline + 1-sentence description]`

**Behavior:** each cell has hover state that darkens + slight scale (`[INT: bento_hover]`). Preview panels swap on interaction. On scroll into view, cells fade in with 60ms stagger.

---

### Section 6: View switcher

Fibery Table / Board / Gallery equivalent. Shows how Niche Finder results can be viewed different ways.

**Layout:** full-width container, centered content max 1120.

**Contents:**

- Section eyebrow + headline: `[COPY: e.g. "Your data, your way"]`
- Segmented control below headline: `Grid | List | Comparison | Insights`
- Large preview panel below shows Niche Finder results in the selected view mode `[ILL: view_grid, view_list, view_comparison, view_insights]`

**Default state:** Grid selected.

**Behavior:** click a view type → preview cross-fades to that view (`[INT: view_switcher_crossfade]`). Subtle animation on the segmented control indicator sliding.

---

### Section 7: Templates showcase

Pre-built prompt templates + niche starter packs — Fibery templates grid equivalent.

**Layout:** full-width, centered content max 1200.

**Contents:**

- Section eyebrow + headline: `[COPY: e.g. "Start from a template"]`
- Subhead: `[COPY: 1-sentence explanation]`
- Two rows of clickable pills/cards:
  - **Row 1 — Prompt templates:** Video script prompt, Thumbnail concept prompt, Title A/B prompt, Hook variants, Description template, etc. (10–12 pills)
  - **Row 2 — Niche starter packs:** Sleep music, Kids stories, AI news, Historical facts, Compilation, etc. (8–10 pills)
- Each pill has a subtle icon + name (icons per Design-System §3.4)

**Behavior:** click any pill → modal opens showing that template's contents with "Sign up to use this" CTA (`[INT: template_modal]`). No hard-scroll behavior; overflow horizontally on mobile.

---

### Section 8: Beginner-mode toggle

Fibery Architect Mode equivalent. Shows that beginners get a simple experience, power users can drill deep.

**Layout:** two-column desktop (illustration 50% / copy 50%); stacked mobile.

**Contents:**

- Section eyebrow + headline: `[COPY: e.g. "Simple or deep — your call"]`
- Toggle control (Beginner | Power): visible in the illustration itself
- Illustration swaps between two versions: `[ILL: beginner_mode_ui]` (simple 3-field search) and `[ILL: power_mode_ui]` (full filter panel)
- Copy adapts to selected mode: `[COPY: beginner variant + power variant]`

**Behavior:** toggle control operates on click / drag (`[INT: mode_toggle]`); smooth 300ms transition between illustration variants.

## 4. Sections 9–12

### Section 9: AI section

**Layout:** full-width band, dark section (deeper than surrounding), centered content max 1120.

**Contents:**

- Section eyebrow + headline: `[COPY: e.g. "When you know what's working, AI can finally help"]`
- Subhead: `[COPY: explain the AI Prompts thesis]`
- Below: animated demonstration of prompt generation `[ILL: ai_generation_demo]` — shows a video URL being pasted, then 5 prompt categories appearing progressively
- Right / below: 3–4 bullet callouts (title variants, thumbnail concepts, hook variants, script outlines) with icons

**Behavior:** demo animation loops on scroll into view (`[INT: ai_demo_loop]`) — 5-second cycle, pauses on hover.

---

### Section 10: Integrations

Fibery-style categorized integrations block.

**Layout:** full-width, centered max 1120.

**Contents:**

- Section eyebrow + headline: `[COPY: e.g. "Plays nice with your stack"]`
- Three category rows (Fibery's "No sweat / Some sweat / Real sweat" equivalent):
  - **No sweat** — native integrations: YouTube API, Google Sheets export, Notion export
  - **Some sweat** — webhook + tool integrations: Slack (Phase 3), Zapier
  - **Real sweat** — API access (Phase 3+): direct API endpoints for enterprise
- Each category shows logo pills of integrations `[ILL: integration_logos]` (grayscale, hover reveals color)

**Behavior:** hover on any integration logo darkens surroundings, brings that logo to color with a tooltip explaining what it does (`[INT: integration_hover]`).

---

### Section 11: Founder section

Humanize the product. This is where Mac's face + story lives.

**Layout:** two-column desktop (photo 40% left / copy 60% right); stacked mobile with photo on top.

**Contents:**

- Photo of Mac `[ILL: founder_photo]` (professional but casual; ideally at his desk, not stock)
- Section eyebrow: `[COPY: e.g. "Built by a creator who got tired"]`
- Personal story (2–3 short paragraphs): `[COPY: founder story from Landing-Copy — the drop-the-channel narrative, contrarian opinion, why he's making this]`
- Signature line: `[COPY: e.g. "— Mac, founder"]`
- Optional: link to Mac's Twitter / LinkedIn

**Behavior:** none — this is a quiet, human moment. No animation.

---

### Section 12: Public changelog

Fibery-style monthly-updates block that builds "product is alive" trust.

**Layout:** full-width, centered max 1000.

**Contents:**

- Section eyebrow + headline: `[COPY: e.g. "We ship every week"]`
- Subhead: `[COPY: e.g. "Live changelog. Actual product movement."]`
- Below: last 3–5 changelog entries in reverse chronological order
- Each entry: date (e.g. "Sep 2026") + one-line summary + "Read more" link
- "View full changelog" link at bottom → `/changelog` page

**Data source:** changelog entries pulled from a Notion or a CMS backing store; server-rendered at build time (ISR revalidate 60s).

**Behavior:** on scroll into view, entries fade in with 80ms stagger (`[INT: changelog_stagger]`). Nothing else — changelog should feel like a document, not a marketing widget.

## 5. Sections 13–15 + Technical

### Section 13: VS section

Direct competitor callouts (with humor). Fibery-style honest comparison.

**Layout:** full-width, centered max 1000.

**Contents:**

- Section eyebrow + headline: `[COPY: e.g. "How we compare"]`
- Three competitor cards side-by-side (desktop) / stacked (mobile):
  - YTNiches vs Nexlev
  - YTNiches vs OutlierKit
  - YTNiches vs TubeLab
- Each card: competitor logo/name + one-line honest framing `[COPY: per competitor]` + "See full comparison →" link → `/vs/<competitor>` page
- Below cards: single line `[COPY: e.g. "Or, you know, use all four. We won't judge."]`

**Behavior:** subtle hover on each card (lift 2px, slight bg lighten).

---

### Section 14: Final CTA

Last push before footer. Should feel confident, not desperate.

**Layout:** full-width band, contrasting bg (subtle accent-tinted or darker than surroundings), centered content max 800.

**Contents:**

- Headline (`display-sm`): `[COPY: final CTA headline, ~8-10 words]`
- Subhead: `[COPY: reinforce the promise, 1 sentence]`
- Two buttons: "Sign up free" (primary, large) + "Book a 15-min demo" (secondary, if Mac wants to offer this)
- Below: reassurance line `[COPY: e.g. "No credit card. Cancel anytime. Free tier stays free."]`

**Behavior:** none (already at attention floor — don't over-animate).

---

### Section 15: Footer

**Layout:** full-width, dark bg (`bg-base` deepest), centered content max 1440, generous padding (80px top/bottom).

**Contents (4-column grid):**

- **Column 1:** Logo + short tagline + "Made in Pakistan" or similar credit line `[COPY: tagline]`
- **Column 2 — Product:** Features, Pricing, Free Tools, Changelog, Roadmap
- **Column 3 — Resources:** Blog, Tutorials, VS pages, Templates, Help center
- **Column 4 — Company:** About, Contact, Privacy, Terms

**Below columns:**

- Social row: Twitter, LinkedIn, YouTube (channel)
- Fibery-style "Ask AI about YTNiches" pills: `Ask ChatGPT`, `Ask Claude`, `Ask Perplexity` — each links to those tools with a pre-filled query about YTNiches
- Copyright line: `© 2026 YTNiches. All rights reserved.`

---

### Technical requirements

**Rendering:** Static generation with ISR for changelog + blog references (revalidate 60s).

**Performance targets:**

- Lighthouse Performance score: ≥ 90 on mobile 4G simulation
- Largest Contentful Paint: < 2.5s
- First Input Delay: < 100ms
- Cumulative Layout Shift: < 0.1
- Total page weight: < 1.5 MB (including hero video poster, excluding video itself)
- Hero video: lazy-loaded, WebM + MP4 fallback, poster image inline

**Responsive breakpoints (Tailwind defaults):**

| Breakpoint | Min width | Layout behavior                                |
| ---------- | --------- | ---------------------------------------------- |
| Mobile     | 0px       | Single column, hamburger nav, stacked sections |
| `sm`       | 640px     | Slight scaling; still mostly single-column     |
| `md`       | 768px     | Two-column layouts start                       |
| `lg`       | 1024px    | Full desktop layout                            |
| `xl`       | 1280px    | Wider content, more breathing room             |
| `2xl`      | 1440px    | Max-width container centered                   |

**Analytics events (fire from landing):**

- `landing_hero_cta_click` (primary or secondary)
- `landing_video_play`
- `landing_creator_type_selected` (with type)
- `landing_view_type_switched`
- `landing_template_opened` (with template name)
- `landing_beginner_mode_toggled`
- `landing_vs_link_clicked` (with competitor)
- `landing_final_cta_click`

**SEO essentials:**

- Meta title: `[COPY: SEO title, < 60 chars]`
- Meta description: `[COPY: SEO description, < 155 chars]`
- OpenGraph image: hero screenshot or branded card, 1200×630px
- JSON-LD: SoftwareApplication schema with rating (once ratings exist)
- Canonical URL: `https://ytniches.com/`

**Accessibility (baseline per Design-System §6.2):**

- All interactive elements keyboard accessible
- Hero video has captions option
- Bento grid maintains logical tab order
- Every image (`[ILL: ...]`) requires alt text spec in Illustration-Brief.md
