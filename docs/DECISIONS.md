# YTNiches — Decisions Log

2026-09-19 · @Someone

---

## 1. How to Use This Doc

DECISIONS.md is the running log of every product, technical, or strategic decision made for YTNiches. Every decision gets a stable ID (D-XXX), a status, and a full trail of options, trade-offs, and the final call.

**Rules:**

- Every open decision that blocks a spec doc must resolve before that doc is built
- Resolved decisions can be revisited — but only with a dated note explaining what changed
- IDs are stable across the project's lifetime — never renumber
- When a decision resolves, its status flips to Resolved (with date), and every doc that depends on it updates

**Entry template (copy for new entries):**

### D-XXX: \[Short title\]

- **Status:** Open | Resolved (YYYY-MM-DD) | Revisited (YYYY-MM-DD)
- **Impacts:** which docs / features / phases depend on this decision
- **Options:**
  - A: description
  - B: description
- **Trade-offs:** what each option costs and gains
- **Recommendation:** initial preference + why
- **Final call:** decision + rationale (added when resolved)

## 2. Resolved Decisions

Decisions locked before or during the strategy sessions of 2026-09-17 through 2026-09-19.

---

### D-001: Tech stack

- **Status:** Revisited (2026-09-20)
- **Impacts:** Every backend + frontend spec, hosting cost model, Backend-Schema.md, TRD.md
- **Final call:** Next.js + TypeScript + Tailwind CSS (frontend), PostgreSQL via Supabase (DB), Supabase Auth with Google OAuth (auth), Redis via Upstash (caching), Resend (email). Billing provider unresolved (see D-010).
- **Rationale:** Modern SaaS-standard stack, low ops overhead, generous free tiers through early growth, TypeScript for maintainability given the doc-first workflow.
- **2026-09-20 update (Phase 0 §2.1 scaffold):** pnpm pinned at `pnpm@11.1.1` (via `packageManager` in package.json / Corepack). Docs previously assumed 9.x, which was current when D-001 was written; 11.1.1 is the actual latest at scaffold time, and pinning the real installed version is correct rather than chasing a stale target. Scaffold also landed on Next.js 16.3.5 (satisfies "14+") and Tailwind v4 — the latter drops `tailwind.config.ts` in favor of CSS `@theme` blocks in `app/globals.css`; Implementation-Plan.md §2.4 and Design-System.md §6.3 carry a note flagging this pending their own update when Design-System-in-code work starts.

---

### D-002: Core positioning

- **Status:** Resolved (2026-09-19)
- **Impacts:** Landing-Copy.md, PRD, all marketing copy, VS pages
- **Final call:** "Research + Execution" — not just research. YTNiches continues where Nexlev / OutlierKit / TubeLab stop.
- **Rationale:** All three named competitors focus only on niche finding + outliers. Mac's own founder pain ("found the niche, then got stuck") maps directly to the gap they leave. Positioning is honest, defensible, and doesn't attack competitors.

---

### D-003: Landing page style

- **Status:** Resolved (2026-09-19)
- **Impacts:** Landing-Page-Spec.md, Illustration-Brief.md, Interaction-Spec.md, Hero-Video-Script.md, timeline (adds 4–6 weeks), budget (illustrations)
- **Options:**
  - A: Fibery-inspired ambitious — custom illustrations, interactive elements, video hero, personality-first copy
  - B: Fibery principles + BagUI blocks — simpler execution, faster to ship
- **Final call:** Option A
- **Rationale:** Faceless creators respond to personality; all named competitors look generic; differentiation warranted despite higher build cost.

---

### D-004: Landing copy voice

- **Status:** Resolved (2026-09-19)
- **Impacts:** Landing-Copy.md, blog voice, all marketing surfaces
- **Options:**
  - A: Founder-first (Mac's personal voice)
  - B: Brand voice (YTNiches as an entity, third person)
  - C: Hybrid (brand + founder sections)
- **Final call:** Option A — founder-first
- **Rationale:** Faceless creators are personal-brand people themselves; they relate to real founders more than to faceless SaaS companies. Fibery's success with founder-first voice validates the pattern.

---

### D-005: Blog reference structure

- **Status:** Resolved (2026-09-19)
- **Impacts:** Blog schema in Backend-Schema.md, Blog CMS in admin panel, marketing site build
- **Final call:** Backlinko-inspired — categories + tags filtering, multi-author with author pages, featured post at top, category-based sections on homepage, TOC on individual posts.
- **Rationale:** Backlinko's structure is proven at scale for SEO-focused content sites; matches YTNiches' Traffic Layer strategy.

---

### D-006: Blog implementation approach

- **Status:** Resolved (2026-09-19)
- **Impacts:** Blog build, content workflow, developer scope
- **Options:**
  - A: Tailark blocks
  - B: 21st.dev community components
  - C: Custom MDX + Tailwind Typography
- **Final call:** Option C — MDX-based custom
- **Rationale:** Blog is content-heavy and structurally simple. MDX gives version-controlled content, fast static generation, easy custom components in articles, and full design-system control without external dependency.

---

### D-007: Dashboard design direction

- **Status:** Resolved (2026-09-19)
- **Impacts:** Design-System.md, every in-app screen spec, UI-UX-Flow.md
- **Options:**
  - A: Single reference (e.g. 80% Linear + 20% Ahrefs)
  - B: Layered inspiration — different reference per feature area
- **Final call:** Option B — 4-layer stack. Overall shell = Linear (sidebar, command palette, speed). Research pages = Ahrefs (filters, tables, metric cards). Competitor tracking + workspace = Attio (relational cards, custom views). Content calendar = Notion Calendar. Personality layered on top from Fibery.
- **Rationale:** Each reference solves a different problem; no single reference covers YTNiches' feature spread. This is standard modern-SaaS composition, not Frankenstein.

---

### D-008: Theme default

- **Status:** Resolved (2026-09-19)
- **Impacts:** Design-System.md (dark tokens are primary), every component spec
- **Final call:** Dark mode default, light mode as option
- **Rationale:** Two of four dashboard references (Linear, Notion Calendar) are dark-native. Matches faceless-creator work patterns (long editing sessions, night hours). Ahrefs and Attio patterns will be adapted — patterns, not aesthetics.

---

### D-009: Workflow — docs before code

- **Status:** Resolved (2026-09-19)
- **Impacts:** All build activity; determines how the developer handoff works
- **Final call:** Every product, technical, design decision is written down before code is shipped. Phased delivery (MVP → Retention → Team) with checkpoints after each phase.
- **Rationale:** Previous MVP failed on execution drift — developer filling gaps in unclear specs. This rebuild inverts that: nothing built without a doc that names it in copy-paste form for the developer.

## 3. Open Decisions

Decisions that still need to close before their dependent docs / features can be built. Ordered by build-priority — the earlier ones block more downstream work.

---

### D-010: Billing provider

- **Status:** Resolved (2026-09-19)
- **Impacts:** Monetization.md, backend billing integration, checkout UX, tax handling, Backend-Schema.md (subscription tables)
- **Options:**
  - A: Stripe
  - B: Paddle
  - C: Creem.io
- **Trade-offs:**
  - Stripe: bigger ecosystem, more docs, more flexibility, requires the merchant to handle tax (or add Stripe Tax); developer familiarity is common
  - Paddle: Merchant of Record model — handles VAT/sales tax globally, simpler for solo founder; less flexible, higher fees
  - Creem: Merchant of Record model, simpler solo-founder integration, competitive fees (3.9% + $0.40)
- **Final call:** Creem.io (Merchant of Record). Full integration spec in Monetization.md §4. This entry was left "Open" after Monetization.md resolved it — housekeeping fix, no new decision made; Monetization.md is the authoritative record per CLAUDE.md §3.2 (newest record wins).

---

### D-011: Pricing tiers structure

- **Status:** Resolved (2026-09-19)
- **Impacts:** Monetization.md, Landing pricing section, feature gating throughout app
- **Options:**
  - A: 3 tiers (Free / Pro / Team)
  - B: 4 tiers (Free / Starter / Pro / Team)
  - C: 2 tiers + credits top-up (Free / Pro with pay-as-you-go credits)
  - D: No permanent free tier — 14-day Pro-access trial + Starter / Pro / Team paid tiers, each with a monthly credit allocation
- **Trade-offs:** More tiers = more upsell surface but more decision friction. Credits-based = fair for variable usage but harder to communicate value. A permanent free tier invites free-tier abuse against per-action AI/API costs (Monetization.md §1.2).
- **Final call:** Option D. Starter $19/mo, Pro $49/mo, Team $99/mo (3 seats). No permanent free tier — trial only. Full structure in Monetization.md §2. This entry was left "Open" after Monetization.md resolved it — housekeeping fix, no new decision made; Monetization.md is the authoritative record per CLAUDE.md §3.2 (newest record wins). Actual pricing benchmarking against Nexlev/OutlierKit/TubeLab (referenced in the original recommendation) still tracked as open in Monetization.md §1.4.

---

### D-012: Credit costs per action

- **Status:** Resolved (2026-09-19)
- **Impacts:** Monetization.md, backend usage tracking, UI credit displays
- **Cost dimensions to define:**
  - Niche search (per query)
  - Competitor add to tracking
  - Prompt generation (per video analyzed)
  - Outlier scan (per channel)
  - Thumbnail idea generation
- **Trade-offs:** Higher credits = more perceived value but slower quota consumption limits upsell. Lower = frequent upsell prompts but risks feeling stingy.
- **Final call:** Niche search = 1 credit, add channel to tracking = 1 credit, prompt generation = 5 credits, regenerate with feedback = 3 credits, outlier scan (Phase 2) = 2 credits, thumbnail idea (Phase 2) = 5 credits. Full table + rationale in Monetization.md §3.1. This entry was left "Open" after Monetization.md resolved it — housekeeping fix, no new decision made; Monetization.md is the authoritative record per CLAUDE.md §3.2 (newest record wins).

---

### D-013: Refresh cadence per tier

- **Status:** Resolved (2026-09-19)
- **Impacts:** Backend-Schema.md (poll job schedules), TRD.md (API quota model), Monetization.md (feature gating)
- **Options:**
  - A: Free = daily, Starter = 12h, Pro = 6h, Team = 1h
  - B: Free = weekly, Starter = daily, Pro = 6h, Team = real-time
  - C: Real-time for all (uses API quota heavily; needs cost model)
  - D: Starter = 24h, Pro = 6h, Team = 1h (no permanent free tier, per D-011)
- **Trade-offs:** Faster refresh = better product feel but costs API quota linearly. Free tier cadence directly affects free-tier cost model.
- **Final call:** Option D. Starter 24h, Pro 6h, Team 1h. Full table in Monetization.md §2.5. This entry was left "Open" after Monetization.md resolved it — housekeeping fix, no new decision made; Monetization.md is the authoritative record per CLAUDE.md §3.2 (newest record wins).

---

### D-014: Free tools access

- **Status:** Open
- **Impacts:** SEO strategy, funnel conversion, marketing site build
- **Options:**
  - A: Gated — free tools require signup (even free-tier)
  - B: Open — free tools work without any signup
  - C: Partial — basic tool free, advanced results gated behind signup
- **Trade-offs:** Open = better SEO (Google prefers pages that work), higher traffic, lower conversion per visitor. Gated = fewer visitors, higher signup rate per visitor.
- **Recommendation:** Option C. Basic result open (satisfies search intent + SEO), advanced result gated (drives signups). Follows TubeBuddy / VidIQ pattern.
- **Final call:** —

---

### D-015: OAuth as primary auth

- **Status:** Open
- **Impacts:** Onboarding spec, Security.md, Backend auth logic
- **Options:**
  - A: Google-only (no email/password option)
  - B: Google + email/password
  - C: Google + email/password + Apple
- **Trade-offs:** Google-only = simpler build, faster signup for most, alienates users without Google account or those who avoid Google. Multiple providers = more code, better inclusion.
- **Recommendation:** Option B. Google reduces signup friction for the majority; email/password serves the minority who need it, adds \~1 day of work.
- **Final call:** —

---

### D-016: Admin panel module 6

- **Status:** Open
- **Impacts:** Admin panel spec
- **Options:**
  - A: Support / Tickets (in-app user support inbox)
  - B: Broadcast Notifications (send announcements to user segments)
  - C: Announcements (release notes / changelog editor)
  - D: Feature Flags (toggle features per user / segment)
  - E: Analytics deep-dive (custom queries, funnel builder)
- **Recommendation:** Option D (Feature Flags) if the plan is aggressive iteration; Option A (Support) if solo founder without support channel yet.
- **Final call:** —

---

### D-017: Blog author scope at launch

- **Status:** Open
- **Impacts:** Blog schema, content workflow, launch content strategy
- **Options:**
  - A: Solo (Mac only), multi-author schema built but only one author record
  - B: Multi-contributor from day 1 (Mac + 1–2 guest writers lined up)
- **Recommendation:** Option A. Ship with schema ready for multi-author, add contributors when they exist. Avoids waiting on a hire.
- **Final call:** —

---

### D-018: AI Prompts in MVP or Phase 2

- **Status:** Resolved (2026-09-21)
- **Impacts:** PRD Phase 1 scope, Monetization.md (AI cost per user), launch timeline
- **Options:**
  - A: AI Prompts in Phase 1 MVP (current PRD assumption)
  - B: AI Prompts deferred to Phase 2, MVP ships with Niche Finder + Competitor Tracking + Onboarding only
- **Trade-offs:** In MVP = stronger differentiation vs Nexlev/OutlierKit/TubeLab at launch, higher AI cost per free user (risk). Deferred = leaner MVP, faster ship, but weaker "Research + Execution" story at launch.
- **Recommendation:** Option A, gated by credit limits per tier so free-tier AI cost is bounded. This is what makes the launch position true.
- **Final call:** Option A. AI Prompts ships in Phase 1 (Task 3, Implementation-Plan.md §3.1 build order item 3), gated by the credit costs in Monetization.md §3.1 (generation 5 / regenerate 3).

---

### D-019: Developer for the rebuild

- **Status:** Open
- **Impacts:** Implementation-Plan.md checkpoint structure, timeline, quality risk
- **Options:**
  - A: Same developer as before, with tighter checkpoints and phase gates
  - B: New developer
  - C: Mac codes it (with heavy AI assist)
- **Trade-offs:** Same dev = context carry-over but same execution risk if the problem was skill/attention; new dev = fresh execution but ramp-up cost; solo = full control but slower.
- **Recommendation:** Depends on Mac's diagnosis of why the last build failed — spec quality (fix with tighter docs) vs developer execution (fix with new hire).
- **Final call:** —

---

### D-020: Founder story specifics for Landing-Copy

- **Status:** Open (blocks Landing-Copy.md)
- **Impacts:** Landing-Copy.md, hero copy, About / founder section, VS pages tone
- **Inputs needed from Mac:**
  - Which niche he tried on his own channel (specific name; can stay private if uncomfortable)
  - Which "stuck" moment mattered most (competitor spying / outlier detection / content ideas / script writing / consistency)
  - Contrarian opinion — a strong take that most faceless-creator advice gets wrong
- **Recommendation:** Book a 20-minute founder discovery to extract these, then draft copy in Mac's voice. Cannot fake this input.
- **Final call:** —

---

### D-022: Test runner

- **Status:** Resolved (2026-09-20)
- **Impacts:** CLAUDE.md §2.4 (testing conventions), every unit/component test going forward, jest-axe accessibility tests (Design-System.md §6.2, Implementation-Plan.md §2.4)
- **Final call:** Vitest + React Testing Library + jest-axe. No test runner existed in the repo before Phase 0 §2.4; this resolves it project-wide, not just for the component library.
- **Rationale:** CLAUDE.md §2.4 specifies "jest-axe" as the accessibility-testing library/matcher, not literally the Jest runner — `jest-axe`'s `toHaveNoViolations` matcher works the same under Vitest's `expect.extend`. Classic Jest has known friction with Next.js 16's Turbopack/SWC toolchain; Vitest has none.

---

### D-023: Component implementation approach

- **Status:** Resolved (2026-09-20)
- **Impacts:** TRD.md §2 (frontend stack — see §2.8), components/ui/ build for Phase 0 §2.4 and every feature UI after
- **Final call:** Radix UI primitives + cmdk for the command palette, scaffolded via the shadcn CLI, restyled entirely to Design-System.md tokens. Plus class-variance-authority + clsx + tailwind-merge for variant/className management.
- **Rationale:** Focus traps, ARIA semantics, and keyboard navigation are correct in Radix out of the box. Hand-rolling these to WCAG 2.1 AA (Design-System.md §6.2) would take longer and be less reliable. The shadcn pattern (unstyled accessible primitives + our own tokens on top) is exactly what Design-System.md §5 describes — it just didn't name the library.

---

### D-024: Phase 0 CI gate — deferred

- **Status:** Open
- **Impacts:** Implementation-Plan.md §2.2, §2.6 item 2
- **Context:** Implementation-Plan.md §2.6 item 2 requires "CI passes on a sample PR (lint + typecheck + test all green)." The `.github/workflows/ci.yml` stub exists but contains only a placeholder echo command. §2.2 (real GitHub Actions pipeline) was not completed because no GitHub remote exists yet — local git only.
- **Final call:** Phase 0 declared conditionally complete. §2.2 is the first task after a GitHub remote is configured. Phase 1 proceeds without a CI gate, with the explicit understanding that §2.2 must be done before any real feature PRs are reviewed. Deferred, not skipped — Mac to configure the GitHub remote when ready, then §2.2 immediately.

---

### D-025: Supabase type generation workflow

- **Status:** Resolved (2026-09-21)
- **Context:** `pnpm supabase:types` uses the Supabase CLI, which requires `supabase login` / `SUPABASE_ACCESS_TOKEN`. This isn't available in the Claude Code environment. Running the script silently wipes `database.types.ts` — it fails, and the `>` redirect overwrites the file with the auth-error JSON.
- **Final call:** Generate types via the Supabase MCP tool (`generate_typescript_types`) and apply by hand after each migration set. The script stays in `package.json` for future use once a proper token is available, marked with a warning comment.
- **Action taken:** Added the caveat to `database.types.ts`'s header — do NOT run `pnpm supabase:types` without a valid token.

---

### D-026: Add-channel modal search tab credit cost

- **Status:** Open
- **Context:** The "Search" tab in AddChannelModal calls searchNichesAction directly, which consumes 1 credit per search. This is consistent with Niche Finder billing but may feel unexpected to users adding a channel (they're not "doing research," they're navigating). Alternative: a separate no-credit channel-lookup endpoint.
- **Impacts:** Monetization.md §3.1, UX of tracking flow
- **Recommendation:** Keep for MVP (consistent billing model, low-friction to implement), revisit if user feedback flags it as confusing.
- **Final call:** —

---

### D-027: Transcript fetching — unofficial timedtext endpoint

- **Status:** Resolved (2026-09-21)
- **Context:** TRD.md §6.2 says "YouTube auto-captions where available," but the official `captions.download` endpoint requires OAuth consent from the video's owner — it can't fetch captions for an arbitrary third-party (competitor) video with just an API key. The only practical way to get transcript text for someone else's public video is YouTube's unofficial, undocumented `timedtext` endpoint, which is what effectively every "YouTube transcript" tool in the wild actually uses.
- **Final call:** Use the unofficial `timedtext` endpoint. Hard fallback to an empty transcript on any failure (network error, no captions track, endpoint shape change) — never throws, never blocks generation. Called out in code with a comment naming it as unofficial, plus the endpoint format, since it isn't part of documented YouTube Data API v3 and could change or break without notice.

---

### D-028: Prompt generation architecture — synchronous, not async + polling

- **Status:** Resolved (2026-09-21)
- **Context:** UI-UX-Flow.md §7.2 shows a 5-item progress checklist ticked one step at a time, and TRD.md §6.2 says "prompt generation is UI-poll based" — taken literally, that implies a background job (Inngest) plus a polling Server Action, mirroring Task 2's channel-sync architecture.
- **Trade-offs:** Async + polling matches the literal spec mechanism and would support a real multi-minute pipeline later, but is meaningfully more infrastructure (job definition, status table or row, polling action, client poll loop) for a call that, in practice, completes in ~5-15 seconds. Synchronous is far simpler to build, test, and reason about, and fits comfortably inside a Server Action's timeout budget.
- **Final call:** A single synchronous Server Action does the full generation (fetch metadata, fetch transcript, call the AI, write the row) and returns the finished result. The UI-UX-Flow §7.2 checklist is rendered as a cosmetic, client-side progressive reveal (timed, not server-driven) rather than real step-by-step status tracking. This is a deliberate deviation from TRD §6.2's "UI-poll based" framing — revisit if generation latency grows enough to need real progress reporting.

---

### D-029: AI model tiering deferred — single model for MVP

- **Status:** Resolved (2026-09-21)
- **Context:** TRD.md §6.2 suggests a cheaper model for title variants + hooks and a higher-tier model for the full outline, i.e. two model configs and likely two API calls per generation.
- **Final call:** Single model (`claude-sonnet-5`, via `@anthropic-ai/sdk`) generates all 5 categories in one call for Phase 1. Simpler to build and reason about, one cost line to monitor. Revisit tiering once real per-category cost/quality data exists to justify the added complexity.

---

### D-030: Pre-built starter prompts deferred

- **Status:** Open
- **Context:** PRD.md §6.3's Prompt Library lists "Pre-built starter prompts (curated by YTNiches) for common video types" as in-scope. This is a content-curation feature (someone has to write and maintain the starter prompt content), not just a code change, and Task 3's build plan doesn't include a content-authoring step.
- **Impacts:** PRD.md §6.3 Prompt Library section, new-user empty-state experience
- **Recommendation:** Defer past Task 3, same treatment as the `notes` table (Backend-Schema.md §3.5) — both are real PRD-listed features that don't block the core generate/save/regenerate loop.
- **Final call:** —
