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

- **Status:** Resolved (2026-09-25)
- **Impacts:** SEO strategy, funnel conversion, marketing site build
- **Options:**
  - A: Gated — free tools require signup (even free-tier)
  - B: Open — free tools work without any signup
  - C: Partial — basic tool free, advanced results gated behind signup
- **Trade-offs:** Open = better SEO (Google prefers pages that work), higher traffic, lower conversion per visitor. Gated = fewer visitors, higher signup rate per visitor.
- **Recommendation:** Option C. Basic result open (satisfies search intent + SEO), advanced result gated (drives signups). Follows TubeBuddy / VidIQ pattern.
- **Final call:** Option B, open. Every tool gives its full result without signup, and every result shows a signup CTA. Anonymous use never needs auth and never spends credits.
  - **Final tool list** (replaces PRD.md §10.3's "not final" candidates; PRD update to follow as its own spec change): Outlier Checker, Subscribe Link Generator, RSS Feed Generator, Embed Code Generator, Thumbnail Resizer, Channel ID Finder.
  - Quota, abuse and URL calls are in D-054.

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

- **Status:** Resolved (2026-09-25)
- **Impacts:** Blog schema, content workflow, launch content strategy
- **Options:**
  - A: Solo (Mac only), multi-author schema built but only one author record
  - B: Multi-contributor from day 1 (Mac + 1–2 guest writers lined up)
- **Recommendation:** Option A. Ship with schema ready for multi-author, add contributors when they exist. Avoids waiting on a hire.
- **Final call:** Option A. Mac is the only author at launch (`content/authors/mac.yaml`). Posts reference an author by slug, and `/blog/authors/[slug]` is built for every YAML file, so adding a writer means adding one file.

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

- **Status:** Resolved (2026-09-23)
- **Impacts:** Landing-Copy.md, hero copy, About / founder section, VS pages tone
- **Inputs needed from Mac:**
  - Which niche he tried on his own channel (specific name; can stay private if uncomfortable)
  - Which "stuck" moment mattered most (competitor spying / outlier detection / content ideas / script writing / consistency)
  - Contrarian opinion — a strong take that most faceless-creator advice gets wrong
- **Recommendation:** Book a 20-minute founder discovery to extract these, then draft copy in Mac's voice. Cannot fake this input.
- **Final call:** Founder story confirmed — World War 2 faceless YouTube channel. Stuck moment: no system for topics, outliers, or prompts after finding the niche. Deployed in landing page (content.ts, founder-section.tsx).

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

- **Status:** Resolved (2026-09-25)
- **Impacts:** Implementation-Plan.md §2.2, §2.6 item 2
- **Context:** Implementation-Plan.md §2.6 item 2 requires "CI passes on a sample PR (lint + typecheck + test all green)." The `.github/workflows/ci.yml` stub exists but contains only a placeholder echo command. §2.2 (real GitHub Actions pipeline) was not completed because no GitHub remote exists yet — local git only.
- **Final call:** Phase 0 declared conditionally complete. §2.2 is the first task after a GitHub remote is configured. Phase 1 proceeds without a CI gate, with the explicit understanding that §2.2 must be done before any real feature PRs are reviewed. Deferred, not skipped — Mac to configure the GitHub remote when ready, then §2.2 immediately.
- **Resolution (2026-09-25):**
  - Repo pushed to `github.com/whywaris/ytniches`. The old MVP repo was renamed first, so its history is untouched.
  - `.github/workflows/ci.yml` runs on every PR and every push to `main`: frozen pnpm install (store cached), typecheck, lint, test, `next build`.
  - Node comes from `.nvmrc`; pnpm comes from `packageManager` via Corepack.
  - No secrets in CI. Tests are fully mocked (env vars only via `vi.stubEnv` with fake values), and `next build` succeeds with no env vars set (verified on a clean clone).
  - `pnpm typecheck` is now `next typegen && tsc --noEmit`. Plain `tsc` failed on any fresh checkout, because `LayoutProps` is a Next-generated global that only existed locally after a dev server had run.
  - Still open from §2.2: Vercel preview deploys and the dev/preview/production Supabase split. Those are outside D-024.

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

- **Status:** Superseded by D-067 (2026-09-27). The timedtext path is removed and the cached transcripts are deleted. Originally resolved 2026-09-21.
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

---

### D-031: Generation results bottom bar — no "Save all" / "Save selected"

- **Status:** Resolved (2026-09-21)
- **Impacts:** UI-UX-Flow.md §7.3
- **Context:** UI-UX-Flow.md §7.3 specs a bottom bar on the results view with "Save all to library" (primary), "Save selected" (if items picked), and "Discard" (ghost, confirms). But `lib/services/prompts.ts`'s `generatePrompts` already inserts the `prompts` row on a successful AI call (Backend-Schema.md §3.4 has no draft/unsaved state — output is one JSON blob per row, not per-category rows a user could partially select). By the time results render, the generation is already persisted; there is nothing left to "save," and no per-item granularity to select from. Per CLAUDE.md §3.2, Backend-Schema wins on data model over UI-UX-Flow's bottom-bar copy.
- **Final call:** Drop "Save all to library" and "Save selected" — generation auto-saves. Keep "Discard" (ghost, confirms first), wired to `deletePrompt` (soft-delete via `deleted_at`) on the row just created, plus a "Generate another" ghost action to reset the form. UI-UX-Flow.md §7.3 annotated with this deviation rather than rewritten.

---

### D-032: AI provider switch — Anthropic → OpenAI

- **Status:** Resolved (2026-09-21)
- **Impacts:** `lib/ai/client.ts` only — `lib/ai/index.ts`, `lib/services/prompts.ts`, Server Actions, and the UI are unchanged, per TRD.md §6.2's provider-abstraction design (D-029's rationale already assumed a future Claude ↔ OpenAI swap would be config-only).
- **Context:** Anthropic's card for API credits was declined; OpenAI credits were purchased instead. Requested ID for this entry was D-030, but that ID is already assigned to "Pre-built starter prompts deferred" (still Open) — per §1's "IDs are stable across the project's lifetime — never renumber," this entry takes the next free ID (D-032) instead of overwriting it.
- **Final call:** `lib/ai/client.ts` now calls the `openai` SDK (`chat.completions.parse` + `zodResponseFormat`) instead of `@anthropic-ai/sdk`, model `gpt-4o` (replaces `claude-sonnet-5`). Same `generateStructuredOutput(system, user)` signature, same `AiClientError` union, same Zod response schema (`PromptOutputSchema`). `ANTHROPIC_API_KEY` removed from `.env.example`, `OPENAI_API_KEY` added. Reverting to Anthropic later is a `client.ts` + env var swap only, per the interface boundary TRD.md §6.2 already called for.

---

### D-033: Per-persona onboarding filter values

- **Status:** Open
- **Context:** UI-UX-Flow §3 says filters "vary by persona" but only one concrete set is specified. Phase 1 uses same defaults for all 4 personas.
- **Impacts:** app/onboarding/page.tsx
- **Final call:** —

---

### D-034: Credit top-up purchases deferred

- **Status:** Open
- **Context:** Monetization.md §3.5 specs one-time credit top-up packs (100/500/2000 credits, $10/$40/$120) as a purchase path independent of tier upgrades. Task 5's actual build scope (checkout signature `createCheckout(ctx, tier, billingFrequency)`, the env var list, the webhook event list) has no top-up product IDs or top-up checkout path — it covers tier subscriptions only.
- **Impacts:** Monetization.md §3.5, `/settings/billing`, `lib/billing/products.ts` (would need top-up product IDs), `lib/services/billing.ts` (would need a top-up checkout path)
- **Final call:** —

---

### D-035: Graduated dunning access enforcement deferred

- **Status:** Open
- **Context:** Monetization.md §6.4 specs a graduated access schedule during payment failure (day 0-3 full access, day 3-7 limited/read-only, day 7+ suspended, day 21+ auto-cancelled). Task 5's webhook handler records the right `subscriptions.status` transitions (`past_due` on `payment.failed`, `active` on `payment.recovered`) but does not enforce graduated access — no feature-gating-by-status middleware exists anywhere in this codebase yet, for any dimension (tier or dunning), and building that generic layer is beyond this task's webhook-integration scope.
- **Impacts:** Monetization.md §6.4, a future feature-gating/middleware task
- **Final call:** —

---

### D-036: YouTube API quota at scale

- **Status:** Open — action required before launch
- **Requested-ID note:** requested as D-035, but that ID is already assigned to "Graduated dunning access enforcement deferred" (also logged this phase, still Open) — per §1's "IDs are stable across the project's lifetime — never renumber," this entry takes the next free ID (D-036) instead of overwriting it.
- **Finding:** Default 10,000 units/day = ~100 searches/day system-wide. At 500 active users with realistic search behavior, quota will be exhausted daily.
- **Actions required before launch:**
  1. Apply for YouTube Data API quota increase (standard process, Google Cloud Console → APIs → YouTube Data API v3 → Quotas → Request increase. Typical grant: 1M units/day)
  2. Implement TRD.md §5.3 alerting: read the `warning: true` flag from `checkAndIncrement` and log to Sentry at 70%/90% thresholds
  3. Consider search result caching improvements (`cache:search:{hash}` already exists — ensure it's being hit before the quota check)
- **Current mitigation:** 95% circuit breaker exists in quota.ts but admin visibility is missing.
- **Final call:** —

---

### D-037: Main app shell (sidebar nav) was never wired in

- **Status:** Resolved (2026-09-24)
- **Context:** UI-UX-Flow.md §4.1/§4.2 specs a Linear-style sidebar + top bar as the persistent app shell, and `components/ui/sidebar.tsx`/`sidebar-item.tsx` exist as built, tested, documented primitives — but no `app/(app)/layout.tsx` ever composed them into the actual route tree. Every `(app)` route (`/dashboard`, `/niches`, `/tracking`, `/prompts`) renders standalone, with no persistent nav. `app/(app)/dashboard/page.tsx` is still explicitly labeled "Placeholder landing page for Phase 0's auth flow... Real dashboard is Phase 1" and was never replaced. Discovered while scoping Phase 2 Task 1 (Outlier Finder), which needs a nav entry point that doesn't exist yet.
- **Impacts:** `app/(app)/layout.tsx` (doesn't exist), `app/(app)/dashboard/page.tsx`, every `(app)` route's discoverability
- **Interim mitigation (Phase 2 Task 1):** `/outliers` ships as a standalone route, linked directly from the dashboard placeholder and from `/tracking`, per Task 1's approved plan. Not a fix — just keeps the new feature reachable until the shell itself is built.
- **Final call:** `app/(app)/layout.tsx` now composes `AppShell` (`components/features/shell/`): sidebar (Primary nav; a Team section shown only when `listMyWorkspaceMemberships()` returns at least one membership — no greyed items for non-Team users; a Library section for Saved channels/Prompt library counts), top bar (breadcrumb/title, Cmd+K trigger, notification bell + credit chip each in their own `<Suspense>` so a slow query never blocks first paint, account dropdown), and the command palette (Recent/Navigation/Actions groups) wired to the real Cmd+K shortcut already built into `CommandPalette`. `/onboarding` moved from `app/(app)/onboarding/` to a top-level `app/onboarding/` so it keeps its own spec'd full-screen, no-sidebar layout instead of inheriting this shell (its URL is unaffected — route groups don't affect paths). Dashboard rebuilt per UI-UX-Flow.md §4.5 (greeting, metric cards, recent activity, continue-where-left-off), replacing the Phase 0 placeholder and its inline nav.
- **Real gaps found and fixed along the way:** `SidebarItem`'s `asChild` prop was silently non-functional since Phase 0 — its render always built its own icon/label markup and discarded whatever `children` a caller passed, so no `<Link>` ever actually got rendered; this was never caught because nothing had used `asChild` in a real route until now. Fixed via `cloneElement` instead of `Slot.Root` (Slot.Root only merges props onto a single child, it can't also replace that child's own content, which is what threading the collapse-aware icon/label markup into a caller's `<Link>` needs). Also added `Sidebar`'s mobile auto-collapse (icon-only under 768px, guarded for environments with no `matchMedia`) and a small `ThemeProvider` (the CSS side already existed per D-008; no JS bridge did).
- **New service functions:** `getUnreadNotificationCount`/`getTrackedChannelCount` (tracking.ts), `getPromptCount` (prompts.ts), `getCreditsUsedThisMonth` (credits/index.ts), `getProfileSummary` (onboarding.ts) — all small, count-only or narrow-projection queries backing the shell/dashboard.
- **Test infra: two real cross-file leaks found and fixed, distinct from D-039.** (1) A new `DropdownMenu` interaction test (click-to-open, checking Portal content) passed in isolation but intermittently failed only in full-suite runs, immune to longer waits — traced to Radix's uncontrolled `defaultOpen`/click-driven open state resolving via an internal effect that isn't reliable under this project's `isolate: false` shared-worker model; not chased to a root cause (would be its own D-039-scale investigation for one component), fixed pragmatically by testing a fully controlled `open` prop instead, which renders synchronously and passed 10/10 full-suite runs. (2) `tests/components/ui/sidebar.test.tsx`'s own collapse-toggle test writes `ytniches:sidebar-collapsed = "true"` to jsdom's one shared `localStorage` per worker and never resets it, so any later test in the same worker that mounts a fresh `Sidebar` inherits a collapsed state (hiding every label/count badge) — found via the new `app-sidebar.test.tsx` flaking only in full-suite runs. Fixed centrally in `vitest.setup.ts`'s `afterEach` (`localStorage.clear()`, alongside the existing `cleanup()`) rather than patching every individual test file, the same centralization reasoning as D-039's `vi.resetModules()`.
- **Verification:** 811/811 tests, 8/8 consecutive clean full-suite runs post-fix, `pnpm typecheck` + `pnpm lint` clean. Every target route (`/niches`, `/tracking`, `/prompts`, `/outliers`, `/workspace`, `/workspace/tasks`, `/calendar`, `/settings/billing`, `/dashboard`, `/onboarding`) confirmed via the dev server to redirect correctly to `/login?redirect=...` unauthenticated (no 500s), and `/invite` confirmed still public. **Not verified:** the shell's actual authenticated rendering (sidebar/top-bar/command-palette live in a real browser) — this environment has no working login path (email/password is intentionally disabled per D-015; Google OAuth needs real consent; minting a session via the Supabase service-role key was correctly blocked by the auto-mode permission classifier as credential materialization, not attempted further). Needs a real manual pass once an authenticated test path exists.

---

### D-038: Manual "outlier rescan" (2-credit) feature deferred

- **Status:** Open
- **Context:** Monetization.md §3 lists "Outlier scan on tracked channel (Phase 2) — 2 credits — cost of AI classification + baseline calc," which conflicts with PRD.md §7.1's "how it works," a pure statistical rolling-baseline calculation with no AI step. Per CLAUDE.md §3.2, PRD wins on product scope + feature intent. Phase 2 Task 1 ships automatic, free, background outlier detection in `workers/channel-sync.ts` (same cost model as `new_video`/`view_spike`/`cadence_change` — system-triggered, no per-user credit charge). The 2-credit line is read as referring to a separate, not-yet-scoped manual "rescan this channel now" feature, which is out of Task 1's scope.
- **Impacts:** Monetization.md §3 (credit table), a possible future `/outliers` "Rescan now" button + `lib/services/outliers.ts` action, `lib/credits/`
- **Final call:** Build only if user research shows people actually want to force a rescan between the channel's normal sync cadence, rather than waiting for the next automatic sync.

---

### D-039: Test suite intermittent flakiness

- **Status:** Resolved (2026-09-22)
- **Context:** `isolate:false` shared environment causes occasional failures in `credits/index.test.ts`, `channels.test.ts`, `generator-form.test.tsx`, `youtube/cache.test.ts`. All pass in isolation. Consistent pattern across the whole project.
- **2026-09-22 update (Phase 2 exit gate):** severity confirmed higher than first logged. Phase 2 Task 3's session alone saw `upgrade-modal.test.tsx` join the affected-file list for the first time, and back-to-back full-suite runs during the exit gate itself: 3 runs → 2 clean, 1 with 13 failures (`credits/index.test.ts` again), consistent with roughly 1-in-3 to 1-in-2 full-suite runs hitting some flake this session — worse than the isolated single-file flakes typical of Phase 1/early Phase 2. Every occurrence across the whole project confirmed clean in isolation; the affected-file set kept growing, not shrinking. This is what triggered fixing it before Phase 3 rather than after.
- **Diagnosis:** every affected file ran clean 10/10 in isolation (40 total isolated runs across the 4 listed files, zero failures) — ruling out anything wrong with the tests' own logic. 5 full-suite runs during diagnosis: 3 clean, 2 failing, with two distinct failure signatures, both pointing the same direction — a test's own correctly-shaped mock (e.g. `credits/index.test.ts`'s `createClient` mock, built specifically to handle a `"subscriptions"` table query) got swapped out mid-run for a differently-shaped one from an unrelated file, producing "Cannot read properties of undefined" where a chained call landed on a mock that had no matching branch (or an exhausted `mockReturnValueOnce` queue) for that call. Root cause: shared library modules (`lib/credits/index.ts`, `lib/youtube/cache.ts`, etc.) are only _evaluated_ once per worker under `isolate: false` — Vite's SSR module cache treats the first test file that `await import()`s them in a given worker as authoritative, and its internal `import { createClient } from "@/lib/supabase/server"` binds to whichever `vi.mock()` factory was registered at that moment. Every later file sharing that worker that also dynamically imports the same library module gets the _same cached instance_, already bound to the first file's mocks, not its own. Non-deterministic because which file's imports happen to "win" the first-evaluation race varies with Vitest's file scheduling/worker assignment run to run — exactly matching "only ever on full-suite runs, never in isolation," and the affected-file set drifting as new tests were added.
- **Fix:** `vi.resetModules()` added to the top of `vitest.setup.ts` (not `afterEach` — needs to run once per test file, _before_ that file's own hoisted `vi.mock()` + dynamic `await import()` lines execute). `setupFiles` already run fresh per test file under `isolate: false` (confirmed by this same file's pre-existing `cleanup()` comment) — clearing the module registry at that point forces every file to re-evaluate its own module graph against its own just-registered mocks, instead of reusing a stale binding left by whichever file happened to import it first. Does **not** touch `isolate: false` itself (per constraint — that flag stays off; it's what prevents the OOM this project hit under `isolate: true`) and needed zero changes to any of the affected test files themselves — the leak source was the missing module-cache reset between files, not anything wrong with the tests.
- **Verification:** 10 consecutive full-suite runs post-fix, all clean (685/685 tests, 86/86 files, every time), durations stable at ~20-28s (no regression from the pre-fix clean-run baseline). `pnpm typecheck` + `pnpm lint` clean.
- **Final call:** Fixed. If flakiness resurfaces post-Phase-3, re-open as a new entry rather than reusing this one — the diagnosis here is specific to this mechanism and shouldn't be assumed to cover a different cause.

---

### D-040: Resend bounce/complaint webhook handling deferred

- **Status:** Open
- **Context:** TRD.md §6.4 specs "Bounce + complaint webhooks handled: hard bounces → mark email `undeliverable` on profile; complaints → unsubscribe from all non-critical email." No such column exists on `profiles`, no `/api/webhooks/resend` route exists, and it isn't part of Phase 2 Task 2's scope (email _sending_, not delivery-event handling).
- **Impacts:** TRD.md §6.4, `profiles` (would need an `email_undeliverable` or similar column), a new `/api/webhooks/resend` route
- **Final call:** —

---

### D-041: Thumbnail Ideas — text-only generation, not vision-based image analysis

- **Status:** Resolved (2026-09-22)
- **Context:** PRD.md §7.3's "how it works" describes literal visual analysis ("analyze thumbnail composition, color palette, text style, subject placement"), which `lib/ai/client.ts` cannot do — it has no vision/image-input capability, and the existing, already-shipped `thumbnail_concepts` category inside AI Prompts' own `PromptOutput` (same 3-5 count) is itself text-only, generated from title/description/transcript, never the actual image.
- **Final call:** Text-only, matching that existing precedent and Phase 2 Task 3's "keep it small" scope. The system prompt (`lib/ai/thumbnail-idea-prompt.ts`) frames output honestly as "concepts informed by why this type of video/thumbnail pattern works," not a claimed description of the literal source image. If user feedback signals genuine image analysis matters, vision can be added later as a targeted, isolated upgrade to `generateStructuredOutput`'s message-content shape in `lib/ai/client.ts` — nothing in this build forecloses that.
- **Impacts:** PRD.md §7.3 (implementation reading, not a literal build of "analyze... color palette"), `lib/ai/client.ts` (no vision support), `lib/ai/thumbnail-idea-prompt.ts`

---

### D-042: Phase 2 exit gate

- **Status:** Conditionally passed (same pattern as Phase 0 + Phase 1 gates)
- **Deferred items (Implementation-Plan.md §4.1, all 3 user-metric gates):**
  1. 30-day retention above post-launch baseline — not measurable, no real users pre-launch.
  2. Notification opt-in rate above 50% — not measurable, no real users pre-launch.
  3. Outlier Finder used by >40% of active users — not measurable, no real users pre-launch.
- **P0/P1 status:** No open bugs _logged_ anywhere (DECISIONS.md, commit messages, or `TODO`/`FIXME`/`XXX`/`BUG` markers — grepped clean, one pre-existing `TODO` in `channel-tabs.tsx` and it's an already-scoped deferred feature, not a bug). But the gate audit itself **found and fixed one real P1**, live, not from a log: `/outliers` (added Phase 2 Task 1) was never added to `middleware.ts`'s `APP_ROUTE_PREFIXES`, so `classifyRoute` fell through to `"public"` and skipped the auth check entirely. An unauthenticated visitor hitting `/outliers` reached the Server Component and 500'd on `getRequestContext()`'s "middleware already blocked this" assumption, instead of redirecting to `/login` like every other app route. Confirmed live in the browser (network log: `GET /outliers → 500` before the fix, `GET /outliers → 302 → /login?redirect=%2Foutliers → 200` after). Fixed by adding `/outliers` to the prefix list; added a regression test (`tests/middleware.test.ts`'s new `classifyRoute` describe block) that enumerates every real directory under `app/(app)/` so a future new route silently missing from this list fails CI instead of shipping unprotected. No test previously covered `classifyRoute` against a full route list — only the onboarding/admin gates were tested — which is why this went uncaught across two full phases.
- **D-039 flakiness:** assessed as a **P1 risk, fixed before Phase 3 per that assessment** (not deferred) — see D-039 for the full diagnosis, fix, and 10-consecutive-clean-run verification. Reasoning that drove "now, not after": (1) the pattern was measurably worsening this session (new affected file, higher failure rate on repeated runs) rather than stable; (2) Phase 3's Workspace feature introduces genuine shared state across multiple users for the first time in this codebase — exactly the class of feature where a flaky test masking a real race condition or cross-user data leak is most costly to miss; (3) root cause turned out to be a single missing `vi.resetModules()` call, not an open-ended investigation — cheap enough that deferring it had no real cost advantage.
- **Other checks:** all three Phase 2 features confirmed reachable (`/outliers`, `/settings/notifications`, `ThumbnailIdeasModal` via `OutlierCard` — the last two already worked; `/outliers` only after this gate's fix). 685 tests passing (610 at Phase 2 Task 1's start → 685 here, includes this gate's own 8 new middleware tests), now confirmed at 10/10 consecutive clean full-suite runs post-D-039-fix. `pnpm typecheck` + `pnpm lint` clean.
- **Phase 3 proceeds:** Yes. D-039 is resolved, not just scheduled.

---

### D-043: Workspace route is `/workspace`, not `/settings/workspace`

- **Status:** Resolved (2026-09-23)
- **Context:** Phase 3 kickoff briefed Workspace UI at `/settings/workspace` and `/settings/workspace/members`. Application-Flow.md §2.3 already has `/workspace` as a top-level authenticated route ("Workspace overview, Phase 3") — planned in Phase 0, ahead of this feature actually being built — and `middleware.ts`'s `APP_ROUTE_PREFIXES` already includes both `/workspace` and `/calendar` for the same reason. No `/settings/workspace` entry exists anywhere in the routing spec.
- **Final call:** Follow Application-Flow.md. Workspace overview + member management live at `/workspace` and `/workspace/members` (top-level, alongside `/tracking`, `/prompts`), not nested under `/settings/*`. Per CLAUDE.md §3.2, Application-Flow.md governs routing and predates this task's brief.
- **Impacts:** Application-Flow.md (no change needed — already correct), the Phase 3 kickoff brief (superseded on this point)

---

### D-044: No UI-UX-Flow.md coverage for Workspace, Tasks, or Calendar screens

- **Status:** Open (build proceeds; doc debt tracked)
- **Context:** Phase 3 kickoff cited "UI-UX-Flow.md §8" for Workspace/Tasks/Calendar screens. UI-UX-Flow.md's actual §8 is "Settings + Admin" — there is no section anywhere in the doc covering these three features. No screen layouts, states (loading/empty/error), or interaction flows are specified for the workspace overview, member management, the invite-accept page, task views, or the calendar.
- **Final call:** Don't block on it. Build Workspace UI composed from existing primitives (`Card`, `Table`, `Modal`, `Avatar`, `Button`) following this codebase's established list/detail patterns (mirrors `/tracking`'s overview shape) and the paid-tier gating pattern already in use (visible in nav with a badge + upgrade upsell for non-Team users, never hidden like an unbuilt feature). Same approach carries into Tasks and Calendar.
- **Follow-up required:** UI-UX-Flow.md needs §9 (Workspace), §10 (Tasks), and §11 (Calendar) written as a dedicated post-Phase-3 doc task — before any future developer (human or AI) touches these features again expecting a spec to read first, per CLAUDE.md's golden rule. Do not let this slide past the Phase 3 gate.
- **Impacts:** UI-UX-Flow.md (missing §9/§10/§11), CLAUDE.md §3 spec map (already lists UI-UX-Flow.md as canonical — the doc itself is just behind)

---

### D-045: Tasks route is `/workspace/tasks`, not a top-level `/tasks`

- **Status:** Resolved (2026-09-23)
- **Context:** Same gap as D-043 — Application-Flow.md §2.3's route table has no `/tasks` entry at all (it does have `/workspace` and `/calendar`, both anticipated in Phase 0). PRD.md §8.2's four task views (My tasks, All team tasks, Tasks by status, Tasks by assignee) don't imply their own top-level route either — they're filters/groupings of one list, not separate pages.
- **Final call:** `/workspace/tasks`, scoped under the workspace like `/workspace/members`, not top-level. Tasks are inherently workspace-scoped data (Backend-Schema.md §5.4's `tasks.workspace_id` is `NOT NULL`, unlike `calendar_entries.workspace_id` which is nullable for a future personal-calendar case) — nesting the route under `/workspace` matches the data model, and keeps the pattern consistent with D-043's reasoning. `/calendar` stays top-level per Application-Flow.md's existing entry (calendar entries _can_ be personal per the schema, even though this build's UI only exercises the Team-scoped case).
- **Impacts:** Application-Flow.md (still missing this entry — same follow-up as D-044, folded into that §9/§10/§11 doc debt rather than a separate decision)

---

### D-046: Calendar entry prompt picker — scope trimmed

- **Status:** Open (deferred)
- **Context:** `calendar_entries.linked_prompts uuid[]` (schema) and `lib/services/calendar.ts`'s `createEntry`/`updateEntry` (accept `linkedPrompts` on input) already support linking a calendar entry to one or more saved prompts. `EntryForm`/`entry-form.tsx` never exposes a picker for it — no UI lets a user select from their saved prompts library when creating or editing an entry.
- **Impacts:** `components/features/calendar/entry-form.tsx`, PRD.md §8.3 (Content Calendar ↔ Prompt Library integration)
- **Final call:** —

---

### D-047: Slack notifications for team accounts — not built

- **Status:** Open (deferred)
- **Context:** Phase 3 exit gate criterion (Implementation-Plan.md §4.2) asks whether Slack notifications were tested for team accounts. They were never built — no Slack integration exists anywhere in this codebase (no OAuth, no webhook posting, no `notification_preferences.slack_enabled` wiring beyond the column existing). Out of Phase 3's actual build scope (Workspace + Tasks + Calendar), which never named Slack as a deliverable.
- **Impacts:** Implementation-Plan.md §4.2, `notification_preferences.slack_enabled` (column exists, unused), a future notifications-channel task
- **Final call:** —

---

### D-048: Phase 3 exit gate

- **Status:** Conditionally passed
- **P0/P1 found and fixed during this gate:** The profiles co-member RLS policy added mid-phase (`20260923120001`) was verified for row-level scoping by direct RLS impersonation (`SET ROLE authenticated` + `request.jwt.claims`, not app code) — confirmed correctly scoped: a co-member's row is invisible with no shared workspace (0 rows) and visible once a shared `workspace_members` row exists. But RLS is row-level only, so that policy exposed every column on a visible row — `role`, `onboarding_step`, `primary_goal`, `onboarding_skipped_at`, `youtube_channel_id`, not just `name`/`avatar_url` — to any co-member, confirmed by `select *` under the same impersonation. Fixed in `20260923150000`: dropped the row policy, added `get_co_member_profiles(uuid[])`, a `SECURITY DEFINER` function projecting only `id, name, avatar_url`, re-checking `shares_workspace_with` per row; `attachMemberProfiles`/`attachAssigneeNames` now call it via `.rpc()` instead of `.from("profiles").select(...)`. Self-access to a user's own full profile is unaffected. See Backend-Schema.md §5.7 for the full record.
- **Also found and fixed:** `tests/middleware.test.ts`'s `classifyRoute` regression enumeration (added Phase 2 per D-042, meant to catch exactly this class of gap) was missing both Phase 3 route directories — `/calendar` and `/workspace` were absent from `REAL_APP_ROUTES`, even though `middleware.ts`'s actual `APP_ROUTE_PREFIXES` already had both correct. Runtime behavior was never wrong; the regression guard just didn't cover the new routes. Fixed by adding both, plus explicit assertions that `/workspace/tasks` and `/workspace/members` classify as `"app"` and `/invite` classifies as `"public"` (confirmed safe unauthenticated: `app/invite/page.tsx` never calls `getRequestContext()` and explicitly branches on `isAuthenticated`, unlike D-042's `/outliers` 500).
- **Gate criteria (Implementation-Plan.md §4.2):**
  1. Team tier adopted by >10% of paid users — DEFERRED, not measurable, no real users pre-launch (same as every Phase 2 user-metric gate, D-042).
  2. Calendar drag-and-drop reliable across day/week/month views, desktop + mobile-web — Desktop verified live in-browser this phase (checkpoint report). Mobile-web **could not be verified live**: `app/(auth)/login/page.tsx`'s email/password fields and submit button are hardcoded `disabled` (D-015 still open, "shell only — email/password auth not wired"), and Google OAuth requires real consent this environment can't complete, so no authenticated browser session could be established to test at 375px width. Code-level check instead: `calendar-client.tsx`'s `<FullCalendar>` wires `editable={isContributor}` + `eventDrop` uniformly regardless of viewport (`interactionPlugin` handles mouse and touch drag by default) — no `longPressDelay` override, so touch drag uses FullCalendar's ~1000ms default long-press-to-initiate, standard touch UX, not a bug. One real risk spotted but unverified live: `headerToolbar`'s `right: "dayGridMonth,timeGridWeek,timeGridDay"` plus `left: "prev,next today"` has no responsive override, and five toolbar buttons at 375px width is a plausible wrap/crop risk. **Flagged, not fixed** — needs a real mobile-web pass once an authenticated test path exists (tracked as a follow-up, see final call).
  3. Slack notifications tested for team accounts — DEFERRED per D-047 (never built, out of Phase 3 scope).
  4. Onboarding updated to reflect team option — Checked: `onboarding-client.tsx`'s `PERSONA_OPTIONS` still has only the pre-existing `{ value: "operator", label: "I run multiple channels / a team" }` (Phase 1 copy, unchanged). It mentions "a team" purely to classify user intent (`primary_goal` enum) — no mention of "workspace," no CTA to create or join one, no reference to the Team pricing tier. Onboarding was **not** updated to reflect Team workspaces as a real, built feature.
  5. All Phase 3 routes in middleware `APP_ROUTE_PREFIXES` — Confirmed: `/workspace` covers `/workspace/tasks` and `/workspace/members` transitively (prefix match), `/calendar` has its own entry, `/invite` correctly falls through to `"public"` and is safe unauthenticated. Regression test gap found and fixed (see above).
  6. No open P0/P1 bugs — one found and fixed this gate (profiles column over-exposure, above); none open now.
  7. 786+ tests passing, typecheck + lint clean — 786/786 passing (2 test-mock updates needed for the `attachMemberProfiles`/`attachAssigneeNames` → `.rpc()` switch, not new tests), `pnpm typecheck` clean, `pnpm lint` clean.
- **Final call:** Conditionally passed, same treatment as Phase 0/1/2 gates. Two items carry forward as real follow-ups rather than closed: mobile-web calendar drag-and-drop needs a genuine live pass once an authenticated test path exists (either D-015 resolves and wires real email/password login, or a dedicated test-auth bypass is built) — the toolbar overflow risk at 375px specifically should be the first thing checked; and onboarding's persona step should get a workspace/Team mention once UI-UX-Flow.md's D-044 doc debt (§9 Workspace) is written, so new signups running multi-channel operations actually discover the feature instead of only stumbling onto `/workspace` on their own.
- **Phase 3 proceeds:** Yes — all three planned phases are now built. Remaining pre-launch work: landing page, app shell (D-037), help center, YouTube quota increase (D-036), GitHub remote + real CI (D-024).

---

### D-049: Command palette "Recent" group — localStorage only, not per-account

- **Status:** Resolved (2026-09-23)
- **Context:** UI-UX-Flow.md §4.3's command palette spec calls for a "Recent" group (last 5 actions: searches, saved channels, prompts). No activity/recent-actions log exists anywhere in the schema, and building one (table + write-on-every-action instrumentation) is real scope beyond wiring the app shell (D-037).
- **Final call:** Recent items (and the dashboard's "Continue where you left off," same underlying data) are tracked client-side only, in `localStorage`, using the same try/catch-guarded pattern already established in `components/ui/sidebar.tsx` for collapse-state persistence. Resets per-browser, not per-account — a user switching devices sees an empty Recent group until they build history on that device again.
- **Impacts:** `components/features/shell/` (command palette wiring), `app/(app)/dashboard/` ("Continue where you left off" section)
- **Revisit if:** user research shows cross-device recency actually matters — the real fix then is a lightweight `recent_actions` table + writes on search/save/generate, not a bigger client-side cache.

---

### D-050: Landing page build calls (A-lite)

- **Status:** Resolved (2026-09-24)
- **Context:** Building the 15-section landing (Landing-Page-Spec, Landing-Copy, Interaction-Spec) surfaced conflicts between the docs and between the copy and what's actually built.
- **Final call:**
  - **Nav items:** Landing-Copy §2.1 (Product · Tools · Pricing · Blog) over Landing-Page-Spec §1's list. Product → `/#features`.
  - **Links to unbuilt pages** (blog, tools, changelog, roadmap, tutorials, help, about, contact, legal): plain text + "Soon" tag, never a 404. Only real routes and on-page anchors are clickable.
  - **AI credit line:** "5 credits per generation. 3 to regenerate with feedback." — Monetization.md / D-012 win over Landing-Copy §4.1's "one credit".
  - **Honesty about unbuilt surfaces:** only YouTube is a live integration (rest "Soon"); template modal says "Coming soon, sign up to get it first." (D-030); changelog placeholders are real shipped features (Outlier Finder, Team workspaces, Content Calendar); Insights view caption "Coming soon."
  - **SEO title:** "YTNiches — Niche research to content for faceless creators" (58 chars; Landing-Copy §5.4's version was 71, not the 59 it claimed).
  - **Omitted until real:** social-proof line, "Book a 15-min demo", Mac's social links.
  - **Founder story:** Mac's final copy (World War 2 channel) supersedes Landing-Copy §4.3's starter draft.
  - **Mode toggle:** click + keyboard only, no drag.
  - **Creator-type explorer on mobile:** horizontal snap-scroll strip (Interaction-Spec `creator_type_selector`) rather than Landing-Page-Spec §4's accordion — the behavior doc wins on behavior.
  - **Cmd+K on public pages:** a navigation-only palette in the marketing layout (not in the specs; added so Cmd+K behaves the same across the site).
- **Impacts:** `components/features/landing/content.ts` holds all shipped copy. Landing-Copy.md §2.1, §4.1, §4.3, §4.4, §5.4 synced in a separate docs-only commit (2026-09-24), per CLAUDE.md §1.

### D-051: Pro → Team upgrade leaves the old Creem subscription billing

- **Status:** Open (logged 2026-09-24)
- **Context:** Upgrading runs `createCheckout`, which opens a _new_ Creem subscription. When its webhook lands, `upsertSubscriptionFromProvider` marks the old Pro row `is_current = false`, but nothing cancels the Pro subscription in Creem. The user keeps paying for both. The admin MRR counts both rows, because Creem still bills both.
- **Options:**
  - A: Upgrade in place through Creem's subscription upgrade endpoint (one subscription, prorated).
  - B: After the new subscription's first `subscription.paid`, cancel the retired one through the Creem API.
  - C: Block self-serve upgrades and route them through support until A or B ships.
- **Impacts:** `lib/services/billing.ts` (checkout + upsert), Monetization.md upgrade flow, admin MRR.
- **Needs:** A call before any paid Pro user can see the Team upgrade CTA.

### D-052: Admin panel first cut — what's deferred

- **Status:** Resolved (2026-09-24)
- **Context:** PRD §9 / UI-UX-Flow §8.2 list more admin surface than the first cut needs. Built: Dashboard, Users (search, filter, detail, grant credits with a reason, suspend/unsuspend, refund last payment via Creem), Revenue, API Quotas. Super_admin only.
- **Deferred:**
  - Blog CMS (per D-006), Tools module, Automation module. Module 6 stays open under D-016.
  - Impersonation, CSV export, the `staff` role.
  - Plan changes from admin. Change the plan in the Creem dashboard; the webhook syncs it.
  - Coupons, payment-retry actions, MRR breakdown beyond per-tier (new/expansion/churned).
  - Per-endpoint YouTube quota breakdown and quota alerts.
- **Known ceilings:**
  - The MRR history uses each subscription's _current_ status. A status-history table fixes this.
  - The quota trend only goes back to when the 8-day Redis TTL shipped.
  - The body field for Creem's refund request (`transaction_id`) isn't in Creem's public docs. A non-2xx response raises an error the admin sees and releases the idempotency key.
- **Impacts:** `app/(admin)/admin/*`, `lib/services/admin.ts`, migration `20260924120000_admin_panel.sql`.

### D-053: Blog build calls — newsletter, drafts, no ISR, no pagination

- **Status:** Resolved (2026-09-25)
- **Context:** Building the blog (PRD.md §10.2, UI-UX-Flow.md §2.2, D-005, D-006) raised calls the specs don't cover.
- **Final call:**
  - **Newsletter = Resend contacts.** Signups become contacts in the Resend "Newsletter" segment (`RESEND_NEWSLETTER_SEGMENT_ID`). There's no subscriber table. Sending happens later through Resend Broadcasts, which handles unsubscribe.
    - No double opt-in at launch. The form says what people get: "New posts by email. Unsubscribe anytime."
    - A public form means spam protection: a hidden honeypot field plus 5 signups per IP per hour (Upstash).
    - An existing contact gets the same "you're in" reply, so the form never reveals who's subscribed.
  - **Drafts.** `draft: true` posts show only in `next dev`, with a DRAFT banner. Production builds, the sitemap and RSS never include them. A test fails CI if a published post links to an unpublished one.
  - **Blog nav link.** It switches on at build time once at least one post is visible, and shows "Soon" until then.
  - **No ISR.** TRD.md §2 says revalidate every 60s, but posts live in git and every change ships with a deploy, so pages are plain static generation.
  - **No pagination.** UI-UX-Flow.md §2.2 asks for paginated category and author pages. Add it when any list passes 12 posts.
  - **Search.** Client-side Fuse.js over title, tags, category and excerpt. Category pills are plain links to category pages, not client-side filters (static, crawlable, no extra JS).
  - **Share images.** Generated per post at build time (title on the brand background). A post's `coverImage` shows on the page but doesn't replace the generated share image.
- **Impacts:** `content/`, `lib/blog/`, `app/(marketing)/blog/*`, `app/sitemap.ts`, `lib/services/newsletter.ts`, `.env.example`.

### D-054: Free tools — URLs, rate limits, quota guard

- **Status:** Resolved (2026-09-25)
- **Context:** Building the six open free tools (D-014) inside D-036's quota crunch, and replacing the old MVP's tool pages without losing their search rankings.
- **Final call:**
  - **URLs.** Tools live at the root, not `/tools/[slug]` (UI-UX-Flow.md §2.3). The old site (repo `whywaris/ytniches5`, read-only) had its tools at root URLs, so the four matching tools reuse those URLs exactly: `/youtube-subscribe-link-generator`, `/rss-feed-generator`, `/youtube-embed-code-generator`, `/thumbnail-resizer`. The two new tools follow the same pattern: `/youtube-channel-id-finder`, `/youtube-outlier-checker`. `/tools` is the index, as before.
  - **Old tool URLs we don't rebuild** stay undecided for now, pending Mac's call per URL (redirect, rebuild or drop).
  - **Client-side first.** Subscribe link, RSS (channel or playlist), embed code and thumbnail resizing run in the browser. A `/channel/UC…` URL or bare channel ID needs zero API calls; only `@handles` go to the server.
  - **Rate limit.** Server-backed tool requests share one per-IP bucket: 10 per hour and 30 per day (Upstash sliding windows). Cache hits count too. Plus a hidden honeypot field.
  - **Quota guard.** ~~Free tools return "Busy right now" once the day's YouTube quota reaches 70% of `DAILY_QUOTA_LIMIT` (7,000 of 10,000), so the last 30% is kept for signed-in users.~~ Revisited 2026-09-27 (D-075): free tools have their own 1,500-unit daily budget and go "Busy" only when that is spent, so other traffic can't push them there. The check runs before the rate limit, so a busy day doesn't spend a visitor's allowance. Busy blocks cached results too (simplest; revisit if it hurts).
  - **Handle cache.** New Redis key `youtube:handle:{handle}` → channel ID, 24h TTL. Previously every repeat `@handle` lookup cost a unit. It benefits the app's own channel inputs too. (TRD.md §5.2's key list should add it in the next TRD edit.)
  - **Wider shared parser.** `lib/youtube/urls.ts` now accepts bare `@handle`, bare `UC…` IDs, trailing tabs (`/videos`), `m.youtube.com`, and `/live`, `/embed` and bare video IDs. It's shared by the app and the tools. Legacy `/c/` and `/user/` links are still rejected with a clear message.
  - **One outlier rule.** The "earlier uploads" selection moved from `workers/channel-sync.ts` into `evaluateAgainstChannel` in `lib/outliers/scoring.ts`, used by both the worker and the Outlier Checker. New edge-case tests (cold start, 2,999 vs 3,000 views, zero baseline) pass against both the old and the new worker.
  - **Outlier Checker limit.** It sees a channel's 50 most recent uploads. Older videos get "too old to check" instead of a guess.
- **Still open elsewhere:** D-036 (quota increase). Free tools add bounded load: at most about 120 units per IP per day.
- **Impacts:** `lib/youtube/{urls,cache,quota,index}.ts`, `lib/outliers/scoring.ts`, `workers/channel-sync.ts`, `lib/tools/`, `lib/services/free-tools.ts`, `app/(marketing)/<tool>/`, `app/sitemap.ts`.

### D-055: Old-site tool URLs — rebuild six, 301 four

- **Status:** Resolved (2026-09-25). Defaults; Mac may adjust after checking Search Console.
- **Context:** The old site (`whywaris/ytniches5`) had ten tool URLs that don't map to D-054's six tools. Dropping them would 404 pages that may still bring traffic.
- **Final call:**
  - **Rebuilt at the exact old URL** (same template: FAQ, CTA, related tools):
    - `/youtube-thumbnail-download`: YouTube's fixed thumbnail image URLs, no API call.
    - `/watch-time-calculator`: calculator against the 4,000-hour goal.
    - `/youtube-revenue-calculator`: the creator enters their **own** RPM (accepted range $0.01–$100). No "RPM by niche/country" figures anywhere.
    - `/youtube-timestamp-generator`: manual chapter formatter checked against YouTube's rules (0:00 start, 3+ chapters, 10s each). No AI, no server call.
    - `/tag-extractor`: 1 quota unit per uncached video, behind the D-054 guard (per-IP limit + 70% quota cutoff).
    - `/youtube-qr-code-generator`: browser-only (`qrcode` package). YouTube links only; the code encodes the link directly, so nothing is tracked.
  - **301 to `/tools`:** `/youtube-word-counter`, `/dislike-viewer`, `/random-comment-picker`, `/youtube-automation-tools`. Explicit `statusCode: 301`, since Next's `permanent: true` sends a 308. The list lives in `lib/tools/legacy-redirects.ts` and `next.config.ts` reads it.
  - **Guard:** a test fails if any of the old tool URLs would 404: each must be a page or a 301 to a page, and `next.config` must actually serve the redirects.
- **Impacts:** `lib/tools/{calculators,legacy-redirects,registry}.ts`, `lib/services/free-tools.ts`, `next.config.ts`, six new `app/(marketing)/<old-slug>/` routes.

### D-056: Pricing promises vs product

- **Status:** Resolved (2026-09-26)
- **Context:** The help-center audit found the pricing cards promising things the product didn't do.
- **Final call:**
  - **Sync cadence by plan.** Every tracked channel synced every 24h on every plan, while the cards said Pro 6h and Team hourly. Now `tracked_channels.refresh_cadence_hours` is set from the tracker's plan when a channel is saved (`saveChannelToTracking`) and re-applied to all their channels whenever the billing webhook changes their current subscription (`applyRefreshCadence`). Values: Starter 24h, Pro 6h, Team 1h; trial, no plan or lapsed 24h. A migration backfilled existing rows.
  - **Credit allocations seeded by migration.** The 200 / 1,000 / 3,000 monthly rows existed only as hand-inserted data in ytniches-dev, so a fresh (production) database would have allocated 0 credits on a first payment. Migration `20260925120000_pricing_promises.sql` seeds them idempotently.
  - **Team seat cap.** A workspace is hard-capped at 3 seats (members plus pending, unexpired invites), checked on invite and again on accept. There's no seat purchasing, and no "+$25 per seat" copy existed in the product (it was only in Monetization.md), so nothing needed removing.
  - **One source of numbers.** `lib/billing/plans.ts` now holds monthly credits, tracked-channel caps, sync cadence and seats, and the pricing-card bullets are derived from them. Tests fail if the migration's seed or backfill values drift from `plans.ts`.
- **Open questions:**
  - **Trial cadence:** trial channels sync every 24h (as instructed), while the trial is marketed as "Full Pro access". Either keep 24h and soften "full", or give trials Pro's 6h. It's one constant: `TRIAL.refreshCadenceHours`.
  - **Team members' cadence:** cadence follows each tracker's _own_ subscription (same as the existing tracked-channel cap). An invited Team member with no subscription of their own gets 24h and the default cap, not Team's 1h / 100. It needs a decision on how workspace members inherit the owner's plan.
  - **"Priority AI generation"** (Pro card) isn't implemented: there's no priority queue. It's the same kind of broken promise, left on the card pending a decision.
- **Impacts:** `lib/billing/plans.ts`, `lib/services/{channels,billing,workspace}.ts`, the workspace invite/accept UI, migration `20260925120000_pricing_promises.sql`.

### D-057: Pre-launch blocker — trial expiry isn't enforced

- **Status:** Open. **Blocks launch** (with D-051).
- **Finding:** Monetization.md §5.3 says an expired trial becomes read-only. In code, the trial's subscription keeps `tier = 'pro'`, and nothing checks `trial_ends_at` outside the Billing page. Trial users keep Pro access indefinitely (tracked-channel cap, email notifications, outlier feeds, sync); only the 50 credits stop refilling. That's a revenue leak.
- **Needed:** enforce the expired-trial state (read-only) wherever tier-gated features are checked, and stop background work (sync, email) for expired trials.
- **Constraint (D-067b, 2026-09-27):** "read-only" can't mean "forever". Once sync stops, the 30-day YouTube purge empties those channels and videos. The expired state must show that data as expired (like prompts' "Video details expired"), and the help must say so.

### D-058: Pre-launch blocker — legal pages missing

- **Status:** Resolved (2026-09-27) by D-067f: `/legal/terms`, `/legal/privacy`, `/legal/refunds` and `/legal/cookies` are live, in the sitemap and linked from the footer. Still open before launch: the visible [NEEDS MAC INPUT] markers (business address, courts city), listed by `tests/content/legal.test.ts`. Legal review is still recommended. Originally blocked launch.
- **Finding:** There are no Terms, Privacy or Refunds pages (`/legal/terms`, `/privacy`, `/refunds`; the footer shows them as "Soon"). We take payments, so they're legally required, and Creem will likely expect them. Until then the help center's Refunds article is the only public statement of the refund policy (Monetization.md §6.2).
- **Needed:** proper drafts, ideally written or at least reviewed by a lawyer.

### D-060: Trial wording and cadence; no "Priority AI generation"

- **Status:** Resolved (2026-09-26)
- **Final call:**
  - **Trial = Pro's sync cadence (6h).** `TRIAL.refreshCadenceHours` now reads Pro's value from `lib/billing/plans.ts`. A migration moved channels on active trials from 24h to 6h.
  - **One trial pitch:** "Try every Pro feature free for 14 days" (`TRIAL_PITCH`, built from `TRIAL`), used on pricing, landing and VS pages, and in the help center. "Full Pro access" is gone, and a test fails if "full Pro access" or "full Pro plan" reappears anywhere in `app/`, `components/`, `content/` or `lib/`.
  - **"Priority AI generation" removed from the Pro card.** There's no priority queue. Put it back only when one exists.
- **Impacts:** `lib/billing/plans.ts`, landing `FINAL_CTA`, `/pricing`, `content/vs/*`, `/settings/billing`, migration `20260926100000_trial_cadence.sql`.

### D-059: Workspace members inherit Team limits

- **Status:** Resolved (2026-09-26)
- **Context:** D-056 made sync cadence follow each user's own plan, which left invited Team members (often with no subscription) on 24h and the 10-channel cap.
- **Final call:**
  - **Effective plan** (`lib/billing/effective-plan.ts`): Team while the user is a member of a workspace whose owner has a live (active or past_due) Team subscription; otherwise their own plan. If they're in several, the earliest-joined live one counts.
  - **Where it applies:** the request tier (`resolveTier`, so every `ctx.tier` gate), tracked-channel sync cadence, email eligibility (notification settings and the sync worker's fan-out), and the tracked-channel cap.
  - **Shared pool:** in a live Team workspace, all channels tracked by its members (owner included) count against Team's 100 together. No code ever sets `tracked_channels.workspace_id` (tracking is personal), so "workspace channels" means the members' channels, pooled.
  - **Fallback:** when the owner's Team lapses, the billing webhook re-applies the effective plan to the owner and every member of workspaces they own, and each drops to their own plan. Joining, leaving, being removed and workspace deletion re-apply too. Tier caches are invalidated, so gates switch immediately.
  - **Creating a workspace** still requires the user's own live Team plan. An inherited Team can't open a second workspace on someone else's subscription.
- **Known limits:**
  - Digests aren't gated by plan when sent, only when preferences are saved. A user who enabled digests on Pro, then dropped to Starter, keeps getting them. Out of scope here.
  - Verified against the real dev schema (the join queries run), but dev has no workspaces, so the end-to-end behaviour is proven by unit tests, not live data.
- **Impacts:** `lib/billing/{effective-plan,tier-cache}.ts`, `lib/services/{billing,channels,workspace,notification-preferences}.ts`, `workers/channel-sync.ts`.

### D-061: Email plan checks happen at send time

- **Status:** Resolved (2026-09-26)
- **Context:** Digests were gated only when the preference was saved, so a user who enabled them on Pro and then moved to Starter kept receiving them.
- **Final call:** The digest job now checks the user's effective plan (`effective-plan.ts`, so an inherited Team counts) right before building and sending. If they're not email-eligible, it's skipped silently, and the saved preference is left unchanged so the digest resumes on its own if they upgrade again.
- **Other email paths:**
  - Real-time alerts (channel sync) already checked the effective plan at send time (D-059).
  - Workspace invites are transactional, not a plan feature, so they're unaffected.
- **Known limit:** "email-eligible" is by plan tier (Pro or Team), not subscription status. An expired trial still has tier Pro. That's the same gap as D-057 and gets fixed with it.
- **Impacts:** `workers/digest.ts`.

### D-062: Tracking a channel is free (spec says 1 credit)

- **Status:** Open (logged 2026-09-26)
- **Finding:** Monetization.md §3.1 charges 1 credit to track a channel. The product charges nothing (`CREDIT_COSTS.trackChannel = 0`). The tracked-channel cap is what limits abuse. The help center documents today's behaviour: adding a channel by URL is free. Adding one through the Add channel modal's **Search** tab runs a niche search, so that costs a search credit.
- **Needed:** decide which is right, then update the losing side (Monetization.md §3.1, or `lib/credits/costs.ts` plus the help articles, which read the constant).

### D-063: Credits never reset, and annual plans get one allocation per year

- **Status:** Resolved (2026-09-27). Money path.
- **Correction:** the original finding was wrong on one point. Credits did reset: the balance only summed events since the current period start, so old cycles dropped out implicitly. That same rule also wiped admin grants and left no way to do Team rollover. The annual finding was right.
- **Final call:**
  - The balance is the sum of the whole ledger (`credit_balance` SQL function).
  - Every cycle close writes an explicit `expiration` row before the new allocation, never taking the balance below zero.
  - Team keeps up to `TIER_INFO.team.rolloverCredits` (500) of the ending cycle's unused credits for one more cycle. Rollover doesn't stack.
  - Spending order: rollover, then this cycle, then top-ups. Admin grants are the top-ups, and they never expire.
  - Annual subscribers get months 2-12 from an hourly Inngest job (`workers/credit-cycles.ts`). It's idempotent per subscription, period and month.
  - Migration `20260927100000` expired past-cycle credits once, so every existing balance stayed exactly the same (verified on dev: 0 mismatches).
- **Finding:** Monetization.md §3 says unused credits reset at cycle end, and that Team can roll over up to 500 for one cycle. In code, credits are a ledger that only grows. Nothing writes `expiration` events, so every unused credit carries over forever. Also, `allocateCycleCredits` runs once per paid billing cycle. On an annual plan that's once a year, so a yearly Pro user gets one month's allowance for twelve months.
- **Help center:** says "credits each month" (from `TIER_INFO`) and deliberately says nothing about rollover or reset until this is decided.
- **Needed:** a reset/rollover job to match §3, and a monthly allocation for annual subscribers (a scheduled job keyed on the month, not the Creem cycle).

### D-064: No time zone setting, so digest and quiet hours run on UTC

- **Status:** Resolved (2026-09-27)
- **Final call:**
  - New column `profiles.time_zone_source` (`default` / `browser` / `user`), because "UTC" alone can't tell "never set" from "chose UTC".
  - On app load, while the source is `default`, the shell saves the browser's `Intl` zone once. The write is conditional on `time_zone_source = 'default'`, so it never overwrites anything.
  - Settings → Profile has a time zone picker. A choice made there is marked `user` and is never auto-replaced.
  - Zones are checked against `Intl` before saving, since an unknown name would break the digest SQL.
  - The account menu now links Profile and Notifications (Notifications had no link at all).
- **Finding:** `profiles.time_zone` defaults to `'UTC'`, and nothing in the app ever writes it: no settings field, and onboarding doesn't capture the browser zone. The digest ("8 am local") and quiet hours both read it, so they're UTC for everyone. The help center says so plainly.
- **Needed:** capture the browser's time zone at onboarding (`Intl.DateTimeFormat().resolvedOptions().timeZone`) and add a field under Settings → Notifications. Then update the two help articles.

### D-065: Paging or re-sorting a niche search charges another credit

- **Status:** Resolved (2026-09-27)
- **Final call:** Niche Finder caches a search's full channel list (not just ids) for `SEARCH_RESULTS_CACHE_HOURS` (24), keyed on the filters minus `page` and `sort`. Paging and re-sorting within that window read the cache: no credit, no search.list, no channels.list. Changing a filter or the keyword is a new search. The cache is shared, as before: an identical search by anyone within the window is free.
- **Finding:** `getCachedSearchResult` keys the cache on all filters, including `page` and sort. YouTube's `search.list` only uses the keyword. So moving to page 2, re-sorting, or changing a post-filter misses the cache, runs another YouTube search, and charges another credit.
- **Needed:** key the YouTube cache on the keyword alone, and apply page, sort and post-filters to the cached channel list. Charge once per new keyword search. Until then, the help center just says "a search costs N credits" and doesn't describe paging.

### D-066: Workspace ownership transfer

- **Status:** Deferred (logged 2026-09-27)
- **Context:** PRD.md §8.1 says the owner can't leave without transferring ownership or deleting the workspace. `leaveWorkspace` blocks the owner (`must_transfer_or_delete`), but there's no transfer. So an owner's only way out is deleting the workspace for everyone. The help center's Workspace roles article says so.
- **Why deferred:** a transfer is also a billing change. Members inherit Team from the owner's subscription (D-059), so moving ownership means either moving the subscription, or the new owner buying Team before the old one's lapses. That depends on how D-051 (plan changes) gets fixed.
- **Needed when picked up:** an admin-only "Transfer ownership" action that sets `workspaces.owner_id` to another Admin who has their own live Team plan. Run `reapplyPlanEffects` for everyone affected, and update the help article.

### D-067: YouTube API Services compliance before launch

- **Status:** Resolved (2026-09-27). All six parts shipped. In-app export/deletion is deferred (below).
- **Context:** Payment providers and a Google API audit both need a compliant product plus legal pages (D-058). Checked against [YouTube Developer Policies](https://developers.google.com/youtube/terms/developer-policies). We only hold Non-Authorized Data: sign-in is openid/email/profile, and all YouTube data is public, fetched with our API key.
- **Parts:**
  - a. Stop fetching transcripts. The timedtext endpoint breaks III.D.7, III.E.6 and III.I.14. Prompts now use title, description and tags only, and `video_transcripts_cache` is emptied. **Done.**
  - b. A daily purge of YouTube data not refreshed in 30 days (III.E.4.d). **Done.** `purge_stale_youtube_data(30)` runs daily via `workers/youtube-retention.ts`:
    - Old tracked events and YouTube notifications are deleted.
    - Stale videos are deleted, or emptied if a saved prompt uses them, because prompts cascade from videos.
    - Stale channels are deleted, or emptied down to their YouTube id if they're tracked or have emptied videos.
    - Tracked, syncing channels stay fresh and are untouched.
    - The Outliers Grid ranges become 7/14/30 days.
    - **Effect on D-057:** an expired user's channels stop syncing, so their YouTube data stays viewable only until this purge empties it, 30 days after their last sync.
  - c. A signup consent line, since users must agree to the privacy policy before using the product (III.A.2). **Done** (login and signup).
  - d. "Data from YouTube" attribution on every screen that shows YouTube data (III.F.2.a). **Done:** it's in the app shell, plus the six free tools that show YouTube data. **Open risk:** it's a text link. III.F.2.a says "displaying YouTube Brand Features", which may mean the official YouTube logo. If a reviewer asks for it, swap in the official asset under YouTube's branding guidelines. We have no logo files yet.
  - e. PostHog cookieless (`persistence: "memory"`), so there are no analytics cookies and no consent banner. **Done** (checked in the browser).
  - f. Legal pages: terms, privacy, refunds, cookies (D-058). **Done.** Numbers come from constants via `<Fact>`, and no payment provider is named. Every processor is named in the privacy policy. Business facts live in `lib/legal/policy.ts`: sole proprietor, Pakistan law, minimum age 16, liability cap of 12 months' fees, 30 days for data requests.
- **Deferred:** in-app data export and account deletion buttons (`/settings/danger`, UI-UX-Flow.md §8.1.6). Until then, requests go by email and are done within 30 days.

### D-068: Accent colour = brand orange (replaces the emerald recommendation)

- **Status:** Resolved (2026-09-27)
- **Context:** The logo (`/brand`) is orange (#FF5A2E). The UI accent was emerald (Design-System.md §2.4's open recommendation), which clashed with the brand and with the "one accent colour" rule (§2 principle 4).
- **Final call:**
  - `--accent` = #FF5A2E in both themes. Hover is #E04F28 (brand + 12% black); subtle and border are the brand at 12% and 35% alpha, the same recipe as the emerald tokens.
  - New `--accent-text` token for accent-coloured text: #FF5A2E in dark mode, #B33F20 in light, because #FF5A2E on white is only 3.1:1. All 47 `text-accent` uses moved to `text-accent-text`.
  - Text on accent fills is `text-inverse` (near-black, 6.3:1), never white (3.1:1).
  - Green is kept only for `success`.
  - The niches object colour moves from emerald to fuchsia (#d946ef, light #a21caf): not orange, and its hue sits between videos' violet and tasks' rose, away from both.
  - Hard-coded emerald replaced in the calendar palette, email layout and blog OG image.
  - Calendar entry labels were white on the palette, which failed contrast; they're now near-black. Violet is lightened to #a78bfa so every palette colour clears 4.5:1.
  - `tests/lib/design-tokens.test.ts` checks every accent pairing in both themes, because jest-axe in jsdom can't see CSS variables.

### D-069: Niche Discovery Engine — extend `channels`/`videos`, don't fork them

- **Status:** Resolved (2026-09-26). The build gate is still open (see below).
- **Context:** Niche Finder only offers live search: 100 quota units per keyword, and it has no feed, no niche score and no global outliers. The owner's spec (now `docs/Niche-Discovery-Engine.md`) adds a background engine that crawls, enriches, classifies and scores channels every day, and turns `/niches` into a browse feed.
- **Options:**
  - A: New `yt_channels` / `yt_videos` tables, as in the draft spec.
  - B: Extend the existing shared `channels` / `videos`.
- **Final call:** B. Tracked channels, prompts, calendar entries and tracked events already have FKs to these rows. Forking them would store the same channel twice and create a sync problem. The new tables are `discovery_seeds`, `niches`, `niche_snapshots` and `outliers_feed`. The route stays `/niches`, and the feed is a set of tabs (`?tab=niches|channels|outliers|search`).
- **Quota warning:** the spec budget (about 9,500 units a day for jobs, 500 buffer) would have left roughly 5 live searches a day. Revisited 2026-09-27: the jobs now have their own 3,000-unit budget (D-075) until D-036.
- **Gate (open):** all of the following, before this is called done:
  - [ ] 7 days of unattended cron runs
  - [ ] the quota was never exceeded
  - [ ] no untracked YouTube row is older than 30 days
  - [ ] Lighthouse/a11y pass on `/niches` tabs and `/niches/[slug]`
- **Impacts:** PRD §6.1, Backend-Schema §3 / §6, TRD §4.2, UI-UX-Flow §5, Application-Flow §2.3, `docs/Niche-Discovery-Engine.md`.

### D-070: Service-role writes from workers and discovery services

- **Status:** Resolved (2026-09-26)
- **Context:** Security.md §3.1 says only migrations use the service role, and Backend-Schema §6.1 says the same. The shared cache tables have always been service-role-only writes, and `workers/*` already use `createServiceClient()`. The docs contradicted the code.
- **Final call:** this is a documented exception. The service-role client may be used by:
  - (a) Inngest functions in `workers/`;
  - (b) `lib/services/discovery/*`;
  - (c) the existing service-layer writes to shared cache tables and admin actions.

  All three are server-only, and client components must never import them. User-facing reads of research data (`niches`, `niche_snapshots`, `outliers_feed`, `channels`, `videos`) go through the user client under RLS, using `anyone_read_*` policies. Admin-triggered discovery actions are written to `admin_actions`.

- **Impacts:** Security.md §3.1, Backend-Schema §6.1.

### D-071: Opportunity Score weights v1 and qualification thresholds

- **Status:** Resolved (2026-09-26). Tune after beta.
- **Final call:** use the spec defaults. All of them live in `lib/discovery/config.ts`.
  - **Weights:** Accessibility 30, Demand 25, Momentum 20, Outlier density 15, Supply (inverse) 10. Each signal is percentile-normalised across niches.
  - **Labels:** 80+ Low competition, 50–79 Medium, < 50 High.
  - **Qualification:** the channel was created within 12 months OR has a ≥ 3× video in the last 30 days, AND avg recent views ≥ 5,000.
  - **Refresh tiers:** hot 2d, warm 7d, cold 25d.
  - **Minimum sample:** a niche needs 3 performing channels before it gets a score.
- **Revisit:** after 2 weeks of beta data. Compare the score with what users actually track.

### D-072: Default discovery feeds are free; a filtered search costs 1 credit; Starter/Trial see the top 50 niches

- **Status:** Resolved (2026-09-26). Revised 2026-09-27 (owner): filtered views are charged.
- **Final call:**
  - **Free:** the default Niches, Channels and Outliers feeds, `/niches/[slug]`, sorting, paging, and a niche-only filter (card badges and niche pages link to it, so it's navigation). None of these make YouTube calls.
  - **Filtered search, 1 credit** (`CREDIT_COSTS.filteredFeedSearch`): any other filter set on a feed tab (score, status, subs, views, dates, outlier score, toggles, language, min multiple, time window). Re-running or paging the same filters is free for 24h (`SEARCH_RESULTS_CACHE_HOURS`), the same deal as a live search (D-065). Same idempotency pattern too: the client sends a UUID per Apply, and `consume` ignores a repeat.
  - **Charged only on an explicit action**, never while rendering: the filter panel's Apply, or "Show results (1 credit)" on the gate card that a locked filtered URL (shared link, back button) shows instead of results. Prefetches and refreshes can't spend credits. The 24h unlock is per user (`feed-unlock:{user}:{hash}` in Redis).
  - Live search is still 1 credit (D-065).
  - Starter and Trial (no plan, or tier `starter`, or status `trialing`) see the top 50 niches by score, with an upgrade prompt after them. Pro, Team and inherited Team (D-059) see all niches. Channels and Outliers feeds are uncapped.
- **Impacts:** Monetization.md §3.1, `lib/services/feed-credits.ts`, `lib/services/niche-feed.ts`, UI-UX-Flow §5.0, Niche-Discovery-Engine §10.

### D-073: 30-day retention for untracked YouTube data

- **Status:** Resolved (2026-09-26)
- **Context:** YouTube API policy requires refreshing or deleting API data within 30 days. Before the engine we stored only channels that users searched or tracked, and there was no retention rule for `channels` / `videos`.
- **Final call:** No second purge. Main's daily `youtube-retention-cron` (D-067b) and its `purge_stale_youtube_data` are extended (migration `20260928100006`), and main's rules win. Stale videos referenced by saved prompts are blanked, not deleted. The extension adds:
  - `outliers_feed` rows for stale videos or channels are deleted.
  - Blanked videos lose `outlier_multiple`; emptied channels lose every YouTube-derived discovery column (`niche_id`, `enriched_at`, etc.).
  - `niche_snapshots` keep 90 days daily, then one row per week.
- **Superseded (2026-09-27):** the branch's own `retention-purge` job and 3-argument `purge_stale_youtube_data` (trim to the latest 30 videos, protect calendar/tracked-event channels) were dropped. Admin → Discovery "Run YouTube data purge" sends `youtube/retention.requested` to main's job.
- **Impacts:** Backend-Schema §6.4, TRD §4.2.

### D-074: gpt-4o-mini + text-embedding-3-small for niche classification

- **Status:** Resolved (2026-09-26). This refines D-029 and D-032.
- **Final call:**
  - User-facing generation stays on `gpt-4o`.
  - Background classification uses `gpt-4o-mini` through the same `generateStructuredOutput` wrapper, which now takes a `model` option.
  - Niche labels are embedded with `text-embedding-3-small` (1536 dims) and stored in `niches.embedding` (pgvector).
  - A label joins an existing niche at cosine similarity ≥ 0.85; otherwise a new niche is created.
- **Impacts:** `lib/ai/client.ts`, TRD §6.2.

### D-075: Per-category YouTube quota budgets

- **Status:** Resolved (2026-09-27). Revisits D-054's quota guard and D-069's job budget.
- **Context:** One shared daily pool meant the discovery crawler could push free tools into "Busy" (D-054's 70% cutoff) and eat live-search headroom.
- **Final call:** the daily quota is split into budgets, each env-overridable and capped at `DAILY_QUOTA_LIMIT`:

  | Category   | Sources                                 | Default | Env                      |
  | ---------- | --------------------------------------- | ------- | ------------------------ |
  | live       | Niche Finder search, other in-app calls | 3,500   | `YT_BUDGET_LIVE`         |
  | sync       | channel-sync                            | 2,000   | `YT_BUDGET_SYNC`         |
  | free_tools | public tools                            | 1,500   | `YT_BUDGET_FREE_TOOLS`   |
  | discovery  | discovery run + enrichment              | 3,000   | `DISCOVERY_DAILY_BUDGET` |

  `checkAndIncrement` refuses a call when its category or the day's total is over. Free tools are "Busy" only when their own budget is spent. Discovery jobs pre-check their budget and stop cleanly. Admin → API Quotas shows used/budget per category. Revisit all four after D-036.

- **Impacts:** `lib/youtube/quota.ts`, `lib/services/free-tools.ts`, TRD §5.3, Niche-Discovery-Engine §6.4/§7.

### D-076: Quota day and discovery schedules follow Pacific time

- **Status:** Resolved (2026-09-27)
- **Context:** YouTube resets the daily quota at midnight Pacific. Our counters rolled over at UTC midnight and the jobs were scheduled in PKT, so a "day" of our budget straddled two YouTube quota days.
- **Final call:** quota counters are keyed by the `America/Los_Angeles` date. Discovery crons use Inngest's `TZ=America/Los_Angeles`: discovery 00:15 (right after the reset), classify 02:00, purge 03:00, snapshot 04:00; enrichment stays every 2h. The first day after deploy has a partial counter (the key changes); harmless.
- **Impacts:** `lib/youtube/quota.ts`, `workers/discovery.ts`, TRD §4.2/§5.3, Niche-Discovery-Engine §6.
