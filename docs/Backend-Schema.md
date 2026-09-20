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

| Column | Type | Default | Notes |
| --- | --- | --- | --- |
| `id` | `uuid` | `gen_random_uuid()` | Primary key |
| `created_at` | `timestamptz` | `now()` | Immutable |
| `updated_at` | `timestamptz` | `now()` | Auto-updated via trigger on any row change |

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

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | FK to `auth.users.id`, primary key |
| `name` | `text` | From OAuth or user input |
| `avatar_url` | `text` nullable | From OAuth or user upload |
| `time_zone` | `text` | IANA timezone (e.g. `Asia/Karachi`) |
| `onboarding_step` | `int` | 0 (not started) through 5 (completed) |
| `primary_goal` | `text` | 'explorer' / 'stuck' / 'grower' / 'operator' |
| `youtube_channel_id` | `text` nullable | If user connected their channel |
| `role` | `text` | 'user' (default) / 'staff' / 'super\_admin' |
| `theme_preference` | `text` | 'system' / 'dark' / 'light' |
| `deleted_at` | `timestamptz` nullable | Soft-delete |

### 2.3 subscriptions

One-to-one active per user; historical rows preserved for audit.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` |  |
| `user_id` | `uuid` | FK to `profiles.id` |
| `tier` | `subscription_tier` enum | 'free' / 'starter' / 'pro' / 'team' (final tiers per D-011) |
| `status` | `subscription_status` enum | 'active' / 'trialing' / 'past\_due' / 'cancelled' / 'paused' |
| `provider` | `text` | 'stripe' / 'paddle' / 'manual' (per D-010) |
| `provider_subscription_id` | `text` nullable | External ID from provider |
| `current_period_start` | `timestamptz` |  |
| `current_period_end` | `timestamptz` |  |
| `trial_ends_at` | `timestamptz` nullable |  |
| `cancelled_at` | `timestamptz` nullable |  |
| `is_current` | `boolean` | Only one row per user has `true` |

> **Blocked on decisions:** Tier enum values (D-011) and provider (D-010) will be finalized once those close. Structure holds regardless.

### 2.4 credit\_allocations

How many credits each tier grants per billing cycle. Seeded per tier; overridden per user for grants (bonuses, comps).

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` |  |
| `user_id` | `uuid` nullable | Null = default allocation for tier; set = per-user override |
| `tier` | `subscription_tier` |  |
| `credits_per_cycle` | `int` | Values TBD per D-011 |
| `rollover_max` | `int` | 0 = no rollover; > 0 = max unused credits carried to next cycle |
| `effective_from` | `timestamptz` |  |
| `effective_until` | `timestamptz` nullable |  |

### 2.5 credit\_events

Append-only ledger of every credit movement. Balance is derived, not stored.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` |  |
| `user_id` | `uuid` |  |
| `event_type` | `credit_event_type` enum | 'allocation' / 'consumption' / 'grant' / 'refund' / 'expiration' |
| `amount` | `int` | Positive for grants/allocations, negative for consumption |
| `reason` | `text` | Human-readable (e.g. "Monthly Pro allocation", "Niche search", "Refund: generation failed") |
| `metadata` | `jsonb` | Structured context (e.g. `{ "action": "niche_search", "query_hash": "..." }`) |
| `related_resource` | `text` nullable | e.g. `prompt:<uuid>`, `channel:<uuid>` |
| `idempotency_key` | `text` nullable | Prevents double-charging on retries |

**Balance query:** `SUM(amount) WHERE user_id = ? AND created_at >= <cycle_start>`

> **Blocked on decisions:** Cost per action (D-012) determines the `amount` for each consumption event type. Structure is agnostic.

### 2.6 Enums

```sql
CREATE TYPE subscription_tier AS ENUM ('free', 'starter', 'pro', 'team');
CREATE TYPE subscription_status AS ENUM ('active', 'trialing', 'past_due', 'cancelled', 'paused');
CREATE TYPE credit_event_type AS ENUM ('allocation', 'consumption', 'grant', 'refund', 'expiration');
```

## 3. Content Tables

YouTube data cached in our DB to reduce API calls. Every YouTube entity has a corresponding cache table keyed on YouTube ID.

### 3.1 channels

Cached YouTube channel data. Shared across users — not user-scoped.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Our internal ID |
| `youtube_channel_id` | `text` unique | e.g. `UC-lHJZR3Gqxm24_Vd_AJ5Yw` |
| `handle` | `text` nullable | e.g. `@channelname` |
| `name` | `text` |  |
| `description` | `text` nullable |  |
| `avatar_url` | `text` nullable |  |
| `banner_url` | `text` nullable |  |
| `subscriber_count` | `bigint` | Snapshot at last sync |
| `video_count` | `int` | Snapshot |
| `total_view_count` | `bigint` | Snapshot |
| `country` | `text` nullable | ISO country code |
| `language` | `text` nullable | ISO language code |
| `is_monetized` | `boolean` nullable | Inferred from ads on recent videos |
| `youtube_created_at` | `timestamptz` | Channel creation date on YouTube |
| `last_synced_at` | `timestamptz` | When we last refreshed from API |
| `unavailable_since` | `timestamptz` nullable | If channel deleted / suspended |

### 3.2 videos

Cached YouTube video data. Shared across users.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` |  |
| `youtube_video_id` | `text` unique |  |
| `channel_id` | `uuid` | FK to `channels.id` |
| `title` | `text` |  |
| `description` | `text` nullable |  |
| `thumbnail_url` | `text` | Highest-res thumbnail |
| `duration_seconds` | `int` |  |
| `view_count` | `bigint` | Snapshot |
| `like_count` | `int` nullable |  |
| `comment_count` | `int` nullable |  |
| `published_at` | `timestamptz` |  |
| `tags` | `text[]` |  |
| `language` | `text` nullable |  |
| `has_transcript` | `boolean` |  |
| `last_synced_at` | `timestamptz` |  |
| `unavailable_since` | `timestamptz` nullable |  |

### 3.3 video\_transcripts\_cache

Separate table because transcripts are large and only fetched on demand (for AI Prompts generation).

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` |  |
| `video_id` | `uuid` unique | FK to `videos.id` |
| `transcript_text` | `text` | Full transcript |
| `language` | `text` | Detected language |
| `source` | `text` | 'youtube\_captions' / 'whisper\_generated' |
| `fetched_at` | `timestamptz` |  |

### 3.4 prompts

User-owned. Each prompt is one generation output tied to a source video.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` |  |
| `user_id` | `uuid` | FK to `profiles.id` |
| `workspace_id` | `uuid` nullable | FK to `workspaces.id` (Phase 3) |
| `source_video_id` | `uuid` | FK to `videos.id` |
| `target_audience` | `text` nullable | User-provided context |
| `tone` | `text` | 'neutral' / 'casual' / 'educational' / 'dramatic' / 'clickbait\_lite' |
| `output` | `jsonb` | Structured: `{ title_variants, thumbnail_concepts, hook_variants, script_outline, description_template }` |
| `regeneration_of` | `uuid` nullable | FK to prior `prompts.id` if this was a regenerate |
| `feedback_tags` | `text[]` | e.g. `['more_casual', 'shorter']` if regenerated |
| `deleted_at` | `timestamptz` nullable | Soft-delete |

### 3.5 notes

Per-user private annotations on any object (channel, video, prompt).

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` |  |
| `user_id` | `uuid` | FK to `profiles.id` |
| `workspace_id` | `uuid` nullable | FK to `workspaces.id` (Phase 3, if shared) |
| `subject_type` | `text` | 'channel' / 'video' / 'prompt' |
| `subject_id` | `uuid` | Polymorphic FK to the subject table |
| `body` | `text` | Markdown |
| `deleted_at` | `timestamptz` nullable | Soft-delete |

## 4. Tracking & Notifications

### 4.1 tracked\_channels

Join table: which user tracks which channel.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` |  |
| `user_id` | `uuid` | FK to `profiles.id` |
| `workspace_id` | `uuid` nullable | FK to `workspaces.id` (Phase 3, if team-shared) |
| `channel_id` | `uuid` | FK to `channels.id` |
| `tracked_since` | `timestamptz` |  |
| `custom_label` | `text` nullable | User's rename for the channel |
| `refresh_cadence_hours` | `int` | Effective per-user cadence (from tier default, override possible per D-013) |
| `notifications_enabled` | `boolean` | Master toggle per channel |

**Unique constraint:** `(user_id, channel_id)` unless workspace context differs.

### 4.2 tracked\_events

Append-only log of events detected on tracked channels. Powers the activity feed.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` |  |
| `channel_id` | `uuid` | FK to `channels.id` |
| `event_type` | `tracked_event_type` enum | 'new\_video' / 'view\_spike' / 'cadence\_change' / 'subscriber\_milestone' / 'outlier\_detected' (Phase 2) |
| `payload` | `jsonb` | Event-specific data (e.g. `{ "video_id": "...", "crossed_threshold": 100000 }`) |
| `detected_at` | `timestamptz` |  |

Note: `tracked_events` is not per-user — events are per-channel and shown to all users tracking that channel. RLS filters at read time.

### 4.3 notifications

User-scoped notifications derived from tracked\_events + system events.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` |  |
| `user_id` | `uuid` | FK to `profiles.id` |
| `notification_type` | `text` | Matches preference categories |
| `title` | `text` |  |
| `body` | `text` nullable |  |
| `related_resource` | `text` nullable | e.g. `channel:<uuid>`, `video:<uuid>` |
| `read_at` | `timestamptz` nullable | Null = unread |
| `dismissed_at` | `timestamptz` nullable | Null = still in feed |
| `delivered_channels` | `text[]` | Which delivery channels succeeded: `['in_app', 'email']` |

### 4.4 notification\_preferences

Per-user, per-notification-type toggles.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` |  |
| `user_id` | `uuid` | FK to `profiles.id` |
| `notification_type` | `text` | Matches types in `notifications.notification_type` |
| `in_app_enabled` | `boolean` | Default true |
| `email_enabled` | `boolean` | Default false (opt-in) |
| `slack_enabled` | `boolean` | Phase 3, team tier |
| `digest_cadence` | `text` | 'off' / 'daily' / 'weekly' (email-only) |
| `quiet_hours_start` | `time` nullable | Local to user's `time_zone` |
| `quiet_hours_end` | `time` nullable |  |

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

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` |  |
| `name` | `text` |  |
| `slug` | `text` unique | URL-safe |
| `owner_id` | `uuid` | FK to `profiles.id` — the account that owns billing |
| `subscription_id` | `uuid` | FK to `subscriptions.id` — team plan applies to whole workspace |
| `deleted_at` | `timestamptz` nullable | Soft-delete |

### 5.2 workspace\_members

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` |  |
| `workspace_id` | `uuid` | FK to `workspaces.id` |
| `user_id` | `uuid` | FK to `profiles.id` |
| `role` | `workspace_role` enum | 'admin' / 'editor' / 'viewer' |
| `invited_by` | `uuid` nullable | FK to `profiles.id` |
| `joined_at` | `timestamptz` |  |

**Unique constraint:** `(workspace_id, user_id)`.

### 5.3 workspace\_invitations

Outstanding invites not yet accepted.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` |  |
| `workspace_id` | `uuid` |  |
| `email` | `text` | Invited email address |
| `role` | `workspace_role` | Role they'll get on accept |
| `token` | `text` unique | For accept URL |
| `expires_at` | `timestamptz` | Default 7 days |
| `accepted_at` | `timestamptz` nullable |  |
| `invited_by` | `uuid` | FK to `profiles.id` |

### 5.4 tasks

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` |  |
| `workspace_id` | `uuid` | FK to `workspaces.id` |
| `title` | `text` |  |
| `description` | `text` nullable |  |
| `assignee_id` | `uuid` nullable | FK to `profiles.id` (must be workspace member) |
| `due_date` | `date` nullable |  |
| `status` | `task_status` enum | 'open' / 'in\_progress' / 'done' |
| `linked_type` | `text` nullable | 'channel' / 'prompt' / 'calendar\_entry' |
| `linked_id` | `uuid` nullable | Polymorphic FK |
| `created_by` | `uuid` | FK to `profiles.id` |
| `deleted_at` | `timestamptz` nullable | Soft-delete |

### 5.5 calendar\_entries

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` |  |
| `workspace_id` | `uuid` nullable | Null = personal calendar entry; set = team |
| `user_id` | `uuid` | Creator |
| `channel_id` | `uuid` nullable | Which channel this entry is for |
| `title` | `text` |  |
| `description` | `text` nullable |  |
| `linked_prompts` | `uuid[]` | Array of `prompts.id` |
| `status` | `calendar_status` enum | 'idea' / 'scripted' / 'filmed' / 'edited' / 'published' |
| `scheduled_for` | `timestamptz` nullable | When to publish |
| `assignee_id` | `uuid` nullable | FK to `profiles.id` |
| `deleted_at` | `timestamptz` nullable | Soft-delete |

### 5.6 Enums

```sql
CREATE TYPE workspace_role AS ENUM ('admin', 'editor', 'viewer');
CREATE TYPE task_status AS ENUM ('open', 'in_progress', 'done');
CREATE TYPE calendar_status AS ENUM ('idea', 'scripted', 'filmed', 'edited', 'published');
```

**Note on Phase 1 impact:** Every user-scoped table (prompts, notes, tracked\_channels, etc.) includes a nullable `workspace_id` from day 1. In Phase 1 it's always null (personal). In Phase 3, workspace records populate it. RLS policies handle both cases from the start.

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

**Shared tables (channels, videos):** everyone-read, service-role-only-write. Data is public YouTube info — no user scoping needed on read.

**Admin tables:** super-admin role check via `profiles.role = 'super_admin'`.

### 6.2 Indexes

Essential indexes for MVP:

| Table | Index | Purpose |
| --- | --- | --- |
| `profiles` | `(role)` | Admin lookups |
| `subscriptions` | `(user_id, is_current)` | Fetch current sub |
| `credit_events` | `(user_id, created_at)` | Balance calculation |
| `channels` | `(youtube_channel_id)` unique | API lookup |
| `channels` | `(subscriber_count)` | Niche Finder sort |
| `channels` | `(country, language)` | Niche Finder filter |
| `videos` | `(youtube_video_id)` unique | API lookup |
| `videos` | `(channel_id, published_at DESC)` | Latest videos per channel |
| `videos` | `(view_count DESC)` | Top videos |
| `tracked_channels` | `(user_id)` | User's tracking list |
| `tracked_channels` | `(channel_id)` | Reverse lookup for polling |
| `tracked_events` | `(channel_id, detected_at DESC)` | Activity feed |
| `notifications` | `(user_id, read_at, created_at DESC)` | Unread + feed |
| `prompts` | `(user_id, created_at DESC)` | User's library |
| `prompts` | `(source_video_id)` | Videos-with-prompts lookup |

### 6.3 Audit tables

**admin\_actions** — log every admin action for accountability.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` |  |
| `admin_id` | `uuid` | FK to `profiles.id` (super\_admin or staff) |
| `action` | `text` | e.g. `impersonate_start`, `plan_change`, `credit_grant`, `refund` |
| `target_type` | `text` nullable | e.g. `user`, `subscription` |
| `target_id` | `uuid` nullable |  |
| `metadata` | `jsonb` | Structured action context |

**auth\_events** — login attempts, password resets, session lifecycle (retained 90 days).

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` |  |
| `user_id` | `uuid` nullable | Null on failed logins for non-existent users |
| `event_type` | `text` | `login_success` / `login_failed` / `logout` / `password_reset_requested` / `session_expired` |
| `ip_address` | `inet` |  |
| `user_agent` | `text` nullable |  |
| `metadata` | `jsonb` nullable |  |

### 6.4 Retention policy

Background job (nightly) enforces:

| Data | Retention | Action after |
| --- | --- | --- |
| Soft-deleted user accounts | 30 days | Hard-delete: profile, prompts, notes, tracked\_channels, notifications, credit\_events archived |
| Soft-deleted prompts / notes | 30 days | Hard-delete |
| `auth_events` | 90 days | Delete |
| `tracked_events` | 365 days | Delete (aggregates preserved in a monthly rollup) |
| `notifications` (read + dismissed) | 90 days | Delete |
| Failed webhook events | 30 days | Delete after review |
| `video_transcripts_cache` | 180 days since last access | Delete (re-fetchable) |

**GDPR data export:** endpoint `/api/user/export` returns all user-owned data as JSON. Triggered from `/settings/danger`.

**GDPR data deletion:** `/api/user/delete` soft-deletes account; hard-delete after 30 days per retention above.
