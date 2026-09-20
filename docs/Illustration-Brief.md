# YTNiches — Illustration Brief

2026-09-19 · @Someone

---

## 1. Overview & Style Principles

Every custom illustration for YTNiches follows one consistent visual language. Mixing styles kills the Fibery-inspired feel — the illustrations must feel like they came from one artist (or one prompt template).

### 1.1 Visual language

- **Style:** Minimal geometric illustration with subtle personality — Fibery / Linear / Attio aesthetic reference. Think: clean shapes, functional composition, one moment of playfulness per piece.
- **NOT:** Photorealistic, corporate stock, 3D renders, cartoony mascots, gradients-heavy modern SaaS illustrations, isometric-heavy.
- **Color palette:** Design-System.md tokens only. Dark mode primary (illustrations live on `bg-base`). Accent color (emerald) used sparingly for emphasis. Object type colors (§2.6) for categorization.
- **Line weight:** 2px stroke consistent across all pieces.
- **Corner treatment:** slightly rounded (matches `radius-sm` = 6px conceptually).

### 1.2 Composition principles

- **Breathing room:** never fill the frame edge-to-edge; leave 10–15% padding on all sides
- **Focal hierarchy:** one clear subject; supporting elements smaller and less contrast
- **Directionality:** avoid strict symmetry; slight asymmetry keeps illustrations from feeling static
- **Human touches:** occasional small hand-drawn imperfections (slight offset, wobble) welcome; perfect vectors feel cold

### 1.3 What consistency looks like

A reviewer should be able to guess an illustration belongs to YTNiches even without brand marks. Signals:

- Same stroke weight everywhere
- Same palette across every asset
- Same typographic style if any text appears (Instrument Serif from Design-System)
- Same lighting logic (all light comes from same direction, subtle shadow logic)
- Same treatment of "YouTube" references (video rectangle proportions, play button style)

### 1.4 Production paths

Three options for producing each asset. Style anchors below (§3) apply to whichever path is chosen.

| Path | When to use | Cost / time |
| --- | --- | --- |
| Illustrator (freelance or agency) | Signature pieces (hero, founder, big features) | 1–2 weeks, $200–800 per piece |
| AI generation + designer polish | Bulk pieces (bento cells, integration logos, category illustrations) | 2–4 days, $30–100 per piece post-cleanup |
| Pure AI generation (no polish) | Placeholders during build; low-visibility spots | Minutes, $0 (subscription cost) |

**Recommendation for MVP:** Path 2 for most; Path 1 for hero + founder photo (photo is separate); Path 3 only if timeline forces it.

### 1.5 Consistency enforcement

Before any asset ships:

- Compared side-by-side with previously-approved assets — does it belong to the same family?
- Palette check: only Design-System tokens used
- Stroke weight check
- Composition check (padding, focal, directionality)
- Dark mode check: does it work on `bg-base` without any adjustment?

## 2. Asset Inventory

Every `[ILL: <id>]` marker in Landing-Page-Spec.md maps to an entry here.

### 2.1 Hero section

| ID | Description | Priority | Path (see §1.4) |
| --- | --- | --- | --- |
| `hero_video` | 60–90s hero video showing product in action; see Hero-Video-Script.md | Critical | Video production separate from illustrations |
| `hero_mockup` | Static fallback if video not ready — hero screenshot with slight tilt / shadow | Critical | Path 2 |

### 2.2 Problem visualization

| ID | Description | Priority | Path |
| --- | --- | --- | --- |
| `scattered_tools_metaphor` | Fibery-style "city" of scattered tools — 5–6 labeled illustrated elements arranged chaotically (TubeBuddy Trap building, VidIQ Void tower, Spreadsheet Chaos, Random Notion Notes pile, AI Prompt Garbage bin, etc.) | Critical | Path 1 (signature piece) |

### 2.3 Creator-type explorer

| ID | Description | Priority | Path |
| --- | --- | --- | --- |
| `preview_ai_voice` | Mockup: YTNiches results tuned for AI-voice explainer channels | High | Path 2 |
| `preview_compilation` | Mockup: results tuned for compilation channels | High | Path 2 |
| `preview_documentary` | Mockup: results tuned for documentary / history | High | Path 2 |
| `preview_sleep_music` | Mockup: results tuned for sleep music / ambient | High | Path 2 |
| `preview_kids_stories` | Mockup: results tuned for kids stories | High | Path 2 |

### 2.4 Bento features

| ID | Description | Priority | Path |
| --- | --- | --- | --- |
| `bento_discovery` | Illustration of Niche Finder + Outlier Finder concept | High | Path 2 |
| `bento_intelligence` | Illustration of Competitor Spy + AI Prompts concept | High | Path 2 |
| `bento_execution` | Illustration of Content Calendar + Workspace concept | High | Path 2 |

### 2.5 View switcher

| ID | Description | Priority | Path |
| --- | --- | --- | --- |
| `view_grid` | Screenshot mockup of Niche Finder in Grid view | Medium | Path 2 (from real UI once built) |
| `view_list` | Screenshot: List view | Medium | Path 2 |
| `view_comparison` | Screenshot: Comparison view | Medium | Path 2 |
| `view_insights` | Screenshot: Insights view (Phase 2 — placeholder in MVP) | Low | Path 2 |

### 2.6 Beginner-mode toggle

| ID | Description | Priority | Path |
| --- | --- | --- | --- |
| `beginner_mode_ui` | Simplified UI mockup (3 fields, one big Search button) | High | Path 2 |
| `power_mode_ui` | Full filter-panel UI mockup | High | Path 2 |

### 2.7 AI section

| ID | Description | Priority | Path |
| --- | --- | --- | --- |
| `ai_generation_demo` | Animated illustration showing URL paste → progress → 5 prompt categories appear | High | Path 1 (animated SVG) or short looping video |

### 2.8 Integrations

| ID | Description | Priority | Path |
| --- | --- | --- | --- |
| `integration_logos` | Row of grayscale integration logos with hover-color reveal (YouTube, Google Sheets, Notion, Slack, Zapier) | Medium | Third-party logos + wrapper design |

### 2.9 Founder section

| ID | Description | Priority | Path |
| --- | --- | --- | --- |
| `founder_photo` | Real photo of Mac at his workspace, warm but not stock; "person who ships" energy | Critical | Real photo shoot |

### 2.10 Video posters / OpenGraph / favicons

| ID | Description | Priority | Path |
| --- | --- | --- | --- |
| `og_image` | 1200×630 OpenGraph card for landing (logo + tagline + product screenshot) | Critical | Path 2 |
| `favicon` | 32×32 favicon + 180×180 Apple touch icon + 512×512 PWA | Critical | Path 3 (simple mark) |

### 2.11 Illustration count summary

- Critical (block launch): 4 (`hero_video`/`hero_mockup`, `scattered_tools_metaphor`, `founder_photo`, `og_image`, `favicon`)
- High (needed for full landing feel): 10
- Medium (nice-to-have): 5
- Low (Phase 2 or later): 1

**Total: \~20 assets for full landing.** Bundle asks accordingly when commissioning.

## 3. AI Generation Approach

For Path 2 (AI + designer polish) and Path 3 (pure AI), consistency comes from a shared prompt template. All generations start from the same style anchor, then vary only the subject.

### 3.1 Style anchor (goes in every prompt)

```
Style: minimal geometric illustration, clean 2px stroke,
dark background (near-black #0a0a0b),
emerald accent color #10b981 used sparingly for emphasis,
subtle geometric shapes, flat design with slight depth via muted shadows,
asymmetric composition with breathing room,
tech-forward but human, no gradients, no 3D,
references: Fibery.com illustrations, Linear.app product art,
Attio marketing visuals.
```

Append this to every Midjourney / DALL·E / equivalent prompt.

### 3.2 Sample prompts per asset

**`scattered_tools_metaphor`:**

```
A chaotic small city of scattered creator tools:
- a stack of spreadsheet cells labeled "Spreadsheet Chaos"
- a leaning tower of sticky notes labeled "Random Notion Notes"
- a scattered pile of AI prompt cards labeled "AI Prompt Garbage"
- a broken TubeBuddy-style calculator labeled "TubeBuddy Trap"
- a lonely search box labeled "VidIQ Void"
Arrange in an asymmetric composition, dark background,
each labeled clearly.
[+ style anchor]
```

**`bento_discovery`:**

```
Minimal illustration of niche + outlier discovery:
a magnifying glass over a grid of channel avatars,
one avatar highlighted with emerald accent,
small trending arrow rising from it.
[+ style anchor]
```

**`bento_intelligence`:**

```
Minimal illustration of competitor spying + AI prompt generation:
two channels side by side (one being observed, one taking notes),
small speech bubbles turning into prompt cards,
emerald accents on the generated prompts.
[+ style anchor]
```

**`bento_execution`:**

```
Minimal illustration of a content calendar + workspace:
a 30-day grid with a few filled cells,
two cursor icons on shared items (collaboration),
emerald accents on completed cells.
[+ style anchor]
```

**`ai_generation_demo`:**

```
Animated (or looping) illustration:
video URL text flowing into a processing shape,
five prompt category cards emerging one by one
(title, thumbnail, hook, script outline, description),
emerald accents on each card's icon.
[+ style anchor]
```

**`preview_<creator_type>`:**

```
Mockup of YTNiches results page tuned for [creator type] channels:
grid of channel cards with metrics relevant to [creator type],
filters preset for [creator type],
dark UI, emerald accents on active filters.
[+ style anchor]
```

### 3.3 Iteration workflow

1. Generate 4 variations per asset with the same prompt
2. Pick the closest match
3. Refine via prompt tweaks (add/remove specifics) rather than starting from scratch
4. Once approved, log the winning prompt + seed (if applicable) in a `prompts.md` file for later reproduction
5. Designer polish pass: fix any AI-artifact issues (weird geometry, wrong color, extra fingers on illustrated hands, etc.)

### 3.4 What AI is bad at (accept the limits)

- Consistent characters across multiple illustrations (if you need Mac's illustrated avatar in multiple places, use a real photo instead)
- Precise text within images (leave text for HTML/CSS overlay, not baked into the illustration)
- UI screenshots that look real (better to screenshot the actual UI once built)
- Icons that match Lucide style (use Lucide directly instead of generating)

## 4. Deliverable Specs

### 4.1 File formats

| Asset type | Master format | Web delivery format |
| --- | --- | --- |
| Vector illustration | SVG (editable) | SVG optimized (SVGO) |
| Raster illustration | PNG (transparent bg) or WebP source | AVIF + WebP with PNG fallback |
| Photo (founder) | High-res JPEG (2400× min) | AVIF + WebP with JPEG fallback |
| Animated illustration | Lottie JSON if from After Effects; else animated SVG or short WebM | Same |
| Video (hero) | ProRes or high-bitrate H.264 master | WebM (VP9) + MP4 (H.264) fallback + poster JPEG |

### 4.2 Sizing

Provide each asset in 3 resolutions where applicable (Next.js `Image` handles srcset):

- 1x (base): logical CSS pixel size
- 2x (retina): 2× pixel density
- 3x (some mobile): 3× pixel density

**Typical sizes:**

| Asset | Base size | Notes |
| --- | --- | --- |
| Hero mockup | 1200×800 | With alpha padding for shadow |
| Bento illustrations | 640×480 | Fits typical bento cell |
| Creator-type previews | 900×600 | Wider aspect for landscape UI mockups |
| Founder photo | 800×1000 | Portrait crop |
| OG image | 1200×630 | Exact size required by OG spec |
| Favicon | 32×32, 180×180, 512×512 | All required |
| Integration logos | 64×64 | Consistent bounding box per logo |

### 4.3 File size budgets

| Asset type | Max size |
| --- | --- |
| Individual illustration (WebP/AVIF) | 100 KB |
| Founder photo (AVIF) | 150 KB |
| Hero mockup (WebP) | 200 KB |
| Full landing page's asset total | 1.5 MB |

Oversized assets rejected in review — compression required before merge.

### 4.4 Naming convention

File names match `[ILL: <id>]` IDs from Landing-Page-Spec.md:

```
public/illustrations/
  hero_mockup.avif
  hero_mockup.webp
  scattered_tools_metaphor.svg
  bento_discovery.avif
  bento_intelligence.avif
  bento_execution.avif
  preview_ai_voice.avif
  preview_compilation.avif
  ...
  founder_photo.avif
  og_image.png
  favicon.ico
  apple-touch-icon.png
```

### 4.5 Alt text (accessibility)

Every `<Image>` must have an `alt` attribute. Guidelines:

- **Decorative asset** (background flourish, illustrative accent): `alt=""` (empty; screen readers skip)
- **Informative asset** (illustration that conveys meaning): describe what it shows in 1 concise sentence
- **Functional asset** (button icon, action visual): describe the action, not the visual

Spec each alt text alongside the asset ID in Landing-Copy.md so alt text ships in Mac's voice, not a developer default.

### 4.6 Storage

- All illustrations live in `/public/illustrations/` (Next.js static folder)
- Master files (SVG, PNG source, PSD/Figma source) stored separately in a `design/` folder outside the repo (Google Drive or similar) with links tracked here
- Video (hero) hosted on Vercel or Mux depending on cost/performance; poster inline in repo
- Never commit files > 5 MB to the repo; use LFS if needed for design masters

### 4.7 Versioning

- On update to an existing illustration: increment filename version (e.g. `hero_mockup_v2.avif`) OR use cache-busting query param
- Document changes in a `CHANGELOG_ILLUSTRATIONS.md` in the design folder
- Never delete old versions until 30 days after replacement (rollback safety)
