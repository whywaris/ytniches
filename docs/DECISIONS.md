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

- **Status:** Open
- **Impacts:** Monetization.md, backend billing integration, checkout UX, tax handling, Backend-Schema.md (subscription tables)
- **Options:**
  - A: Stripe
  - B: Paddle
- **Trade-offs:**
  - Stripe: bigger ecosystem, more docs, more flexibility, requires the merchant to handle tax (or add Stripe Tax); developer familiarity is common
  - Paddle: Merchant of Record model — handles VAT/sales tax globally, simpler for solo founder; less flexible, higher fees
- **Recommendation:** Paddle for a solo-founder SaaS with global customers (Mac's likely case). Reconsider if Mac plans to hire a finance operator early.
- **Final call:** —

---

### D-011: Pricing tiers structure

- **Status:** Open
- **Impacts:** Monetization.md, Landing pricing section, feature gating throughout app
- **Options:**
  - A: 3 tiers (Free / Pro / Team)
  - B: 4 tiers (Free / Starter / Pro / Team)
  - C: 2 tiers + credits top-up (Free / Pro with pay-as-you-go credits)
- **Trade-offs:** More tiers = more upsell surface but more decision friction. Credits-based = fair for variable usage but harder to communicate value.
- **Recommendation:** Benchmark Nexlev / OutlierKit / TubeLab actual pricing first (blocks decision). Default lean: 3 tiers with per-tier credit allocations.
- **Final call:** —

---

### D-012: Credit costs per action

- **Status:** Open (blocks after D-011)
- **Impacts:** Monetization.md, backend usage tracking, UI credit displays
- **Cost dimensions to define:**
  - Niche search (per query)
  - Competitor add to tracking
  - Prompt generation (per video analyzed)
  - Outlier scan (per channel)
  - Thumbnail idea generation
- **Trade-offs:** Higher credits = more perceived value but slower quota consumption limits upsell. Lower = frequent upsell prompts but risks feeling stingy.
- **Recommendation:** Model YouTube API + AI generation cost per action, then price credits at 3–5x cost to fund infra + margin. Deferred until D-011 closes.
- **Final call:** —

---

### D-013: Refresh cadence per tier

- **Status:** Open
- **Impacts:** Backend-Schema.md (poll job schedules), TRD.md (API quota model), Monetization.md (feature gating)
- **Options:**
  - A: Free = daily, Starter = 12h, Pro = 6h, Team = 1h
  - B: Free = weekly, Starter = daily, Pro = 6h, Team = real-time
  - C: Real-time for all (uses API quota heavily; needs cost model)
- **Trade-offs:** Faster refresh = better product feel but costs API quota linearly. Free tier cadence directly affects free-tier cost model.
- **Recommendation:** Option A. Free tier daily keeps API cost low; Pro at 6h feels fresh enough; Team at 1h justifies the premium.
- **Final call:** —

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

- **Status:** Open
- **Impacts:** PRD Phase 1 scope, Monetization.md (AI cost per user), launch timeline
- **Options:**
  - A: AI Prompts in Phase 1 MVP (current PRD assumption)
  - B: AI Prompts deferred to Phase 2, MVP ships with Niche Finder + Competitor Tracking + Onboarding only
- **Trade-offs:** In MVP = stronger differentiation vs Nexlev/OutlierKit/TubeLab at launch, higher AI cost per free user (risk). Deferred = leaner MVP, faster ship, but weaker "Research + Execution" story at launch.
- **Recommendation:** Option A, gated by credit limits per tier so free-tier AI cost is bounded. This is what makes the launch position true.
- **Final call:** — (this is the question in the PRD comment)

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
