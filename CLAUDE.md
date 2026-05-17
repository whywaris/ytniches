# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Next.js dev server (port 3000)
npm run build        # Production build
npm run type-check   # TypeScript check with no emit (tsc --noEmit)
npm run lint         # ESLint via next lint
```

Install always uses `--legacy-peer-deps` due to Radix UI peer dep conflicts.

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server-only, never expose to client
NEXT_PUBLIC_ADMIN_EMAIL=            # email address that gets /admin access
LEMONSQUEEZY_API_KEY=               # server-only
LEMONSQUEEZY_WEBHOOK_SECRET=        # server-only
NEXT_PUBLIC_LEMONSQUEEZY_PRO_VARIANT_ID=
NEXT_PUBLIC_LEMONSQUEEZY_LIFETIME_VARIANT_ID=
OPENAI_API_KEY=                     # server-only
NEXT_PUBLIC_SITE_URL=
```

## Architecture

### Route Groups

The app uses three Next.js route groups that control layout nesting but don't affect URL paths:

- `(public)` — marketing pages, niche browsing, blog (no auth required)
- `(protected)` — `/dashboard/*` (requires auth session)
- `(admin)` — `/admin/*` (requires auth + `NEXT_PUBLIC_ADMIN_EMAIL` match)

Route protection happens in `src/middleware.ts` at the Edge. The middleware calls `updateSession` from `src/lib/supabase/middleware.ts`, which refreshes the Supabase auth token on every request. Unauthenticated users hitting `/dashboard` are redirected to `/?auth=login&next=<pathname>`.

### Auth Flow

`useUser` hook (mounted once at the app root) subscribes to `supabase.auth.onAuthStateChange` and fetches the full profile from `public.users` — not `auth.users` — on every `SIGNED_IN`, `TOKEN_REFRESHED`, or `USER_UPDATED` event. It writes to `useAuthStore`, which is the single source of truth for user state client-side.

New users get a `public.users` row automatically via the `handle_new_user` Postgres trigger (defined in `001_initial_schema.sql`), which runs `security definer` to bypass RLS.

### Access Control — Two Levels

1. **Database (RLS):** `002_rls_policies.sql` enforces access via `security definer` helper functions `is_admin()` and `get_user_plan()`. These helpers avoid recursive policy lookups by querying `public.users` directly. Free users can only SELECT `published = true AND is_premium = false` niches.

2. **Client:** `useNiches` hook filters the Supabase query itself (`is_premium = false` for free users) before results enter the store. `usePlan().canAccessNiche(niche)` and `useAuthStore().hasAccess(requiresPremium)` gate UI rendering.

### Zustand Stores

- **`useAuthStore`** — user profile, plan, `isAdmin`, `isAuthenticated`. `isPro()` and `hasAccess()` are functions on the store (not computed values), so they must be called as `isPro()` not used as `isPro`. Plan hierarchy: `free (0) < pro (1) < lifetime (2)` encoded as `PLAN_RANK`.

- **`useNicheStore`** — all fetched niches, `filteredNiches` (derived on every `setFilter` / `setNiches` call), and `currentNiche`. CPM range filter buckets: `'0-10' | '10-20' | '20-40' | '40+'`.

### Supabase Client Variants

Three different clients — use the right one for the context:

| File | Use when |
|------|----------|
| `src/lib/supabase/client.ts` | Client Components (`'use client'`) |
| `src/lib/supabase/server.ts` → `createClient()` | Server Components, Server Actions |
| `src/lib/supabase/server.ts` → `createAdminClient()` | API routes that must bypass RLS (webhooks, plan updates) |
| `src/lib/supabase/middleware.ts` → `updateSession()` | Edge middleware only |

`createAdminClient()` uses `SUPABASE_SERVICE_ROLE_KEY` and passes empty cookie handlers — never use it in client code.

### Payments (LemonSqueezy)

There is **no npm SDK** for LemonSqueezy. The entire integration is hand-rolled:

- `src/lib/lemonsqueezy/client.ts` — `createCheckout()` and `getCustomerPortalUrl()` via direct `fetch` to `https://api.lemonsqueezy.com/v1`
- `src/lib/lemonsqueezy/webhooks.ts` — `verifyWebhookSignature()` using `crypto.timingSafeEqual` (HMAC-SHA256)
- `src/app/api/webhooks/lemonsqueezy/route.ts` — consumes webhooks, updates `public.users` via `createAdminClient()` (service role bypasses RLS)

Webhook events that change plan: `order_created` → lifetime, `subscription_created/resumed` → pro, `subscription_cancelled/expired/refunded` → free.

### AI Tools

`src/lib/openai/client.ts` exports a singleton `OpenAI` instance and a `chat()` helper defaulting to `gpt-4o-mini`. Three API routes under `src/app/api/tools/`: niche-finder, title-generator, channel-name. All use `export const runtime = 'nodejs'`.

### Design System

- **Colors:** Warm beige palette. Background `#F5F0E8`, accent `#E8402A`. All colors are Tailwind tokens that map to CSS custom properties in `globals.css`.
- **Fonts:** `font-sans` = DM Sans (body), `font-display` = Fraunces (all headings by default via `@layer base`). Loaded via `next/font/google` in `layout.tsx` — never use `@import` in CSS.
- **Border radius:** `rounded-pill` (100px) for buttons, `rounded-card` (20px) for cards.
- **Component utilities:** `.card-warm`, `.container-site`, `.section-padding`, `.prose-warm`, `.skeleton`, `.lock-overlay` in `@layer components`.

### Database Schema Key Points

- `script_hooks` column is `jsonb` storing `[{"label": string, "text": string}]` — typed as `ScriptHook[]` in TypeScript. Never treat it as `string[]`.
- `content_calendar` is `jsonb` with shape `{ weeks: [{ week_number, label, days: [{ day, title }] }] }`.
- `saved_niches` on `public.users` is `text[]` of niche UUIDs (denormalized). There's also a normalized `public.saved_niches` junction table — both exist.
- CPM is stored as two separate numerics: `cpm_min` and `cpm_max`. Display as `$${cpm_min}–$${cpm_max}`.

### Migrations

SQL files in `supabase/migrations/` are ordered and must be applied in sequence:
1. `001_initial_schema.sql` — tables, indexes, triggers, `is_admin()`, `get_user_plan()` helpers
2. `002_rls_policies.sql` — RLS enable + all policies
3. `003_seed_data.sql` — 5 free + 10 premium niches with full content kits
