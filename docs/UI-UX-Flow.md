# YTNiches — UI/UX Flow

2026-09-19 · @Someone

---

## 1. Overview

This doc specs every screen in YTNiches — layout, components, interactions, states, empty flows — as text that a developer can build from alongside Design-System.md.

**What this doc covers:**

- Layout structure per screen (regions, panels, sidebars)
- Component composition (which Design-System components appear where)
- Interactions (click, hover, keyboard shortcuts)
- All states: empty, loading, populated, error
- Screen-to-screen transitions and CTAs

**What this doc does NOT cover:**

- Visual mockups or wireframes (design tool separately; this is text-only)
- Exact pixel measurements (Design-System.md handles tokens)
- API contracts (see TRD.md once written)
- Copy microcopy (placeholder copy here; final copy in Landing-Copy.md and in-app copy sheets)

**How to read this doc:**

Each section covers one page or a related cluster. Screens are described top-down (header → body → footer / sidebars). Components are named exactly as in Design-System.md so the developer knows which primitive to reach for. If a screen has multiple states, each state is spelled out.

**Screen inventory (Phase 1 MVP):**

| Screen                                          | Section |
| ----------------------------------------------- | ------- |
| Landing, blog, free tools, VS pages             | 2       |
| Signup, login, forgot password, email verify    | 2       |
| Onboarding (5 steps)                            | 3       |
| App shell (sidebar, top bar, command palette)   | 4       |
| Niche Finder (search, results, channel detail)  | 5       |
| Competitor Tracking (overview, detail, compare) | 6       |
| AI Prompts (video select, generation, library)  | 7       |
| Settings + admin panel entry                    | 8       |

## 2. Public Marketing Site + Auth

### 2.1 Landing page

Full spec in **Landing-Page-Spec.md** (to be written after founder voice discovery closes). Structure at a glance: Navbar → Hero (with video) → Problem visualization → Interactive creator-type explorer → Bento-grid features → View switcher → Templates showcase → Beginner-mode toggle → AI section → Integrations → Founder section → Public changelog → VS section → Final CTA → Footer.

### 2.2 Blog

**Blog homepage** (`/blog`):

- Navbar (marketing variant, sticky)
- Featured hero post (large card: cover image, category tag, title, description, author byline)
- 3-column featured grid (3 hand-picked posts)
- Category filter pills (`All | Faceless Niches | Outlier Analysis | AI Prompts | YouTube Growth | Case Studies | Tool Guides`)
- Search bar (client-side Fuse.js)
- "Recently Published" section (4 chronological, "View all" link)
- Category-based rows (3 posts each + "View all")
- Embedded newsletter signup mid-page
- Footer CTA → YTNiches signup

**Individual post page** (`/blog/[slug]`):

- Breadcrumb (Home › Blog › Category › Post)
- Category tag + title (H1)
- Author byline (avatar + name link + publish date + read time)
- Featured image
- Sticky table of contents (right sidebar, desktop only)
- Article body (MDX rendered)
- Author bio card at bottom
- Related posts (3 from same category)
- Newsletter signup
- Product CTA at end

**Category page** (`/blog/categories/[slug]`) and **Author page** (`/blog/authors/[slug]`): title as H1, description, grid of matching posts, paginated.

### 2.3 Free Tools

**Tool page** (`/tools/[slug]`):

- Navbar (marketing variant)
- Hero (smaller variant): tool title + one-line description
- The tool itself (custom per tool, uses in-app component primitives)
- Result display
- CTA panel: "Get the full version — sign up"
- Related tools row
- Footer

Gating decision per D-014 (open / partial / fully gated).

### 2.4 VS pages

**Comparison page** (`/vs/[competitor]`):

- Navbar (marketing variant)
- Hero: "YTNiches vs \[Competitor\]" headline + short subhead
- Feature-by-feature comparison table
- Pricing comparison table
- Testimonial section (once available)
- CTA panel
- Footer

### 2.5 Auth pages

**Signup** (`/signup`):

- Split screen: left = form, right = product screenshot (or single-column mobile)
- Google OAuth button (primary)
- "or" divider
- Email + password fields (if D-015 resolves to include them)
- Terms + privacy checkbox
- "Already have an account? Log in" link
- Post-submit: redirect to email verify or straight to onboarding

**Login** (`/login`):

- Same shell as signup
- Google OAuth button (primary)
- Email + password fields
- "Forgot password?" link
- "Don't have an account? Sign up" link

**Forgot password** (`/forgot-password`):

- Email input + submit
- Success state: "Check your inbox"
- Error state: "No account found" (with signup link)

**Email verify** (`/verify`):

- Confirmation: "Your email is verified"
- Auto-redirect to onboarding after 2s

## 3. Onboarding Flow

Goal: signup → first useful output in under 5 minutes. "Show, don't tell" — no feature tour, user does the actions and sees results.

**Entry:** immediately after email verification (or straight after signup if OAuth). URL: `/onboarding` (progress persists per user).

**Layout for every step:** centered card, no sidebar, progress dots at top (5 dots), skip link top-right ("Skip — I'll figure it out").

---

### Step 1: Welcome

- Screen title: "Welcome to YTNiches, \[name\]"
- Sub: "Two quick questions, then you'll be in."
- Input 1: Name (pre-filled from OAuth, editable)
- Input 2: Primary goal (radio selector)
  - "I'm exploring niches — no channel yet" → Explorer persona
  - "I have a channel but growth is flat" → Stuck persona
  - "My channel is growing, I need to systematize" → Grower persona
  - "I run multiple channels / a team" → Operator persona
- Primary button: "Continue"
- Persona choice tunes later screens (starting filters, example prompts, feature highlighting)

---

### Step 2: Connect YouTube (optional)

- Screen title: "Connect your channel?"
- Sub: "We'll personalize your niche recommendations. You can skip and connect later."
- Two buttons: "Connect with YouTube" (primary) + "Skip for now" (ghost)
- Skip advances directly to Step 3
- Connect → OAuth flow → return here → auto-advance to Step 3

---

### Step 3: First niche search

- Screen title: "Let's find your first niche"
- Sub: "Filters are pre-filled based on what usually works. Tweak or hit Search."
- Pre-filled Niche Finder form (values vary by persona from Step 1):
  - Keyword: empty (placeholder: "e.g. history facts, meditation")
  - Subscriber range: 1k–100k
  - Avg views: 10k–500k
  - Upload freq: 2– 7 per week
  - Language: English (default)
- Primary button: "Search"
- On submit → results appear inline (no navigation), user sees channel cards

---

### Step 4: First save

- Contextual banner above results: "Save any channel to track it. Click the bookmark icon."
- Highlight animation on first bookmark icon (subtle pulse until first save)
- On save: banner replaces with "Nice — saved to your Competitor Tracking. One more step."
- Primary button: "Continue"

---

### Step 5: First prompt

- Screen title: "Turn a winning video into content ideas"
- Sub: "Pick any video from your saved channel and watch YTNiches extract prompts."
- Left: list of recent videos from the saved channel (top 5 by views)
- User clicks one → generation loading state (3–5s) → 5 prompt categories appear (title variants, thumbnail concepts, hook variants, script outline, description template)
- Primary button (once generation completes): "Save prompts and finish setup"

---

### Post-onboarding

- Redirect to `/dashboard`
- Toast: "You're set up. Cmd+K opens the command palette from anywhere."
- Onboarding accessible again from the `?` menu (top bar)

---

### Skip behavior

- Skip at any step → skips to dashboard with a subtle banner: "Finish onboarding" (links back)
- Skip is tracked as an event (`onboarding_skipped` with step number) for activation metric analysis

### Empty / error handling

- Step 3: if search returns no results with pre-filled filters (rare), auto-widen and retry once, then show empty state with "Try different keywords" prompt
- Step 5: if no videos available on saved channel (rare), let user paste any YouTube URL instead

## 4. Main App Shell

Shared chrome around every authenticated page. Linear-style: sidebar left, top bar top, main content fills rest.

### 4.1 Sidebar (Linear-style)

**Widths:** collapsed 56px / expanded 240px. Toggle button at bottom, preference persisted per user.

**Sections (top to bottom):**

1. **Logo** — YTNiches wordmark (expanded) or icon only (collapsed)
2. **Primary nav** — no section header
   - Dashboard (Home icon)
   - Niche Finder (Search icon)
   - Competitor Tracking (Radar icon)
   - AI Prompts (Sparkles icon)
   - Content Calendar (Calendar icon) — Phase 3, greyed with "Team plan" tag in Phase 1
3. **Divider**
4. **Workspace** section header (uppercase, tertiary)
   - Saved channels (with count badge)
   - Prompt library (with count badge)
   - Notes
5. **Divider**
6. **Footer**
   - Settings (Gear icon)
   - Help (`?` icon) — opens help menu (docs, onboarding restart, contact)
   - User avatar — opens account menu (profile, billing, log out)

**Active state:** `accent-subtle` background + `accent` 2px left border. Only one item active at a time.

### 4.2 Top bar

Height 56px, spans full width above main content (does not sit above sidebar on desktop — sidebar starts at top).

**Contents (left to right):**

- Breadcrumb or page title (context-aware)
- Flex spacer
- Global search trigger (`Cmd K` badge on the right) — opens command palette
- Notification bell (with unread count badge)
- Credit balance chip ("124 credits") — clickable, opens billing quick-view
- Avatar (32px, opens account menu)

### 4.3 Command palette (Cmd+K)

Modal overlay, `elev-3` styling. Opens on Cmd/Ctrl+K anywhere in the app.

**Structure:**

- Search input at top (auto-focused, placeholder: "Search or type a command…")
- Grouped results below:
  - **Recent** — last 5 actions (searches, saved channels, prompts)
  - **Navigation** — jump to any page
  - **Actions** — New search, Save channel by URL, Generate prompt from URL, Invite teammate (Phase 3), Toggle theme
  - **Search** — real-time results across channels, prompts, notes (fuzzy)
- Footer: keyboard hints (`↑↓ navigate  ↵ select  esc close`)

**Empty state (no query):** shows Recent + top 5 Navigation shortcuts.

### 4.4 Main content area

- Max-width: 1440px, centered when viewport wider
- Horizontal padding: 24px (mobile) → 40px (tablet) → auto (desktop)
- Top padding: 24px (below top bar)

### 4.5 Dashboard (default landing after login)

Aggregated view showing recent activity + shortcuts.

**Layout:**

- Greeting: "Good \[morning/afternoon/evening\], \[name\]" (top, h2)
- Sub: quick-context line based on tier + goal ("You have 124 credits and 3 tracked channels.")
- 4 metric cards row: Tracked channels count, Saved prompts count, Credits used this month, Days streak (visits)
- "Recent activity" section: feed of last 10 events across tracked channels (new videos, outliers if Phase 2)
- "Continue where you left off" section: last 3 pages visited with quick jumps
- "Suggested next" section: 1–2 personalized suggestions (e.g. "You haven't generated a prompt in 5 days")

**Empty state (new user post-onboarding):** just greeting + one large card: "Ready when you are. Try Niche Finder to discover channels." + primary button.

## 5. Niche Finder

The entry point of the product loop. URL: `/niches`.

### 5.0 Discovery tabs (D-069)

`/niches` has four tabs, chosen with `?tab=`:

1. **Niches** (default)
2. **Channels**
3. **Outliers**
4. **Search**

The **Search** tab is the live search described in §5.1–§5.4, with no changes. A freshness line ("Updated 3h ago · N new channels this week") sits above the tabs.

Screen details are in `Niche-Discovery-Engine.md` §9:

- **Niche card** (§9.2).
- **Channel card** (§9.3): four stat tiles plus 4 popular videos.
- **URL-backed filters** (§9.4): a left panel on desktop and a bottom sheet on mobile.
- **Niche detail page** `/niches/[slug]` (§9.5).

States:

- **Loading:** skeleton cards.
- **Empty feed** (engine hasn't run yet): "Fresh niches land here daily. Try a live search meanwhile." with a link to the Search tab.
- **Starter/Trial after niche #50:** an upgrade card.

### 5.1 Search page (default state)

**Layout:** two-column on desktop (filter panel 320px left / results right); stacked on mobile.

**Filter panel (left, sticky):**

- Panel title: "Filters"
- Reset link (top-right of panel)
- Sections (collapsible):
  - **Keyword** — text input, placeholder "Try: sleep music, history facts"
  - **Subscriber range** — dual-handle range slider + numeric inputs (min / max)
  - **Avg views/video** — dual-handle slider (last 30 days)
  - **Upload frequency** — selector: any / weekly / 2–4 per week / daily+
  - **Monetized** — tri-toggle: any / yes / no
  - **Language** — multi-select dropdown
  - **Country** — multi-select dropdown
  - **Channel age** — date picker ("created after")
- "Saved filters" section at bottom: user's saved filter presets
- Primary button (sticky at bottom of panel): "Search" (disabled if no keyword AND all filters at default)

**Right side (before search):**

- Empty prompt: illustrated icon + "Set your filters and hit Search" + secondary hint text explaining what filters do best together
- Below: 3–4 example searches as clickable chips ("Sleep music, 10k–100k subs", "AI history, monetized", etc.)

### 5.2 Results view (populated)

**Top bar (above results):**

- Result count: "124 channels"
- View toggle: `Grid | List | Comparison` (segmented control)
- Sort dropdown: Relevance / Sub count / Avg views / Upload freq
- Density toggle (list view only): compact / comfortable
- Bulk actions bar (appears when rows selected): "Save all to tracking" | "Export" | "Clear"

**Grid view (default):**

- Card grid: 3 columns desktop, 2 tablet, 1 mobile
- Each card:
  - Channel avatar (48px) + name (h4)
  - Sub count + total videos + avg views (secondary text row)
  - Metric mini-chart (30-day view trend sparkline)
  - Language + country + monetized badges (bottom row)
  - Bookmark icon (top-right, click to save to tracking)
  - Card is clickable → opens channel detail

**List view:**

- Ahrefs-style table
- Columns: checkbox / channel (sticky first column: avatar + name) / subs / videos / avg views / upload freq / monetized / language / country / actions
- Sortable column headers
- Row hover: `bg-hover`
- Row click: opens channel detail

**Comparison view:**

- User picks 2–3 channels via checkbox
- Side-by-side columns with matching rows (subs, avg views, top video, upload cadence, first video date, etc.)
- Highlighted winner per row

### 5.3 Channel detail page

URL: `/niches/channels/[channelId]`.

**Header:**

- Back button to results (preserves search state)
- Channel avatar (80px) + name (h1) + external link icon to YouTube
- Sub count + total videos + join date (row)
- Primary actions: Bookmark to tracking / Extract prompts from top videos / Add to workspace

**Metric cards row:**

- Subscribers (current + 30-day change)
- Avg views/video (30-day)
- Upload frequency (per week)
- Estimated monthly views

**Tabs:**

- **Videos** (default) — table of all recent videos (title, views, published, duration, view velocity chart)
- **Trends** — charts: subs over time, monthly upload count, avg views over time
- **About** — description, playlists, external links, similar channels

### 5.4 States

- **Loading:** skeleton grid (matching card shape) for 400ms max, then results appear progressively
- **Empty (no results):** illustrated icon + "No channels matched. Try widening subscriber range or removing country filter." + Reset filters button
- **Error:** "Something went wrong loading channels." + Retry button + support link
- **Rate limit:** "You've hit today's search limit. Upgrade for more." + upgrade CTA

## 6. Competitor Tracking

Monitors saved channels for new videos, view spikes, cadence changes. URL: `/tracking`.

### 6.1 Overview page

**Layout:** single-column feed with side panel on desktop.

**Top actions bar:**

- "Add channel" button (opens modal: paste URL OR search-and-pick)
- Filter chips: "All activity | New videos | View spikes | Cadence changes"
- Time range: `24h | 7d | 30d | Custom`

**Activity feed (main column):**

- Chronological, most recent first
- Each event card:
  - Channel avatar + name (top-left)
  - Event type icon + label (e.g. "New video", "View spike", "Upload cadence changed")
  - Timestamp (right, relative: "2h ago")
  - Event body (varies by type):
    - New video: thumbnail + title + views + duration + "Extract prompts" button
    - View spike: video card + "crossed 100k views" badge + "Extract prompts"
    - Cadence change: "Was 3/week, now 5/week" + trend sparkline
  - Actions row: Go to channel / Save to notes / Dismiss

**Side panel (right, desktop only):**

- "Tracked channels" list (compact cards)
- Each: avatar + name + last activity timestamp
- Search/filter input at top
- Click a channel → filters feed to that channel

### 6.2 Per-channel detail

URL: `/tracking/[channelId]`. Similar to Niche Finder channel detail but with tracking-specific additions.

**Header additions:**

- "Tracked since \[date\]" chip
- Notification preferences quick-toggle (bell icon)
- Notes button (opens sidebar with private notes for this channel)

**Tabs:**

- **Activity** (default) — timeline of events for this channel
- **Videos** — full video list with view velocity
- **Metrics** — charts: subs, views, upload cadence over time
- **Notes** — user's private notes (markdown editor)

### 6.3 Compare view

URL: `/tracking/compare?ids=id1,id2,id3`. From tracking overview, select 2–3 tracked channels.

**Layout:** side-by-side columns (2–3), one per channel.

**Rows (aligned across channels):**

- Channel header (avatar, name, subs)
- Sub growth chart (last 30 days)
- Views chart
- Upload frequency
- Top 3 videos (most viewed, last 30 days)
- Common tags / topics

Each row highlights the leading channel with `accent` outline.

### 6.4 Notification preferences (settings-nested)

URL: `/settings/notifications` (accessible from tracking + settings).

**Global toggles:**

- New video from tracked channel (in-app / email)
- View spike (in-app / email)
- Cadence change (in-app / email)
- Weekly digest (email only, day of week selector)
- Quiet hours (email only, time range)

**Per-channel override:**

- Table: channel | notifications on/off | override link → opens per-channel modal with individual toggles

### 6.5 Add channel flow (modal)

Opens from Overview "Add channel" button or from Niche Finder "Save" action.

**Two tabs:**

- **Paste URL** — input field, validates YouTube URL, previews channel info before confirm
- **Search** — same interface as mini Niche Finder, but selecting adds directly to tracking

**Post-add:** toast confirmation + redirect to that channel's detail page. First-time addition triggers onboarding-like hint about extracting prompts.

### 6.6 States

- **Empty (no tracked channels):** illustration + "Track channels to see when they post, spike, or change cadence." + Add channel button + link to Niche Finder
- **Loading:** skeleton event cards
- **Error:** feed error banner + retry
- **Tier limit reached:** banner "You've reached your tracking limit (\[X\] of \[Y\]). Upgrade to track more."

## 7. AI Prompts

Turn a winning video into ready-to-use prompts. URL: `/prompts`.

### 7.1 Prompts landing (default state)

**Layout:** two-panel on desktop (left = library / right = generator entry); stacked on mobile.

**Left panel — Prompt Library:**

- Panel title: "Your library"
- Search input
- Filter chips: "All | Titles | Thumbnails | Hooks | Scripts | Descriptions"
- List of saved prompts (each: source video thumbnail + title + generated-at date)
- Click a saved prompt → opens prompt detail (7.4)
- Empty state (new users): "You haven't generated any prompts yet. Extract from a video to start."

**Right panel — New generation:**

- Big card, title: "Generate prompts from a video"
- Two entry paths (tabs):
  - **From tracked channel** — dropdown: pick a tracked channel → pick a video (top 10 by views)
  - **From URL** — paste any YouTube URL
- Optional context inputs:
  - Target audience (free text, e.g. "beginners", "US teens")
  - Tone (dropdown: neutral / casual / educational / dramatic / clickbait-lite)
- Primary button: "Generate prompts" (shows credit cost inline: "Uses 1 credit")
  _(Note, 2026-09-21: this "1 credit" figure was a placeholder — Monetization.md §3.1 is the authoritative cost, 5 credits to generate / 3 to regenerate. Copy should read "Uses 5 credits.")_

### 7.2 Generation loading state

- Same panel structure, right side shows progress
- Header: "Analyzing \[video title\]…"
- Progress items (checked one at a time as the pipeline completes):
  - [ ] Fetching video metadata
  - [ ] Analyzing title pattern
  - [ ] Analyzing thumbnail style
  - [ ] Generating variants
- Skeleton previews of the 5 category cards below
- Cancel button (top-right of card)

### 7.3 Generation results

**Source video summary (top):**

- Video thumbnail (small)
- Title + channel + views + duration
- "Regenerate" button (with feedback options: More casual / Shorter / Less clickbait / More detail)

**Five category cards (stacked):**

1. **Title variants** — 5–10 alternatives, each with copy button + like/dislike
2. **Thumbnail concepts** — 3–5 text descriptions, each with copy button
3. **Hook variants** — 3–5 hook lines (first 30s of video), each with copy button
4. **Script outline** — structured outline (intro / body sections / outro), copy-all button
5. **Description template** — ready-paste description, copy button

**Save actions (bottom):**

- "Save all to library" (primary)
- "Save selected" (if user picked specific items)
- "Discard" (ghost, confirms first)

_(Note, 2026-09-21: generation already persists the row on success — Backend-Schema.md §3.4 stores one output blob per row, nothing partial to select. "Save all"/"Save selected" dropped; only "Discard" (deletes the row) and "Generate another" remain. See DECISIONS.md D-031.)_

### 7.4 Prompt detail (from library)

URL: `/prompts/[promptId]`.

- Header: source video + generation date + tags
- Full 5-category output as generated
- Edit inline (any prompt is editable, save reverts if unchanged)
- Regenerate button (uses new credit)
- Delete button (confirmation modal)

### 7.5 Regenerate with feedback

- Opens as a small modal above current results
- Feedback chips (multi-select): "More casual", "Shorter", "Less clickbait", "More educational", "More detail"
- Optional free-text field for custom feedback
- Regenerate button (shows new credit cost)
- On completion: fresh results replace current view; original stays in library as a version

### 7.6 States

- **Loading (during generation):** see 7.2
- **Error (generation failed):** "Something went wrong. Your credit was not charged. Retry?"
- **Video unsupported (no transcript, private, deleted):** "This video can't be analyzed — \[reason\]. Try a different one."
  _(Note, 2026-09-21: narrowed to private/deleted only. A missing/unfetchable transcript no longer hard-blocks generation — it soft-degrades instead (all 5 categories still generate from title/description/tags; hook variants are inferred from title+description rather than the transcript). Only "Hook variants" in PRD.md §6.3 actually depends on the transcript, so blocking the whole generation over it was a worse product experience than degrading gracefully. See DECISIONS.md.)_
- **Rate/credit limit:** "Not enough credits. \[Get more\]" with upgrade CTA

## 8. Settings + Admin

### 8.1 Settings

URL: `/settings`. Left sidebar with sub-nav, main content on right.

**Sub-nav (left):**

- Profile
- Notifications
- Billing
- Connections
- Preferences
- Danger zone

**8.1.1 Profile** (`/settings/profile`):

- Avatar (upload, click to change)
- Name, email (email read-only if OAuth)
- Time zone (auto-detected, editable)
- Language (UI language, single option in MVP: English)
- Save button (only enabled when dirty)

**8.1.2 Notifications** (`/settings/notifications`):

Spec in Section 6.4 (Competitor Tracking notification preferences). Same page.

**8.1.3 Billing** (`/settings/billing`):

- Current plan card: tier name, price, next billing date, credits remaining this cycle
- "Upgrade" or "Manage plan" button (opens billing portal per D-010 provider)
- Payment method (card last-4, expiry)
- Billing history table: date, amount, invoice link
- "Cancel plan" link (confirms first, offers pause option)

**8.1.4 Connections** (`/settings/connections`):

- Google account (email shown, disconnect button)
- YouTube channel (if connected: channel name + disconnect, else: connect button)
- Slack (Phase 3, team tier only)
- Zapier (Phase 3, if implemented)

**8.1.5 Preferences** (`/settings/preferences`):

- Theme: system / dark / light (radio)
- Default view (grid / list) for Niche Finder
- Density (compact / comfortable) for tables
- Keyboard shortcuts on/off
- Enable beta features (feature flag opt-in list)

**8.1.6 Danger zone** (`/settings/danger`):

- Export all data (email link)
- Delete account (confirmation with typing account name)

### 8.2 Admin panel entry

URL: `/admin` (super-admin role only; 403 for anyone else).

**Access:** avatar menu → "Admin panel" (only visible if user has super-admin role). Never linked from user-facing surfaces.

**Layout:** distinct chrome from user app — top bar with "ADMIN" badge (warning-color) so it's impossible to confuse with normal use.

**Sub-nav:**

- Dashboard
- Users
- Blog CMS
- Revenue
- API Quotas
- &#91;Module 6 — TBD per D-016\]
- Tools
- Automation Tools

Each admin module's detailed spec goes in a dedicated Admin-Panel-Spec.md (to be written when admin build starts — not part of the initial 15).

**Impersonation:** from Users detail, "Impersonate" button opens user's app in the current session with a persistent yellow banner: "Impersonating \[name\]. Stop" — stop returns to admin panel.
