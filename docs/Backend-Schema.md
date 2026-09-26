# YTNiches — Backend Schema

2026-09-19 · @Someone

---

## 1. Overview & Conventions

PostgreSQL 15+ via Supabase. Row-Level Security (RLS) enabled on every user-scoped table from day 1. Migrations versioned in `supabase/migrations/` and applied in order.

### 1.1 Naming conventions

- Table names: `snake_case`, plural (e.g. `tracked_channels`, `credit_events`)
- Column names: `snake_case` (e.g. `created_at`, `youtube_channel_id`)
- Primary keys: always `id`, type `uuid`, default `gen_random_uuid()`
- Foreign keys: `<referenced_table_singular>_id` (e.g. `user_id`, `channel_id`)
- Booleans: prefix with `is_` or `has_` (e.g. `is_active`, `has_verified_email`)
- Enums: PostgreSQL enum types, named `<domain>_<attribute>` (e.g. `subscription_tier`, `notification_channel`)

### 1.2 Standard columns (every table)

| Column       | Type          | Default             | Notes                                      |
| ------------ | ------------- | ------------------- | ------------------------------------------ |
| `id`         | `uuid`        | `gen_random_uuid()` | Primary key                                |
| `created_at` | `timestamptz` | `now()`             | Immutable                                  |
| `updated_at` | `timestamptz` | `now()`             | Auto-updated via trigger on any row change |

### 1.3 Soft-delete pattern

User-facing content that may be recovered uses soft-delete: `deleted_at timestamptz nullable`. Queries filter `WHERE deleted_at IS NULL` by default. Hard-delete only via retention jobs after grace period (see §6.4).

### 1.4 Migration policy

- One migration per PR when possible
- Migrations are additive by default; column removal in a separate migration after code no longer reads it
- Zero-downtime migrations: never drop + rename in the same deploy; use two-step (add new → backfill → read from new → drop old)
- Every migration includes a `down` script tested locally

### 1.5 Data types cheat sheet

- Free text (short): `text` (no `varchar(n)` — use `text` + CHECK constraint if length matters)
- Long content (post body, transcript): `text`
- Integers with known bounds: `int` (Postgres int4); large counts: `bigint`
- Money: `int` in cents, never `float`; column suffix `_cents` (e.g. `price_cents`)
- Times: `timestamptz` always (never `timestamp` without zone)
- IDs from third parties (YouTube channel/video): `text`, indexed

## 2. Auth, Subscriptions & Credits

### 2.1 users (managed by Supabase Auth)

Supabase Auth manages the `auth.users` table (id, email, encrypted\_password, email\_confirmed\_at, etc.). Do not modify this table directly.

### 2.2 profiles

One-to-one with `auth.users`, holds public-facing profile data and app-specific settings.

| Column                  | Type                   | Notes                                                                                                                                                                                                                                                                                |
| ----------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`                    | `uuid`                 | FK to `auth.users.id`, primary key                                                                                                                                                                                                                                                   |
| `name`                  | `text`                 | From OAuth or user input                                                                                                                                                                                                                                                             |
| `avatar_url`            | `text` nullable        | From OAuth or user upload                                                                                                                                                                                                                                                            |
| `time_zone`             | `text`                 | IANA timezone (e.g. `Asia/Karachi`)                                                                                                                                                                                                                                                  |
| `onboarding_step`       | `int`                  | 0 (not started) through 5 (completed)                                                                                                                                                                                                                                                |
| `onboarding_skipped_at` | `timestamptz` nullable | Set when the user skips onboarding (any step); null if never skipped, including full natural completion. Distinguishes a skip from a genuine finish — both set `onboarding_step = 5` — so the dashboard can show the "Finish onboarding" banner only to skippers (UI-UX-Flow.md §3). |
| `primary_goal`          | `text`                 | 'explorer' / 'stuck' / 'grower' / 'operator'                                                                                                                                                                                                                                         |
| `youtube_channel_id`    | `text` nullable        | If user connected their channel                                                                                                                                                                                                                                                      |
| `role`                  | `text`                 | 'user' (default) / 'staff' / 'super\_admin'                                                                                                                                                                                                                                          |
| `theme_preference`      | `text`                 | 'system' / 'dark' / 'light'                                                                                                                                                                                                                                                          |
| `deleted_at`            | `timestamptz` nullable | Soft-delete                                                                                                                                                                                                                                                                          |

### 2.3 subscriptions

One-to-one active per user; historical rows preserved for audit.

| Column                     | Type                                              | Notes                                                                                                                                                                                                                                                                                                                   |
| -------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                       | `uuid`                                            |                                                                                                                                                                                                                                                                                                                         |
| `user_id`                  | `uuid`                                            | FK to `profiles.id`                                                                                                                                                                                                                                                                                                     |
| `tier`                     | `subscription_tier` enum                          | 'starter' / 'pro' / 'team' per D-011 (Monetization.md §2). Enum still carries an unused legacy 'free' value — no permanent free tier exists (Monetization.md §1.2), never assign it.                                                                                                                                    |
| `status`                   | `subscription_status` enum                        | 'active' / 'trialing' / 'past\_due' / 'cancelled' / 'paused'. Monetization.md §5.3/§6.1's "expired\_trial"/"expired" are computed (status + `trial_ends_at`/`current_period_end` vs now()), never stored — no enum value for them.                                                                                      |
| `provider`                 | `text`, `check (provider in ('creem', 'manual'))` | 'creem' (D-010, Task 5) / 'manual' (admin-granted or comp subscriptions). Was 'stripe'/'paddle'/'manual' before Task 5's migration (supabase/migrations/20260922100002_fix_subscriptions_provider_check.sql) caught up to D-010's resolution — the old constraint predated Creem and blocked every real webhook insert. |
| `provider_subscription_id` | `text` nullable                                   | External ID from provider                                                                                                                                                                                                                                                                                               |
| `current_period_start`     | `timestamptz`                                     |                                                                                                                                                                                                                                                                                                                         |
| `current_period_end`       | `timestamptz`                                     |                                                                                                                                                                                                                                                                                                                         |
| `trial_ends_at`            | `timestamptz` nullable                            |                                                                                                                                                                                                                                                                                                                         |
| `cancelled_at`             | `timestamptz` nullable                            |                                                                                                                                                                                                                                                                                                                         |
| `is_current`               | `boolean`                                         | Only one row per user has `true`                                                                                                                                                                                                                                                                                        |

### 2.4 credit\_allocations

How many credits each tier grants per billing cycle. Seeded per tier; overridden per user for grants (bonuses, comps).

| Column              | Type                   | Notes                                                                                              |
| ------------------- | ---------------------- | -------------------------------------------------------------------------------------------------- |
| `id`                | `uuid`                 |                                                                                                    |
| `user_id`           | `uuid` nullable        | Null = default allocation for tier; set = per-user override                                        |
| `tier`              | `subscription_tier`    | 'starter' / 'pro' / 'team' only -- trial's 50-credit one-time grant does not live here (see below) |
| `credits_per_cycle` | `int`                  | Per D-011/Monetization.md §3.2: starter=200, pro=1000, team=3000                                   |
| `rollover_max`      | `int`                  | 0 = no rollover; > 0 = max unused credits carried to next cycle                                    |
| `effective_from`    | `timestamptz`          |                                                                                                    |
| `effective_until`   | `timestamptz` nullable |                                                                                                    |

### 2.5 credit\_events

Append-only ledger of every credit movement. Balance is derived, not stored.

| Column             | Type                     | Notes                                                                                       |
| ------------------ | ------------------------ | ------------------------------------------------------------------------------------------- |
| `id`               | `uuid`                   |                                                                                             |
| `user_id`          | `uuid`                   |                                                                                             |
| `event_type`       | `credit_event_type` enum | 'allocation' / 'consumption' / 'grant' / 'refund' / 'expiration'                            |
| `amount`           | `int`                    | Positive for grants/allocations, negative for consumption                                   |
| `reason`           | `text`                   | Human-readable (e.g. "Monthly Pro allocation", "Niche search", "Refund: generation failed") |
| `metadata`         | `jsonb`                  | Structured context (e.g. `{ "action": "niche_search", "query_hash": "..." }`)               |
| `related_resource` | `text` nullable          | e.g. `prompt:<uuid>`, `channel:<uuid>`                                                      |
| `idempotency_key`  | `text` nullable          | Prevents double-charging on retries                                                         |

**Balance query:** `SUM(amount) WHERE user_id = ?` over the whole ledger, via the `credit_balance(p_user_id)` SQL function (security invoker, so RLS applies; summed in SQL because PostgREST caps selects at 1,000 rows). Cycle resets are explicit: each cycle close writes one `expiration` row keyed `cycle-close:<cycleKey>` before the new allocation (D-063, `lib/credits/ledger.ts`). Allocations carry `metadata.rolloverCap` (Team: up to 500 unused credits roll over one cycle); `grant` rows are top-ups and never expire.

Trial's 50-credit one-time grant (Monetization.md §3.2) doesn't come from `credit_allocations` — it's a hardcoded `TRIAL_CREDITS` constant, inserted directly as an `'allocation'` row by `lib/services/onboarding.ts`'s `completeOnboarding()` when the trial subscription is created. No webhook fires for trial start, and the amount (50) doesn't match Pro's real per-cycle allocation (1,000) even though a trial gets Pro-tier access — keeping it out of `credit_allocations` avoids overloading that table's per-cycle-tier semantics.

### 2.6 webhook\_events

Raw audit trail + idempotency anchor for every billing-provider webhook (Security.md §4.8, TRD.md §6.3). Service-role only — RLS enabled, zero policies (same pattern as `video_transcripts_cache`, §3.3).

| Column              | Type                   | Notes                                                                                       |
| ------------------- | ---------------------- | ------------------------------------------------------------------------------------------- |
| `id`                | `uuid`                 |                                                                                             |
| `provider`          | `text`                 | 'creem'                                                                                     |
| `event_type`        | `text`                 | e.g. `checkout.completed`, `subscription.renewed`                                           |
| `provider_event_id` | `text` unique          | Idempotency anchor — duplicate delivery hits this constraint first                          |
| `raw_payload`       | `jsonb`                | Full webhook body, for audit + replay                                                       |
| `processed_at`      | `timestamptz` nullable | Null until processing finishes — row is inserted as a dedup marker before processing starts |
| `error`             | `text` nullable        | Set only if processing failed; null = succeeded                                             |

### 2.7 Enums

```sql
CREATE TYPE subscription_tier AS ENUM ('free', 'starter', 'pro', 'team');
CREATE TYPE subscription_status AS ENUM ('active', 'trialing', 'past_due', 'cancelled', 'paused');
CREATE TYPE credit_event_type AS ENUM ('allocation', 'consumption', 'grant', 'refund', 'expiration');
```

`subscription_tier`'s `'free'` value is unused (no permanent free tier, Monetization.md §1.2) — left in place rather than migrated out per CLAUDE.md §4.2's enum-change caution (add/migrate/remove is a multi-step process; removing an unused value isn't worth the risk for Phase 1).

## 3. Content Tables

YouTube data cached in our DB to reduce API calls. Every YouTube entity has a corresponding cache table keyed on YouTube ID.

### 3.1 channels

Cached YouTube channel data. Shared across users — not user-scoped.

| Column               | Type                   | Notes                              |
| -------------------- | ---------------------- | ---------------------------------- |
| `id`                 | `uuid`                 | Our internal ID                    |
| `youtube_channel_id` | `text` unique          | e.g. `UC-lHJZR3Gqxm24_Vd_AJ5Yw`    |
| `handle`             | `text` nullable        | e.g. `@channelname`                |
| `name`               | `text`                 |                                    |
| `description`        | `text` nullable        |                                    |
| `avatar_url`         | `text` nullable        |                                    |
| `banner_url`         | `text` nullable        |                                    |
| `subscriber_count`   | `bigint`               | Snapshot at last sync              |
| `video_count`        | `int`                  | Snapshot                           |
| `total_view_count`   | `bigint`               | Snapshot                           |
| `country`            | `text` nullable        | ISO country code                   |
| `language`           | `text` nullable        | ISO language code                  |
| `is_monetized`       | `boolean` nullable     | Inferred from ads on recent videos |
| `youtube_created_at` | `timestamptz`          | Channel creation date on YouTube   |
| `last_synced_at`     | `timestamptz`          | When we last refreshed from API    |
| `unavailable_since`  | `timestamptz` nullable | If channel deleted / suspended     |

**Discovery columns (D-069):** `avg_views_recent`, `outlier_score`, `first_upload_at`, `uploads_playlist_id`, `has_shorts`, `made_for_kids`, `likely_monetized` (estimate), `is_faceless`, `niche_id` → `niches`, `classification_confidence`, `classified_at`, `refresh_tier` (`hot`/`warm`/`cold`), `discovered_at`, `discovered_via_seed` → `discovery_seeds`. Full definitions are in `Niche-Discovery-Engine.md` §5.1.

### 3.2 videos

Cached YouTube video data. Shared across users.

| Column              | Type                   | Notes                 |
| ------------------- | ---------------------- | --------------------- |
| `id`                | `uuid`                 |                       |
| `youtube_video_id`  | `text` unique          |                       |
| `channel_id`        | `uuid`                 | FK to `channels.id`   |
| `title`             | `text`                 |                       |
| `description`       | `text` nullable        |                       |
| `thumbnail_url`     | `text`                 | Highest-res thumbnail |
| `duration_seconds`  | `int`                  |                       |
| `view_count`        | `bigint`               | Snapshot              |
| `like_count`        | `int` nullable         |                       |
| `comment_count`     | `int` nullable         |                       |
| `published_at`      | `timestamptz`          |                       |
| `tags`              | `text[]`               |                       |
| `language`          | `text` nullable        |                       |
| `has_transcript`    | `boolean`              |                       |
| `last_synced_at`    | `timestamptz`          |                       |
| `unavailable_since` | `timestamptz` nullable |                       |

**Discovery column (D-069):** `outlier_multiple numeric` holds views ÷ baseline (D-054 rule).

### 3.2.1 Discovery tables (D-069)

The full DDL is in `Niche-Discovery-Engine.md` §5.3.

| Table | Purpose | RLS |
| --- | --- | --- |
| `discovery_seeds` | Keywords the crawler searches (`manual` / `user_search` / `expansion`) | Service-role only (zero policies) |
| `niches` | AI niche clusters. `embedding vector(1536)` (pgvector); `status` is one of `active` / `rising` / `saturated` / `declining` | `anyone_read_niches` |
| `niche_snapshots` | Daily Opportunity Score + five signals per niche, PK `(niche_id, snapshot_date)` | `anyone_read_niche_snapshots` |
| `outliers_feed` | Global outlier feed: one row per video ≥ 3× | `anyone_read_outliers_feed` |

### 3.3 video\_transcripts\_cache (unused since D-067, emptied)

Separate table because transcripts are large and only fetched on demand (for AI Prompts generation).

| Column            | Type          | Notes                                      |
| ----------------- | ------------- | ------------------------------------------ |
| `id`              | `uuid`        |                                            |
| `video_id`        | `uuid` unique | FK to `videos.id`                          |
| `transcript_text` | `text`        | Full transcript                            |
| `language`        | `text`        | Detected language                          |
| `source`          | `text`        | 'youtube\_captions' / 'whisper\_generated' |
| `fetched_at`      | `timestamptz` |                                            |

### 3.4 prompts

User-owned. Each row is one generation output tied to a source video — either a full AI Prompt (`kind = 'prompt'`) or a standalone Thumbnail Ideas set (`kind = 'thumbnail_ideas'`, Phase 2 Task 3), disambiguated by `kind` rather than a 6th key on `output`'s prompt shape (which would force every AI Prompts generation to also produce thumbnail ideas, or store misleading empty `title_variants`/`hook_variants`/etc. on thumbnail-ideas rows). `tone` has no real meaning for a `thumbnail_ideas` row — written as `'neutral'`, a harmless placeholder, rather than relaxing the column's `NOT NULL` constraint for one row kind.

| Column            | Type                   | Notes                                                                                                                                                                           |
| ----------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`              | `uuid`                 |                                                                                                                                                                                 |
| `user_id`         | `uuid`                 | FK to `profiles.id`                                                                                                                                                             |
| `workspace_id`    | `uuid` nullable        | FK to `workspaces.id` (Phase 3)                                                                                                                                                 |
| `source_video_id` | `uuid`                 | FK to `videos.id`                                                                                                                                                               |
| `kind`            | `text`                 | 'prompt' (default) / 'thumbnail_ideas' (Phase 2 Task 3). `listPrompts` filters to 'prompt' so thumbnail-ideas rows don't appear in the AI Prompts library.                      |
| `target_audience` | `text` nullable        | User-provided context                                                                                                                                                           |
| `tone`            | `text`                 | 'neutral' / 'casual' / 'educational' / 'dramatic' / 'clickbait\_lite' -- always 'neutral' for a `thumbnail_ideas` row                                                           |
| `output`          | `jsonb`                | `kind = 'prompt'`: `{ title_variants, thumbnail_concepts, hook_variants, script_outline, description_template }`. `kind = 'thumbnail_ideas'`: `{ ideas: string[] }` (3-5 items) |
| `regeneration_of` | `uuid` nullable        | FK to prior `prompts.id` if this was a regenerate                                                                                                                               |
| `feedback_tags`   | `text[]`               | e.g. `['more_casual', 'shorter']` if regenerated                                                                                                                                |
| `deleted_at`      | `timestamptz` nullable | Soft-delete                                                                                                                                                                     |

### 3.5 notes

Per-user private annotations on any object (channel, video, prompt).

| Column         | Type                   | Notes                                      |
| -------------- | ---------------------- | ------------------------------------------ |
| `id`           | `uuid`                 |                                            |
| `user_id`      | `uuid`                 | FK to `profiles.id`                        |
| `workspace_id` | `uuid` nullable        | FK to `workspaces.id` (Phase 3, if shared) |
| `subject_type` | `text`                 | 'channel' / 'video' / 'prompt'             |
| `subject_id`   | `uuid`                 | Polymorphic FK to the subject table        |
| `body`         | `text`                 | Markdown                                   |
| `deleted_at`   | `timestamptz` nullable | Soft-delete                                |

## 4. Tracking & Notifications

### 4.1 tracked\_channels

Join table: which user tracks which channel.

| Column                  | Type            | Notes                                                                       |
| ----------------------- | --------------- | --------------------------------------------------------------------------- |
| `id`                    | `uuid`          |                                                                             |
| `user_id`               | `uuid`          | FK to `profiles.id`                                                         |
| `workspace_id`          | `uuid` nullable | FK to `workspaces.id` (Phase 3, if team-shared)                             |
| `channel_id`            | `uuid`          | FK to `channels.id`                                                         |
| `tracked_since`         | `timestamptz`   |                                                                             |
| `custom_label`          | `text` nullable | User's rename for the channel                                               |
| `refresh_cadence_hours` | `int`           | Effective per-user cadence (from tier default, override possible per D-013) |
| `notifications_enabled` | `boolean`       | Master toggle per channel                                                   |

**Unique constraint:** `(user_id, channel_id)` unless workspace context differs.

### 4.2 tracked\_events

Append-only log of events detected on tracked channels. Powers the activity feed.

| Column        | Type                      | Notes                                                                                                      |
| ------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `id`          | `uuid`                    |                                                                                                            |
| `channel_id`  | `uuid`                    | FK to `channels.id`                                                                                        |
| `event_type`  | `tracked_event_type` enum | 'new\_video' / 'view\_spike' / 'cadence\_change' / 'subscriber\_milestone' / 'outlier\_detected' (Phase 2) |
| `payload`     | `jsonb`                   | Event-specific data (e.g. `{ "video_id": "...", "crossed_threshold": 100000 }`)                            |
| `detected_at` | `timestamptz`             |                                                                                                            |

Note: `tracked_events` is not per-user — events are per-channel and shown to all users tracking that channel. RLS filters at read time.

### 4.3 notifications

User-scoped notifications derived from tracked\_events + system events.

| Column               | Type                   | Notes                                                    |
| -------------------- | ---------------------- | -------------------------------------------------------- |
| `id`                 | `uuid`                 |                                                          |
| `user_id`            | `uuid`                 | FK to `profiles.id`                                      |
| `notification_type`  | `text`                 | Matches preference categories                            |
| `title`              | `text`                 |                                                          |
| `body`               | `text` nullable        |                                                          |
| `related_resource`   | `text` nullable        | e.g. `channel:<uuid>`, `video:<uuid>`                    |
| `read_at`            | `timestamptz` nullable | Null = unread                                            |
| `dismissed_at`       | `timestamptz` nullable | Null = still in feed                                     |
| `delivered_channels` | `text[]`               | Which delivery channels succeeded: `['in_app', 'email']` |

### 4.4 notification\_preferences

Per-user, per-notification-type toggles. `in_app_enabled`/`email_enabled` genuinely vary per `notification_type`; `digest_cadence`/`digest_day_of_week`/`quiet_hours_*` are product-level _global_ settings that happen to live on the same per-type row (no separate "global" row/table) — Phase 2 Task 2's app-layer contract keeps them identical across every one of a user's type-rows on write (one `UPDATE ... WHERE user_id = $1`), and reads them from any single row.

| Column               | Type            | Notes                                                                                                                                                   |
| -------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                 | `uuid`          |                                                                                                                                                         |
| `user_id`            | `uuid`          | FK to `profiles.id`                                                                                                                                     |
| `notification_type`  | `text`          | Matches types in `notifications.notification_type`                                                                                                      |
| `in_app_enabled`     | `boolean`       | Default true                                                                                                                                            |
| `email_enabled`      | `boolean`       | Default false (opt-in). Also gated by tier — Pro/Team only (Monetization.md §2.5); Starter/trial never gets email regardless of this flag.              |
| `slack_enabled`      | `boolean`       | Phase 3, team tier                                                                                                                                      |
| `digest_cadence`     | `text`          | 'off' / 'daily' / 'weekly' (email-only)                                                                                                                 |
| `digest_day_of_week` | `smallint`      | 0 (Sunday) – 6 (Saturday), default 1 (Monday). Which day a 'weekly' cadence fires on (UI-UX-Flow.md §6.4's day-of-week selector). Added Phase 2 Task 2. |
| `quiet_hours_start`  | `time` nullable | Local to user's `time_zone`                                                                                                                             |
| `quiet_hours_end`    | `time` nullable |                                                                                                                                                         |

**Per-channel override table:** `notification_channel_overrides (user_id, channel_id, notifications_enabled)` — exists only when user overrides the default for a specific channel.

### 4.5 Enums

```sql
CREATE TYPE tracked_event_type AS ENUM (
  'new_video',
  'view_spike',
  'cadence_change',
  'subscriber_milestone',
  'outlier_detected'
);
```

## 5. Team Tables (Phase 3)

Defined now so Phase 1 tables can carry the `workspace_id` column, avoiding a costly migration when Phase 3 arrives.

### 5.1 workspaces

| Column            | Type                   | Notes                                                           |
| ----------------- | ---------------------- | --------------------------------------------------------------- |
| `id`              | `uuid`                 |                                                                 |
| `name`            | `text`                 |                                                                 |
| `slug`            | `text` unique          | URL-safe                                                        |
| `owner_id`        | `uuid`                 | FK to `profiles.id` — the account that owns billing             |
| `subscription_id` | `uuid`                 | FK to `subscriptions.id` — team plan applies to whole workspace |
| `deleted_at`      | `timestamptz` nullable | Soft-delete                                                     |

### 5.2 workspace\_members

| Column         | Type                  | Notes                         |
| -------------- | --------------------- | ----------------------------- |
| `id`           | `uuid`                |                               |
| `workspace_id` | `uuid`                | FK to `workspaces.id`         |
| `user_id`      | `uuid`                | FK to `profiles.id`           |
| `role`         | `workspace_role` enum | 'admin' / 'editor' / 'viewer' |
| `invited_by`   | `uuid` nullable       | FK to `profiles.id`           |
| `joined_at`    | `timestamptz`         |                               |

**Unique constraint:** `(workspace_id, user_id)`.

### 5.3 workspace\_invitations

Outstanding invites not yet accepted.

| Column         | Type                   | Notes                      |
| -------------- | ---------------------- | -------------------------- |
| `id`           | `uuid`                 |                            |
| `workspace_id` | `uuid`                 |                            |
| `email`        | `text`                 | Invited email address      |
| `role`         | `workspace_role`       | Role they'll get on accept |
| `token`        | `text` unique          | For accept URL             |
| `expires_at`   | `timestamptz`          | Default 7 days             |
| `accepted_at`  | `timestamptz` nullable |                            |
| `invited_by`   | `uuid`                 | FK to `profiles.id`        |

### 5.4 tasks

| Column         | Type                   | Notes                                          |
| -------------- | ---------------------- | ---------------------------------------------- |
| `id`           | `uuid`                 |                                                |
| `workspace_id` | `uuid`                 | FK to `workspaces.id`                          |
| `title`        | `text`                 |                                                |
| `description`  | `text` nullable        |                                                |
| `assignee_id`  | `uuid` nullable        | FK to `profiles.id` (must be workspace member) |
| `due_date`     | `date` nullable        |                                                |
| `status`       | `task_status` enum     | 'open' / 'in\_progress' / 'done'               |
| `linked_type`  | `text` nullable        | 'channel' / 'prompt' / 'calendar\_entry'       |
| `linked_id`    | `uuid` nullable        | Polymorphic FK                                 |
| `created_by`   | `uuid`                 | FK to `profiles.id`                            |
| `deleted_at`   | `timestamptz` nullable | Soft-delete                                    |

### 5.5 calendar\_entries

| Column           | Type                   | Notes                                                   |
| ---------------- | ---------------------- | ------------------------------------------------------- |
| `id`             | `uuid`                 |                                                         |
| `workspace_id`   | `uuid` nullable        | Null = personal calendar entry; set = team              |
| `user_id`        | `uuid`                 | Creator                                                 |
| `channel_id`     | `uuid` nullable        | Which channel this entry is for                         |
| `title`          | `text`                 |                                                         |
| `description`    | `text` nullable        |                                                         |
| `linked_prompts` | `uuid[]`               | Array of `prompts.id`                                   |
| `status`         | `calendar_status` enum | 'idea' / 'scripted' / 'filmed' / 'edited' / 'published' |
| `scheduled_for`  | `timestamptz` nullable | When to publish                                         |
| `assignee_id`    | `uuid` nullable        | FK to `profiles.id`                                     |
| `deleted_at`     | `timestamptz` nullable | Soft-delete                                             |

### 5.6 Enums

```sql
CREATE TYPE workspace_role AS ENUM ('admin', 'editor', 'viewer');
CREATE TYPE task_status AS ENUM ('open', 'in_progress', 'done');
CREATE TYPE calendar_status AS ENUM ('idea', 'scripted', 'filmed', 'edited', 'published');
```

**Note on Phase 1 impact:** Every user-scoped table (prompts, notes, tracked\_channels, etc.) includes a nullable `workspace_id` from day 1. In Phase 1 it's always null (personal). In Phase 3, workspace records populate it. RLS policies handle both cases from the start.

### 5.7 Implementation status (Phase 3)

`workspaces`, `workspace_members`, `workspace_invitations` (`20260923100001_create_workspace_tables.sql`, `20260923100002_add_workspace_rls_policies.sql`), and `tasks`/`calendar_entries` (`20260923110001_create_tasks_and_calendar.sql`) are all live.

`tasks.workspace_id` is `NOT NULL` — every task is workspace-scoped, no personal-task concept (matches DECISIONS.md D-045's routing rationale). `calendar_entries.workspace_id` stays nullable per the original spec ("Null = personal calendar entry"); this build's UI only exercises the workspace-scoped path, but the RLS policies below already handle both, so no later migration is needed to light up a personal calendar.

**"Viewer" is read-only for tasks and the calendar, not just membership.** `is_workspace_contributor(uuid)` (role in `('admin', 'editor')`) gates every `tasks`/`calendar_entries` write; `is_workspace_member` alone (any role) still gates `SELECT`. Same `SECURITY DEFINER` + `search_path` + `authenticated`-only grant pattern as the four workspace helpers below — reused directly, no new recursion risk since these two tables' policies were never self-referential.

**Soft-delete via `UPDATE`, no `DELETE` policy.** `deleteTask`/`deleteEntry` set `deleted_at`, matching §1.3's pattern — neither table has a `DELETE` RLS policy at all, since the app never issues one.

**`profiles` needed co-members to see each other at all, but not each other's full row.** §2.2's original policy (`auth.uid() = id`) was correct before Phase 3 — nothing needed another user's name. Tasks/Calendar assignees and the Workspace members list all resolve names by querying `profiles`, and that self-only policy silently filtered every other member's row to nothing — no error, `attachMemberProfiles`/`attachAssigneeNames` just got back `null` and fell through to "Unnamed". A single-member test workspace never surfaces this; it showed up immediately on adding a second real member.

First fix (`20260923120001`) added a permissive `workspace_members_read_profiles` SELECT policy gated by a new `shares_workspace_with(uuid)` helper. Verified correctly scoped by row (a co-member's row becomes visible only once a shared `workspace_members` row exists, confirmed by direct RLS impersonation as both a member and a non-member) — but RLS is row-level only, so that policy exposed every column, including `role`, `onboarding_step`, `primary_goal`, `onboarding_skipped_at`, and `youtube_channel_id`, to any co-member, not just the `name`/`avatar_url` the UI actually needs. `select *` as a co-member confirmed the over-exposure directly.

`20260923150000` replaces that policy with `get_co_member_profiles(uuid[])`, a `SECURITY DEFINER` function that projects only `id, name, avatar_url` and re-checks `shares_workspace_with` per row internally — `REVOKE`d from `public`/`anon`, granted to `authenticated` only. `attachMemberProfiles` (workspace.ts) and `attachAssigneeNames` (tasks.ts) now call it via `.rpc()` instead of `.from("profiles").select(...)`. Self-access to a user's own full row (onboarding, settings) is unaffected — that still goes through `users_read_own_profile`, untouched.

**RLS via SECURITY DEFINER helpers, not raw subqueries.** A policy on `workspace_members` that subqueries `workspace_members` itself (the standard membership-table idiom) trips Postgres's RLS recursion guard (`42P17`) the moment the querying role isn't RLS-bypassing — evaluating the inner subquery re-applies the table's own policy, which subqueries itself again. Same failure for `workspaces`/`workspace_invitations` admin checks, since those also resolve through `workspace_members`. Fixed with four `SECURITY DEFINER` functions (`set search_path = public`, same hardening as `handle_new_user()`), each `REVOKE`d from `public`/`anon` and granted only to `authenticated` (required for the policy engine to evaluate them for real signed-in users; each one only reveals the calling user's own status, never another user's data, so residual direct-RPC callability by an authenticated user isn't a leak):

- `is_workspace_member(uuid)`, `is_workspace_admin(uuid)`, `is_workspace_owner(uuid)` — boolean membership/role/ownership checks
- `workspace_has_no_members(uuid)` — used only by the bootstrap INSERT policy (see below)

**Bootstrap chicken-and-egg.** The one case a raw policy can't express: a workspace's owner inserting themselves as its first (admin) member. A naive `workspace_id in (select id from workspaces where owner_id = auth.uid())` check fails, because that `SELECT` is itself gated by `workspaces`' own membership-based RLS — and the brand-new workspace has no members yet. `is_workspace_owner()` bypasses this the same way, for the same reason.

**`INSERT ... SELECT`-back needs its own visibility, not just `WITH CHECK`.** `createWorkspace` does `.insert({...}).select().single()` — PostgREST's `return=representation` re-reads the new row through the table's own SELECT policy immediately after the WITH CHECK passes, before the second insert (the owner's admin `workspace_members` row) has run. `workspaces_select_member` originally only granted access via `is_workspace_member(id)`, which is false at that exact instant (no membership yet) — PostgREST reported the whole operation as an RLS violation on the INSERT itself, not a read-back gap, which is a confusing error to debug from the client side. Fixed by adding `or owner_id = auth.uid()` to that policy. Caught running the actual create-workspace flow through the browser, not by inspection or by testing a bare INSERT with no SELECT-back in isolation (which is exactly what the original RLS verification did, and why it didn't catch this).

**Service-role only, not RLS:** `acceptInvitation` (validating a token against the invited email, then inserting the membership row and marking the invitation accepted) goes through `lib/services/workspace.ts`'s service-role client rather than a client-facing RLS policy — expressing "does a live invitation for my email exist" in a `WITH CHECK` wasn't worth it for one call site. `workspace_invitations` has no RLS policy granting non-admin read access at all; the public `/invite?token=...` preview is a separate server-only, token-authenticated lookup (same trust model as a password-reset token), never a direct PostgREST call.

## 6. RLS, Indexes, Audit & Retention

### 6.1 Row-Level Security policies

Enabled on every user-scoped table. Never `BYPASS RLS` in application code — only in migrations.

**Standard user-scoped table policy pattern:**

```sql
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_prompts" ON prompts
  FOR SELECT
  USING (auth.uid() = user_id OR workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "users_insert_own_prompts" ON prompts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_prompts" ON prompts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "users_delete_own_prompts" ON prompts
  FOR DELETE
  USING (auth.uid() = user_id);
```

**Shared tables (channels, videos, niches, niche\_snapshots, outliers\_feed):** everyone-read, service-role-only-write. Data is public YouTube info, so reads need no user scoping. The service role writes them from server-only code (workers, `lib/services/discovery/*`, cache writes in the service layer). This is a documented exception to the rule above (D-070).

**Admin tables:** super-admin role check via `profiles.role = 'super_admin'`.

### 6.2 Indexes

Essential indexes for MVP:

| Table              | Index                                 | Purpose                    |
| ------------------ | ------------------------------------- | -------------------------- |
| `profiles`         | `(role)`                              | Admin lookups              |
| `subscriptions`    | `(user_id, is_current)`               | Fetch current sub          |
| `credit_events`    | `(user_id, created_at)`               | Balance calculation        |
| `channels`         | `(youtube_channel_id)` unique         | API lookup                 |
| `channels`         | `(subscriber_count)`                  | Niche Finder sort          |
| `channels`         | `(country, language)`                 | Niche Finder filter        |
| `videos`           | `(youtube_video_id)` unique           | API lookup                 |
| `videos`           | `(channel_id, published_at DESC)`     | Latest videos per channel  |
| `videos`           | `(view_count DESC)`                   | Top videos                 |
| `tracked_channels` | `(user_id)`                           | User's tracking list       |
| `tracked_channels` | `(channel_id)`                        | Reverse lookup for polling |
| `tracked_events`   | `(channel_id, detected_at DESC)`      | Activity feed              |
| `notifications`    | `(user_id, read_at, created_at DESC)` | Unread + feed              |
| `prompts`          | `(user_id, created_at DESC)`          | User's library             |
| `prompts`          | `(source_video_id)`                   | Videos-with-prompts lookup |
| `channels`         | `(niche_id)`                          | Channels in a niche        |
| `channels`         | `(last_synced_at)`                    | Enrichment due-list        |
| `channels`         | `(youtube_created_at)`                | Channel-age filter         |
| `channels`         | `(outlier_score DESC)`                | Channels feed sort         |
| `outliers_feed`    | `(detected_at DESC)`, `(niche_id)`    | Global outlier feed        |
| `niche_snapshots`  | `(snapshot_date)`                     | Latest scores              |

### 6.3 Audit tables

**admin\_actions** — log every admin action for accountability.

| Column        | Type            | Notes                                                             |
| ------------- | --------------- | ----------------------------------------------------------------- |
| `id`          | `uuid`          |                                                                   |
| `admin_id`    | `uuid`          | FK to `profiles.id` (super\_admin or staff)                       |
| `action`      | `text`          | e.g. `impersonate_start`, `plan_change`, `credit_grant`, `refund` |
| `target_type` | `text` nullable | e.g. `user`, `subscription`                                       |
| `target_id`   | `uuid` nullable |                                                                   |
| `metadata`    | `jsonb`         | Structured action context                                         |

**auth\_events** — login attempts, password resets, session lifecycle (retained 90 days).

| Column       | Type             | Notes                                                                                        |
| ------------ | ---------------- | -------------------------------------------------------------------------------------------- |
| `id`         | `uuid`           |                                                                                              |
| `user_id`    | `uuid` nullable  | Null on failed logins for non-existent users                                                 |
| `event_type` | `text`           | `login_success` / `login_failed` / `logout` / `password_reset_requested` / `session_expired` |
| `ip_address` | `inet`           |                                                                                              |
| `user_agent` | `text` nullable  |                                                                                              |
| `metadata`   | `jsonb` nullable |                                                                                              |

### 6.4 Retention policy

Background job (nightly) enforces:

| Data                                | Retention               | Action after                                                                                    |
| ----------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------- |
| Soft-deleted user accounts          | 30 days                 | Hard-delete: profile, prompts, notes, tracked\_channels, notifications, credit\_events archived |
| Soft-deleted prompts / notes        | 30 days                 | Hard-delete                                                                                     |
| `auth_events`                       | 90 days                 | Delete                                                                                          |
| `tracked_events`                    | 30 days                 | Delete (YouTube Developer Policies III.E.4.d, D-067)                                            |
| `channels` / `videos` not refreshed | 30 days since last sync | Delete; empty the YouTube fields if a prompt or tracker still references it (D-067)             |
| `notifications` (YouTube events)    | 30 days                 | Delete (they quote YouTube data, D-067)                                                         |
| Failed webhook events               | 30 days                 | Delete after review                                                                             |
| `video_transcripts_cache`           | —                       | Emptied and unused (D-067)                                                                      |
| `niche_snapshots`                  | 90 days daily              | Roll up to one row per week                                                                     |

**GDPR data export** (deferred, D-067: by email within 30 days until built): endpoint `/api/user/export` returns all user-owned data as JSON. Triggered from `/settings/danger`.

**GDPR data deletion:** `/api/user/delete` soft-deletes account; hard-delete after 30 days per retention above.
