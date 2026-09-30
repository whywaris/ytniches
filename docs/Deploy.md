# YTNiches — Deploy (rebuild → production)

2026-09-29 · first production deploy of the rebuild

## Ground rules

- **Production database: `ossrqwoorqxbgyzzoosz`** (formerly ytniches-dev). There's no separate prod project; a new dev project comes back once the old live project is retired. See CLAUDE.md §4.2.1.
- **Never touch** Supabase `keafgjfqekrbgkohhcnm` (the old live product) or the old Vercel project `ytniches` (its variables and deployments stay as they are).
- The rebuild gets a **new** Vercel project. It's tested on its `*.vercel.app` URL first; `ytniches.com` moves only after the owner signs off.
- **One YouTube quota:** dev and prod share one `YOUTUBE_API_KEY` and one Upstash Redis, so there's one quota and one set of quota counters (D-075).
- **Secrets:** the owner enters them, never pasted into chat or committed.
- **Data changes on production:** listed first, applied only after the owner approves.

Each step says who does it. Wait for the previous step to finish.

## Step 1 — Clean test data from production (Claude lists, owner approves, Claude applies)

- **Keep:**
  - the owner's account (super_admin), with its tracked channels, prompts and notifications;
  - all discovery data (seeds, niches, channels, videos, tags, snapshots, the outlier feed, suggestions);
  - the plan defaults in `credit_allocations`.
- **Remove:** test users and test-workspace data; the Creem **test-mode** subscription and its webhook events; admin credit grants.
- **Owner's account:** goes back to a beta trial: `pro` / `trialing` (D-081), with a fresh trial credit grant.
- **Owner, in Creem:** also cancel the test-mode subscription in the Creem **test** dashboard, so a renewal webhook can't recreate it.

## Step 2 — Database checks (Claude)

1. Confirm every file in `supabase/migrations/` is applied (they were applied as they were written). New migrations go through CI's `pnpm test:sql` first.
2. Run the Supabase security and performance advisors, fix anything a migration should have covered, and report the rest.

## Step 3 — Auth settings on `ossrqwoorqxbgyzzoosz` (owner)

In the Supabase dashboard → the project → **Authentication**:

1. **URL Configuration:**
   - Site URL: the new Vercel URL from step 5 for now; `https://ytniches.com` at cutover (step 8).
   - Redirect URLs: keep `http://localhost:3000/**`, and add `https://<new-project>.vercel.app/**` and `https://ytniches.com/**`.
2. **Providers → Google:** already set up for local; nothing changes. The callback is Supabase's own URL.
3. **Providers → Email (D-083):**
   - Enabled; **Confirm email: ON**; Secure email change: ON.
   - Password: minimum length **12**; requirements **lowercase, uppercase letters and digits**; **leaked password protection ON** (needs the Pro plan).
   - Email OTP expiration: **3600** seconds.
4. **Emails → SMTP settings:**
   - Custom SMTP on. Sender `hello@ytniches.com`, name `YTNiches`.
   - Host `smtp.resend.com`, port `465`, username `resend`.
   - Password: a Resend API key with **Sending access** for the `ytniches.com` domain.
   - Minimum interval between emails: 60 s.
5. **Emails → Templates:** paste `supabase/templates/confirm-signup.html` into "Confirm signup" and `supabase/templates/reset-password.html` into "Reset password". The subjects are in each file's header comment.
6. **Rate limits:** emails sent per hour **100**; sign-ups and sign-ins per IP at the default.
7. **Attack Protection → CAPTCHA:** on, provider **Cloudflare Turnstile**, the Turnstile **secret key**. Turn this on only once the deployed code includes the Turnstile widget: from then on, every password sign-in without a token fails, locally too. The public **site key** goes in Vercel and `.env.local` as `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.

## Step 4 — Inngest Cloud (owner)

1. In Inngest Cloud, create or open the **production** environment.
2. Copy its **Event key** and **Signing key** (Manage → Keys). They go into Vercel in step 5.

## Step 5 — New Vercel project (owner creates it, Claude checks it)

1. Vercel → **Add New → Project** → import `whywaris/ytniches`, production branch `main`. Suggested name: `ytniches-app`. Don't add a domain yet.
2. Add these environment variables (Production):

   | Variable                                                                                 | Where the value comes from                                                    |
   | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
   | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | same as `.env.local` (this project is now production)                         |
   | `NEXT_PUBLIC_SITE_URL`                                                                   | `https://<new-project>.vercel.app` for now; `https://ytniches.com` at cutover |
   | `YOUTUBE_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`                  | same as `.env.local` (one quota, one counter)                                 |
   | `OPENAI_API_KEY`, `RESEND_API_KEY`, `RESEND_NEWSLETTER_SEGMENT_ID`                       | same as `.env.local`                                                          |
   | `NEXT_PUBLIC_ADMIN_EMAIL`                                                                | your admin email                                                              |
   | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`                                                         | Cloudflare → Turnstile → the `YTNiches auth` widget → **Site key** (public)   |
   | `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`                                                   | same as `.env.local`                                                          |
   | `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`                                    | optional (analytics off without them)                                         |
   | `INNGEST_SIGNING_KEY`, `INNGEST_EVENT_KEY`                                               | step 4                                                                        |
   - **Do not set** `INNGEST_DEV`.
   - Creem keys aren't needed while `BETA_MODE` is on (D-081): there's no checkout.
   - `YT_BUDGET_*` and `DISCOVERY_DAILY_BUDGET` are optional; the code defaults are the D-075 budgets.

3. Merge the rebuild PR into `main` (squash), and let Vercel build it. Send Claude the new project name.
4. **Claude checks the deployment:**
   - the build log;
   - `/`, `/pricing`, `/login` and `/help` render;
   - `/api/inngest` responds;
   - runtime logs show no errors.

## Step 6 — Sync Inngest (owner, Claude verifies)

1. In Inngest Cloud → Apps → **Sync new app**: `https://<new-project>.vercel.app/api/inngest`.
2. Claude confirms that all functions registered.
3. **From here on, stop running `pnpm dev:inngest` locally.** Production jobs run in Inngest Cloud only, and they run for real every day:
   - discovery at 00:15 Pacific (within the 3,000-unit discovery budget);
   - classify (a few cents a day in OpenAI) and the niche snapshot;
   - hourly channel sync;
   - email digests.

## Step 7 — Test on the Vercel URL (owner)

Sign in with your admin account (already `super_admin`), and test sign-up with a second address, onboarding, the Niche Finder, the admin pages and pricing.

## Step 8 — Cutover to ytniches.com (owner decides; later)

1. Remove `ytniches.com` from the old `ytniches` Vercel project and add it to the new project. The old deployments stay available for rollback.
2. Set `NEXT_PUBLIC_SITE_URL` to `https://ytniches.com` and redeploy.
3. In Supabase → Authentication → URL Configuration, set the Site URL to `https://ytniches.com`.
4. Re-sync Inngest at `https://ytniches.com/api/inngest`.
