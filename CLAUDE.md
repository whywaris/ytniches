# CLAUDE.md — AI Assistant Guide for YTNiches

2026-09-19 · @Someone

---

## 1. What This File Is

CLAUDE.md is the first file any AI coding assistant (Claude Code, Cursor, GitHub Copilot with instructions, or new human collaborators) should read when working in this repo. It's the shortest possible orientation — not the specs themselves, but a pointer to where the specs live and what to do first.

**If you're an AI assistant:**

- Read this file first.
- Then read the spec doc most relevant to the task (§3 lists them).
- Then read the specific code area you'll touch.
- Only then start writing code.

**If you're a human developer:**

- Same order. Even if you wrote the last feature, the specs may have changed.
- Never assume you know what the current spec says. Read it.

**What NOT to do:**

- Do not start coding from a Slack message or a verbal ask alone. Every non-trivial change references a spec doc; if no spec covers it, ask for one or file it as a scope question in DECISIONS.md.
- Do not modify specs from code PRs. Spec changes go through their own PR (or Doc edit) with review.
- Do not invent features not in the PRD or specs. Feature requests go to DECISIONS.md, not into code.

**Golden rule:**

The previous MVP failed because implementation drifted from unclear specs. This rebuild inverts that: **specs are the source of truth, code follows specs, and any divergence is a spec bug, not a code convenience.**

## 2. Repo Layout & Conventions

### 2.1 Layout

See TRD.md §1.4 for the full tree. Quick reference:

- `app/` — Next.js pages, grouped by auth boundary
- `components/ui/` — primitives from Design-System.md; do NOT modify without updating the design system
- `components/features/` — feature-specific composites
- `lib/services/` — all data access; components + routes call services, not Supabase directly
- `lib/<integration>/` — wrappers for external APIs (youtube, ai, billing, email)
- `workers/` — background job definitions
- `supabase/migrations/` — versioned SQL
- `docs/` — all spec docs
- `tests/` — unit + integration

### 2.2 TypeScript conventions

- `strict: true` in `tsconfig.json` — no exceptions
- No `any`, ever. Use `unknown` + narrowing if the type is genuinely unknown.
- Prefer type inference; annotate only when it aids clarity.
- Discriminated unions for state machines (matches Application-Flow.md §4).
- Zod schemas at every trust boundary (user input, third-party responses).

### 2.3 Git conventions

- Branches: `feature/<short-name>`, `fix/<short-name>`, `chore/<short-name>`, `spec/<short-name>` (spec doc changes)
- Commits: conventional commits format: `feat(niche-finder): add country filter`
- PR title: same format
- PR body must include: what changed, spec doc referenced, screenshots for UI changes, testing done
- Squash on merge; keep main history clean

### 2.4 Testing conventions

- **Unit tests:** required for `lib/services/` and `lib/` utilities. Fast, no network.
- **Integration tests:** required for API routes and server actions. Hit test Supabase project.
- **E2E tests:** Playwright for critical user flows (signup, first search, upgrade). Not exhaustive — focused on money paths.
- **Accessibility tests:** jest-axe on every UI primitive.
- Coverage target: 70% overall, 90% on `lib/services/` and `lib/billing/`.

### 2.5 Code style

- ESLint + Prettier (config in repo). Format on save.
- Component files: one component per file, named export matches file name.
- Import order: react/next, third-party, absolute internal, relative, types (enforced by ESLint).
- Comments: explain **why**, not **what**. If the code is confusing, refactor it before commenting.

## 3. Spec Doc Map

Every non-trivial change must reference at least one of these. If none fit, the change probably needs a spec first — file it in DECISIONS.md before writing code.

| Doc                        | When to read                                           | When to update                                          |
| -------------------------- | ------------------------------------------------------ | ------------------------------------------------------- |
| **PRD.md**                 | Building any feature; understanding scope              | New feature added or removed from a phase               |
| **DECISIONS.md**           | Any question about "why did we choose X?"              | Every open question that must resolve; every resolution |
| **Design-System.md**       | Any UI change (component composition, colors, spacing) | New primitive component added; token change             |
| **Implementation-Plan.md** | Phase planning, checkpoints, timeline                  | Phase gate outcome; scope change                        |
| **UI-UX-Flow.md**          | Building any screen; understanding layout + states     | Screen behavior changes                                 |
| **Application-Flow.md**    | Routing, auth, state machines, error handling          | New route added; state machine change                   |
| **Backend-Schema.md**      | Any DB touch (queries, migrations, RLS)                | Every migration; index or RLS change                    |
| **TRD.md**                 | Architecture, integrations, caching, jobs              | New integration; caching strategy change                |
| **Security.md**            | Auth, RLS, PII, sensitive endpoints                    | Threat model change; new sensitive surface              |
| **Landing-Page-Spec.md**   | Landing page build (once written)                      | Landing structure change                                |
| **Landing-Copy.md**        | All marketing copy (once written)                      | Copy revisions                                          |
| **Monetization.md**        | Billing, credits, tiers (once written)                 | Pricing / tier change                                   |

### 3.1 Referencing specs from PRs

Every PR body must include a `Specs referenced:` line:

```
Specs referenced:
- PRD.md §6.1 (Niche Finder)
- UI-UX-Flow.md §5 (Niche Finder screens)
- Backend-Schema.md §3.1 (channels table)
```

If you can't cite a spec, the PR isn't ready to open. Either the change is unspecced (→ file a spec question) or you haven't read the specs yet (→ read them).

### 3.2 When specs conflict with each other

Occasionally two docs will disagree. When that happens:

1. **Do not silently pick one.** File a comment on both docs asking which is right.
2. **PRD wins on product scope + feature intent.**
3. **Backend-Schema wins on data model.**
4. **Design-System wins on visual language.**
5. **DECISIONS.md wins on any resolved decision (it's the newest record).**

Update the losing doc after resolution.

## 4. Common Tasks & Gotchas

### 4.1 Common tasks — how to do each

**Add a new API endpoint:**

1. Check TRD.md §3 (Backend patterns) + Application-Flow.md §2 (URL routing)
2. Write the service function in `lib/services/`
3. Wrap in a Server Action (client-called) or Route Handler (webhook / cron)
4. Add Zod schema for input validation
5. Add integration test
6. Reference PRD feature this supports

**Add a new DB table:**

1. Check Backend-Schema.md — does one already fit?
2. Write migration in `supabase/migrations/`
3. Enable RLS + write policies (Backend-Schema.md §6.1 for the standard pattern)
4. Add indexes per query pattern
5. Regenerate TypeScript types (`pnpm supabase:types`)
6. Update Backend-Schema.md with the new table

**Add a new UI component:**

1. Check Design-System.md — does a primitive exist?
2. If yes, compose from primitives; if no, add primitive to `components/ui/` + Storybook + update Design-System.md
3. Cover all states: default, hover, focus, active, disabled, loading (per Design-System.md §5)
4. Ensure dark + light modes work
5. Add jest-axe test

**Add a new background job:**

1. Check TRD.md §4 for existing jobs
2. Define event + handler in `workers/`
3. Ensure handler is idempotent (see TRD.md §3.4)
4. Set timeout, retry policy, dedup key
5. Add integration test that simulates the job

### 4.2 Gotchas

- **RLS is not a suggestion.** Never `bypass_rls` in application code. If a query needs it, that's an admin action — use the service role from a server-only context with an audit log entry.
- **YouTube API quota is real.** Every fetch goes through the wrapper (`lib/youtube/`) that checks cache first. See TRD.md §5.3.
- **Credit consumption must be idempotent.** Use `idempotency_key` on every consumption. See TRD.md §3.4.
- **Webhooks are unreliable.** Design every webhook handler to be safely retryable. Signature-verify before doing anything.
- **`useEffect` for data fetching is a bug.** Use server components or SWR/TanStack Query.
- **`localStorage` for auth state is a bug.** Sessions live in HttpOnly cookies managed by Supabase.
- **Never inline hex colors in components.** Use design tokens from Tailwind config.
- **Never mix icon libraries.** Lucide only (per Design-System.md §3.4).
- **Do not add JS to marketing pages** unless the page is genuinely interactive. Landing + blog should hydrate minimally for Core Web Vitals.
- **PostgreSQL enums are hard to change.** When you need to modify one, use a migration that adds new values first, migrates data, then removes old values in a later PR.

### 4.2.1 Production database (2026-09-29)

- **`ossrqwoorqxbgyzzoosz` (formerly ytniches-dev) is PRODUCTION.** Treat every write to it as a production write.
- **`keafgjfqekrbgkohhcnm` (the old live product) is never touched,** not even for reads.
- **Migrations:** run in CI's test Postgres first (`pnpm test:sql`), then apply to production.
- **Never point local jobs at production:** don't run `pnpm dev:inngest` against it, and never run the purge, discovery or enrichment jobs, or their tests, against it from a laptop. Production jobs run only through Inngest Cloud.
- **Data changes on production:** list what will change first, and change it only after the owner approves.
- **A separate dev Supabase project** comes back once the old project is retired; until then, local development has no safe database for jobs.
- The deploy runbook is `docs/Deploy.md`.

#### How production migrations are applied and matched

- **Never run `supabase db push`, `supabase db reset`, `supabase migration up` or `supabase link` against production.** Every migration must run in CI first and be approved by the owner; the CLI skips both. `db push` also decides what to run by comparing migration _versions_, so a single mismatched history row would make it re-run that migration against production (for example `curated_niche_taxonomy` starts with `delete from public.niches`). The repo is deliberately not linked to any Supabase project.
- **Production's history matches the repo (reconciled 2026-09-29):** `supabase_migrations.schema_migrations` has exactly one row per file in `supabase/migrations/`, with the file's version and name. Keep it that way: every file gets exactly one row with its own version.
- **How a migration reaches production:**
  1. CI is green on the latest commit (§4.2.2).
  2. The owner approves.
  3. Confirm production's history has a row for every earlier repo file, with the same version and name.
  4. Apply the repo file's SQL verbatim with the Supabase MCP `apply_migration`, named after the file without its version prefix.
  5. `apply_migration` records the apply time as the version, so in the same session set that row to the file's version: `update supabase_migrations.schema_migrations set version = '<file version>' where version = '<recorded version>' and name = '<name>'`. Then confirm `list_migrations` matches the repo files one to one.
  6. Verify the result: grants, `search_path`, and a read-only smoke query.
- **History notes:**
  - Before the reconciliation, rows carried apply-date versions, and `20260923100002_add_workspace_rls_policies` was recorded as `fix_workspace_members_rls_recursion`. Those rows are kept in `supabase_migrations.schema_migrations_backup_20260929`.
  - Each row keeps the SQL production actually ran. Ignoring comments, that matches the repo file for 47 of 50 migrations. `create_workspace_tables`, `add_workspace_rls_policies` and `create_discovery_functions` ran earlier drafts, and production was brought in line outside the history. Production's live policies, workspace functions, grants and `purge_stale_youtube_data` match the repo (checked 2026-09-29).

### 4.2.2 CI status (2026-09-29)

- **Never report CI as green without checking the latest run** on the latest commit (`gh run list --limit 1` or the Actions page), both jobs (`ci` and `sql`). A local `pnpm test` pass is not CI: CI also runs `pnpm test:sql` against Postgres, and test order differs.
- **Don't stack new work on a red CI.** When the latest run is red, fixing it is the next task; new features and production migrations wait until it's green.
- **A test that fails in the full suite but passes alone is not a flake** until proven otherwise; with `isolate: false`, suspect state leaking between files.

### 4.3 Pre-ship checklist

Before opening a PR:

- [ ] Types check: `pnpm typecheck`
- [ ] Lint: `pnpm lint`
- [ ] Tests: `pnpm test`
- [ ] Storybook: new components have stories
- [ ] Screenshots for UI changes in PR body
- [ ] Spec doc(s) referenced in PR body
- [ ] If DB change: migration up + down both tested locally
- [ ] If new environment variable: added to `.env.example` + deploy env config note in PR

### 4.4 If you're stuck

- **Spec unclear or missing:** file a comment on the relevant doc; open a scope question in DECISIONS.md
- **Third-party unknown behavior:** log to Sentry, add a defensive branch, ask before assuming
- **Time pressure to skip a step above:** don't. This is exactly how the previous MVP failed. Ship one thing well or ship nothing.
