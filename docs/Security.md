# YTNiches — Security

2026-09-19 · @Someone

---

## 1. Overview, Threat Model & Principles

### 1.1 What we're protecting

- **User accounts** — email, OAuth identity, session tokens
- **User payment info** — handled by billing provider (Stripe/Paddle), never touches our DB
- **User-generated content** — prompts, notes, tracked lists, workspace data
- **YouTube API credentials** — our server-side API key
- **AI provider credentials** — our server-side key
- **Admin accounts** — super\_admin role with broader access
- **Aggregate business data** — MRR, user counts, quotas

### 1.2 Realistic threat model

| Actor                     | Motivation                               | Likelihood | Impact                                                   |
| ------------------------- | ---------------------------------------- | ---------- | -------------------------------------------------------- |
| Opportunistic attackers   | Credential stuffing, cred harvesting     | High       | Low–Medium (account takeover of one user)                |
| Automated bots            | Free-tier abuse, scraping                | High       | Medium (cost / quota exhaustion)                         |
| Malicious user (paid)     | Extract other users' data via API misuse | Medium     | Medium–High (data leak)                                  |
| Competitor scraping       | Steal our aggregated data                | Low–Medium | Low (data is public YouTube data anyway)                 |
| Targeted attack           | Nation-state / sophisticated             | Very low   | Very high (out of scope for MVP; standard controls only) |
| Insider (Mac / developer) | Accidental exposure                      | Medium     | High if it happens                                       |

### 1.3 Security principles

1. **Default deny.** RLS blocks reads by default; policies allow specific access. Same for API routes.
2. **Least privilege.** Users see only their own data. Staff sees only what support needs. Super-admin scoped to Mac.
3. **Never trust the client.** All validation server-side. All authorization server-side. Client-side checks are UX only.
4. **Defense in depth.** RLS + middleware + service-layer checks. Any one layer failing shouldn't cause exposure.
5. **Secrets never in code.** Env vars only. Never logged, never sent to Sentry, never returned in responses.
6. **Reversible mistakes.** Soft-deletes with recovery window; audit logs on admin actions; every destructive action confirms.
7. **Public YouTube data isn't a secret.** The cached data itself doesn't need heavy protection — the relationships (who tracks whom) do.

### 1.4 Out of scope for MVP

- SOC 2 certification (revisit at 100+ paying customers)
- Penetration testing (revisit at 500+ paying customers)
- Bug bounty program (revisit at 1000+ paying customers)
- Data residency / regional deployments
- HIPAA / PCI (not applicable — no health data, no card data handled directly)

GDPR compliance IS in scope from launch (EU users likely from day 1).

## 2. Auth Security

### 2.1 Password requirements (email + password users, D-083)

- Minimum 12 characters, maximum 128.
- Must include: one lowercase letter, one uppercase letter, one number.
- **Enforced in three places:**
  - the form's live checklist;
  - the server action (`lib/auth/credentials.ts`);
  - Supabase Auth's own password policy (min length 12; lowercase, uppercase and digits).
- **Breached passwords:** checked against HaveIBeenPwned by Supabase's leaked-password protection, which needs the Supabase **Pro** plan. The app already explains the `weak_password` / `pwned` error; the check starts the moment the setting is on.
- Hashing is bcrypt, managed by Supabase Auth; the app never stores or sees password hashes.
- Never logged, never emailed, never sent as plaintext anywhere.

### 2.2 OAuth (Google, alongside email + password since D-083)

- Standard OAuth 2.0 via Supabase Auth
- Scopes requested: `openid`, `email`, `profile` — minimum needed
- **NOT requested, ever (D-086):** any YouTube API scope. YTNiches never connects to a user's YouTube account; it only reads public channel and video data with its own API key.
- Refresh tokens stored server-side only; never exposed to client

### 2.3 Session management

- Session token: JWT via Supabase Auth (HttpOnly cookie, Secure, SameSite=Lax)
- Cookie name: `sb-access-token`, path `/`, expires 30 days rolling
- Refresh on every authenticated request extends TTL
- Server-side session revocation on: password change, email change, explicit logout, admin action
- No session data stored in `localStorage` or `sessionStorage`
- Session cookie NOT accessible to JavaScript (HttpOnly enforced)

### 2.4 Login rate limiting (D-083)

- **Per email:** 5 failed password sign-ins in 15 minutes locks password sign-in for that email for 15 minutes (`lib/auth/lockout.ts`, Upstash).
  - The lock is checked **before** Supabase is called.
  - It applies to any address, account or not, so it never reveals whether an account exists.
  - Google sign-in keeps working.
  - Redis keys hold a one-way hash of the email, not the address.
- **Alert:** the account owner gets **one** email per lockout window, sent only if the address has an account (`auth_user_exists`, service role only).
- **Per IP:** Supabase Auth's built-in rate limits on sign-ups and sign-ins (default 30 per 5 minutes per IP).
- **CAPTCHA:** Cloudflare Turnstile through Supabase's built-in CAPTCHA, on **every** password sign-up, sign-in, reset and resend. That's stricter than the original "after 20 attempts" rule. Google OAuth doesn't need it.
- **Errors:** login shows one generic "Email or password is incorrect" for every wrong-credentials case, with a static "Signed up with Google?" hint for everyone. "Verify your email first" appears only when Supabase has accepted the password (it checks the password before email confirmation).

### 2.5 Password reset security (D-083)

- **Token:** Supabase Auth's single-use token (sent as a token hash), valid for **1 hour** (Supabase "Email OTP expiration" = 3600 s, shared with verification links).
- **Link:** it goes to `/auth/confirm`, which verifies the token and sets a 15-minute HttpOnly recovery cookie, then `/reset-password`. That page and its action need the cookie, so a plain signed-in session can't change the password there.
- **No enumeration:** the answer is always "If an account with that email exists, we've sent a link", including over the rate limit.
- **Rate limit:** 3 reset emails per email per hour (Upstash); over it, nothing is sent and the answer is the same.
- **Sessions:** changing the password signs out every other session (`signOut({ scope: "others" })`).

### 2.6 Email verification (D-083)

- **Required before the account is usable.** With Supabase "Confirm email" on, an email sign-up gets no session until the link is clicked. So there's no onboarding, no trial and no credits until then. Google accounts arrive verified.
- **Link:** single-use token hash, valid for **1 hour**. It opens `/auth/confirm`, which works in any browser (unlike the default PKCE link), then takes the Google path: onboarding first.
- **Re-send:** capped at 3 per email per hour (Upstash, plus Supabase's own email rate limit).
- **Admin dashboard:** counts verified accounts as signups, and shows unverified email sign-ups separately as "pending verification".
- **Account already exists:** sign-up (only there) says so and points to Google or a reset; the owner accepted this enumeration trade-off (D-083).

### 2.7 MFA (Phase 2+)

Not in MVP. When added:

- TOTP via authenticator app (RFC 6238)
- Backup codes (10 single-use)
- Enforced for super\_admin roles from day 1 of MFA rollout
- Optional for regular users, promoted after 90 days of active use

### 2.8 OAuth account linking (D-083)

- **One account per verified email:** the same email via Google and via password is one account. Supabase Auth links the identities automatically once the email is verified.
- **A Google account can add a password** through "Forgot password"; the reset adds an email identity to the same user.
- `/settings/connections` (adding or removing providers) is still future work. Until it exists, a user can't remove their last sign-in method.

## 3. Data Access & RLS

### 3.1 RLS enforcement

- Every user-scoped table has RLS enabled from day 1 (see Backend-Schema.md §6.1)
- Application code uses the user's session token — RLS filters automatically
- Migrations may use the service role (`bypass_rls`). The only other use is the documented exception in D-070: server-only code writing shared public YouTube/research tables. That covers Inngest workers, `lib/services/discovery/*` and service-layer cache writes, plus audited admin actions (§3.3). Client components never import the service client.
- Automated test: for every user-scoped table, a test asserts user A cannot read/write user B's rows via the API

### 3.2 Workspace isolation (Phase 3)

- Workspace members can access workspace data based on their `role`:
  - `admin`: read + write all; invite/remove members; delete workspace
  - `editor`: read + write content; cannot manage members or billing
  - `viewer`: read only
- Cross-workspace access is impossible via any policy — checked in RLS + service layer

### 3.3 Admin access

- Super-admin role gated by `profiles.role = 'super_admin'`
- Middleware enforces on `/admin/*` routes (redirect to 403 if missing)
- Admin routes never use the user's session for data access — they use the service role in a controlled service-layer wrapper that logs every action
- Admin actions logged to `admin_actions` (see Backend-Schema.md §6.3): admin\_id, action, target\_type, target\_id, metadata, timestamp

### 3.4 Impersonation

- Only super\_admin can impersonate; UI hidden for others
- Impersonation session flagged in JWT (`impersonating: true`, `original_admin_id: <uuid>`)
- Persistent banner "Impersonating \[name\] — Stop" visible during impersonation (impossible to hide)
- Impersonated session CANNOT:
  - Change target user's password or email
  - Delete target user's account
  - Change target user's billing / subscription
  - Access target user's payment method details
- All actions during impersonation logged with both admin and target IDs
- Impersonation session max duration: 60 minutes (auto-terminates)

### 3.5 Data export (GDPR)

- Endpoint: `POST /api/user/export` (authenticated)
- Returns: JSON archive of all user-owned data (profile, prompts, notes, tracked channels, notifications, credit events, subscription history)
- Rate limit: 1 export per 24h per user
- Email delivery with signed download URL (48h expiry)
- Never includes: other users' data, YouTube cached data (not user-owned), passwords, session tokens, internal system fields

### 3.6 Data deletion (GDPR)

- Endpoint: `DELETE /api/user/account` (authenticated, requires typing account name to confirm)
- Soft-delete with 30-day recovery window
- After 30 days, retention job hard-deletes (see Backend-Schema.md §6.4)
- Confirmation email to user's registered address
- Anonymized aggregate stats (e.g. "user churned in month N") retained — no PII

### 3.7 Data at rest

- Supabase Postgres: encrypted at rest by Supabase
- Redis: no long-term storage of PII (cache keys reference user IDs, not emails/names)
- File storage (if any Phase 3+): Supabase Storage with signed URLs, encrypted at rest

### 3.8 Data in transit

- HTTPS everywhere (Vercel enforces TLS 1.2+)
- HSTS header: `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- Internal DB traffic via Supabase pooler over TLS

## 4. API, Secrets & Webhooks

### 4.1 API authentication

- Server Actions + authenticated route handlers verify session cookie + user
- Cron endpoints require `Authorization: Bearer <CRON_SECRET>` header (secret rotated quarterly)
- Webhook endpoints verify provider signature per provider spec (Stripe: `Stripe-Signature`; Paddle: signed payload; Resend: shared secret)
- Never accept API calls without one of: session cookie, cron secret, or verified webhook signature

### 4.2 Secrets management

- All secrets in Vercel Environment Variables + Supabase Vault — never in code, never in git
- Secret categories:
  - `SUPABASE_SERVICE_ROLE_KEY` — server-only
  - `YOUTUBE_API_KEY` — server-only
  - `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` — server-only
  - `STRIPE_SECRET_KEY` / `PADDLE_API_KEY` — server-only
  - `RESEND_API_KEY` — server-only
  - `UPSTASH_REDIS_TOKEN` — server-only
  - `SENTRY_DSN` (client + server variants)
  - `CRON_SECRET`, various webhook secrets — server-only
- Public env vars prefixed `NEXT_PUBLIC_` only for non-secret values (analytics keys, public Supabase URL + anon key)
- Sensitive secret rotation: quarterly for provider keys; immediately on suspected exposure
- Never logged: secrets scrubbed from Sentry, request logs, error messages

### 4.3 Input validation

- Every API surface validates input via Zod schema before service call
- Reject unknown fields (Zod `.strict()`)
- Length limits on all string inputs (min + max)
- Enum values validated against allowed set
- Server never trusts client-provided IDs — always cross-check ownership via RLS or explicit query

### 4.4 Output serialization

- Server responses never include: password hashes, session tokens, secrets, other users' data
- Explicit allow-list of fields serialized per resource (don't `SELECT *` and return whole row)
- Error messages never reveal: whether an email exists, stack traces, DB schema details, internal state

### 4.5 CSRF protection

- Server Actions include CSRF protection via Next.js built-in (origin check)
- Route Handlers that mutate state require session cookie (SameSite=Lax protects most cases) + custom header on state-changing requests
- Webhooks are cross-origin by design — signature verification replaces CSRF token

### 4.6 XSS protection

- React auto-escapes by default; never use `dangerouslySetInnerHTML` without server-side sanitization
- User-generated markdown (notes, blog comments if added) sanitized via a whitelist (DOMPurify server-side)
- CSP header set: `default-src 'self'; script-src 'self' <analytics>; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:` (specific hosts allow-listed)

### 4.7 Rate limiting

See TRD.md §5.5 for the full table. Security-specific limits:

- Signup: 5/hr per IP
- Login: 5/15min per IP + per email
- Password reset: 3/hr per email (silent)
- API auth failures: 20/15min per IP → CAPTCHA
- Data export: 1/24h per user

### 4.8 Webhook security

- Verify signature BEFORE parsing body or doing any work
- Store raw payload + verification result in `webhook_events` for audit
- Reject replays: check `provider_event_id` against processed list
- Reject stale events: reject if event timestamp > 5 minutes old (Stripe recommends this)
- Never expose webhook URL structure in client code or logs

## 5. Compliance, Retention & Incident Response

### 5.1 GDPR (from launch)

- **Lawful basis:** contract (for signed-up users) + legitimate interest (for essential analytics)
- **Consent:** cookie banner for non-essential cookies (analytics opt-in on first visit for EU users)
- **User rights implemented:** access (data export §3.5), erasure (data deletion §3.6), rectification (edit in `/settings/profile`), portability (data export in machine-readable JSON), objection (unsubscribe links on all non-critical email)
- **DPO:** not required until we hit relevant thresholds; Mac is contact person
- **Data Processing Agreements:** in place with Supabase, Vercel, Stripe/Paddle, Resend, Anthropic/OpenAI (all standard DPAs)
- **International transfers:** all providers use Standard Contractual Clauses for EU→US transfers where applicable

### 5.2 CCPA (California users, from launch)

- Same rights as GDPR effectively: access, deletion, opt-out of sale (we don't sell)
- Privacy policy explicitly states "we do not sell your personal information"

### 5.3 Retention

See Backend-Schema.md §6.4 for the full retention table. Security-relevant:

- Auth events (login, password reset, session lifecycle): 90 days
- Admin actions: retained indefinitely (audit trail)
- Soft-deleted accounts: hard-deleted after 30 days
- Failed webhook events: 30 days for review

### 5.4 Backup + disaster recovery

- **Supabase automated daily backups** — 7-day rolling retention (Pro plan), point-in-time recovery available
- **Weekly full backup export** to separate storage (S3 or R2) with 90-day retention
- **Restore test:** quarterly, on a staging DB, verify data integrity
- **RTO (Recovery Time Objective):** 4 hours for full production restore
- **RPO (Recovery Point Objective):** 24 hours max data loss (daily backup); 5 minutes with PITR

### 5.5 Monitoring + alerting

Security-specific monitoring on top of standard Sentry error tracking:

- **Alert on:** unusual spike in auth failures (potential attack); admin action outside business hours (potential compromise); credit consumption spike per user (abuse or bug); YouTube API quota approaching limit; Supabase RLS policy violations logged
- **Delivery:** Slack channel + email to Mac + on-call rotation (once team grows)
- **Log review:** weekly review of admin\_actions + auth\_events for anomalies

### 5.6 Incident response

Every security incident follows this sequence:

1. **Detect + contain:** if actively exploited, disable the affected surface immediately (feature flag, endpoint disable). Don't wait for full understanding.
2. **Assess:** what data was accessed, how many users affected, is exploitation ongoing?
3. **Notify:** if user data confirmed exposed, notify affected users within 72 hours (GDPR requirement). Notify EU supervisory authority within 72 hours for material breaches.
4. **Remediate:** patch the vulnerability, force password reset if credentials exposed, rotate secrets if system compromised.
5. **Postmortem:** blameless write-up within 7 days; specific action items with owners and deadlines.
6. **Follow-up:** verify action items complete at 30-day check-in.

Incident severity levels:

| Level | Description                                     | Response                               |
| ----- | ----------------------------------------------- | -------------------------------------- |
| SEV-1 | Active data breach; system-wide outage          | Drop everything; contain within 1 hour |
| SEV-2 | Vulnerability discovered, no known exploitation | Patch within 24 hours                  |
| SEV-3 | Security issue, low urgency                     | Patch within 1 week                    |
| SEV-4 | Hardening opportunity                           | Backlog                                |

### 5.7 Third-party trust

- Only integrate providers with published security posture (SOC 2, ISO 27001, or equivalent)
- Currently trusted: Supabase, Vercel, Stripe, Paddle, Resend, Anthropic, OpenAI, Upstash, Sentry, PostHog / Plausible
- Any new integration triggers a mini security review before adoption

### 5.8 Developer security hygiene

- 2FA required on all provider accounts (Vercel, Supabase, GitHub, Stripe/Paddle, etc.)
- Password manager mandatory for team credentials
- No sharing of admin credentials — each person has their own admin account when team grows
- Regular dependency updates (Dependabot / Renovate configured to auto-open PRs for security patches)
