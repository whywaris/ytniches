# YTNiches — Niche Discovery Engine + Niche Finder Redesign

2026-09-26 · Owner: Mac

> Status: **Approved for build** (D-069 – D-074). Supersedes the draft `Niche-Discovery-Engine-Spec.md`.
> Related: PRD.md §6.1, Backend-Schema.md §3 / §6, TRD.md §4.2 / §5.3, Security.md §3.1, UI-UX-Flow.md §5, Monetization.md §3.1, DECISIONS.md D-013, D-036, D-054, D-069 – D-074.

---

## 1. Problem

Today the Niche Finder only does live search. A user types a keyword, we run one `search.list` call (100 units), and we show up to 50 channels. That has four gaps:

- **Discovery is limited.** Users only see channels for keywords they already thought of.
- **Nothing refreshes on its own.** There is no "new niches today" feed.
- **Cards lack context.** A channel card shows only the channel. It has no videos and says nothing about why the niche is good. Avg views are usually 0, because search never fetches videos.
- **Outliers are per user.** They are found only for a user's tracked channels, so there is no global outlier feed.

Competitors (NexLev, TubeLab, OutlierKit) let users browse a **pre-crawled database that updates daily**.

## 2. Goal

Build a background **Niche Discovery Engine**. It crawls, enriches, classifies and scores YouTube channels every day. Then redesign `/niches` so it opens as a **browse feed of scored niches and channels**. Live search stays available as a secondary tab.

**Where we beat competitors:**

1. **A verdict at niche level.** Each niche gets a 0–100 Opportunity Score plus "why" chips. Competitors show channel lists only.
2. **Daily freshness** with trend arrows.
3. **One click from verdict to action:** Track → Prompts → Calendar.
4. **Honest data.** Estimates are labelled "est.", and a freshness timestamp is always visible.

## 3. Non-goals

- Chrome extension
- Shorts-specific discovery (long-form first)
- Revenue or RPM prediction beyond a labelled estimate

---

## 4. Architecture

```
discovery_seeds ──► discovery-run ──► channels (extended)
                                          │
                                          ▼
                                 enrichment ──► videos + outliers_feed
                                          │
                                          ▼
                           classify-run (gpt-4o-mini + embeddings) ──► niches, niche_id, is_faceless
                                          │
                                          ▼
                           niches-snapshot ──► niche_snapshots (score, trend) ──► Upstash cache
                                          │
                                          ▼
                                   /niches browse feed
```

- **Scheduler:** Inngest scheduled functions (`workers/discovery.ts`).
- **Quota tracking:** every YouTube call records its source in the per-source quota counter shown on **Admin → API Quotas**.
- **Reads cost no quota.** The UI reads only from our DB and cache, so browsing costs **zero** YouTube quota.

## 5. Data model

Per D-069 the engine **extends the existing shared tables** `channels` and `videos` (Backend-Schema.md §3.1 / §3.2) instead of adding parallel `yt_*` tables. Tracked channels, prompts, calendar entries and outliers already point at these rows, so one cache serves all of them.

Writes come from server-only Inngest workers and `lib/services/discovery/*` through the service-role client (D-070). Users get read-only access.

### 5.1 New columns on `channels`

| Column                      | Type                   | Notes                                                                                                                                                                           |
| --------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `avg_views_recent`          | `numeric` nullable     | Avg views of the latest ≤ 30 long-form uploads                                                                                                                                  |
| `outlier_score`             | `numeric` nullable     | `avg_views_recent ÷ subscriber_count`                                                                                                                                           |
| `first_upload_at`           | `timestamptz` nullable | Oldest upload we have seen                                                                                                                                                      |
| `uploads_playlist_id`       | `text` nullable        | From `contentDetails`                                                                                                                                                           |
| `has_shorts`                | `boolean` nullable     | Any upload ≤ 60 s                                                                                                                                                               |
| `made_for_kids`             | `boolean` nullable     | `status.madeForKids`                                                                                                                                                            |
| `likely_monetized`          | `boolean` nullable     | **Estimate.** Never shown as verified.                                                                                                                                          |
| `is_faceless`               | `boolean` nullable     | AI classification                                                                                                                                                               |
| `niche_id`                  | `uuid` nullable        | FK → `niches.id`, `on delete set null`                                                                                                                                          |
| `classification_confidence` | `numeric` nullable     | 0–1                                                                                                                                                                             |
| `classified_at`             | `timestamptz` nullable |                                                                                                                                                                                 |
| `refresh_tier`              | `text`                 | Check constraint: `hot` / `warm` / `cold`; default `warm`                                                                                                                       |
| `enriched_at`               | `timestamptz` nullable | Last enrichment run. Separate from `last_synced_at`, because channel-sync refreshes tracked channels without computing these metrics. Enrichment due-ness keys off this column. |
| `discovered_at`             | `timestamptz` nullable | When the engine first found it (null = came from search/tracking)                                                                                                               |
| `discovered_via_seed`       | `uuid` nullable        | FK → `discovery_seeds.id`, `on delete set null`                                                                                                                                 |

### 5.2 New column on `videos`

| Column             | Type               | Notes                         |
| ------------------ | ------------------ | ----------------------------- |
| `outlier_multiple` | `numeric` nullable | Views ÷ baseline (D-054 rule) |

### 5.3 New tables

```sql
-- What the crawler searches. Service-role only (RLS on, zero policies).
create table discovery_seeds (
  id uuid primary key default gen_random_uuid(),
  keyword text not null unique,
  source text not null check (source in ('manual','user_search','expansion')),
  priority int not null default 5,          -- 1 (highest) .. 10
  last_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- AI clusters. Everyone-read.
create table niches (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,                -- 'channels' is reserved (route clash)
  name text not null,
  description text,
  embedding extensions.vector(1536),        -- pgvector, text-embedding-3-small
  status text not null default 'active'
    check (status in ('active','rising','saturated','declining')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Daily niche scores (source of trend lines). Everyone-read.
create table niche_snapshots (
  niche_id uuid not null references niches(id) on delete cascade,
  snapshot_date date not null,
  opportunity_score int not null,           -- 0–100
  demand numeric, accessibility numeric, momentum numeric,
  outlier_density numeric, supply numeric,  -- normalised 0-1 (supply inverted)
  channel_count int not null default 0,
  new_channels_30d int not null default 0,
  median_views numeric,
  trend int,                                -- score minus score 7 days earlier
  why_chips text[] not null default '{}',   -- top-2 signals, worded
  primary key (niche_id, snapshot_date)
);

-- Global outlier feed. Everyone-read.
create table outliers_feed (
  video_id uuid primary key references videos(id) on delete cascade,
  channel_id uuid not null references channels(id) on delete cascade,
  niche_id uuid references niches(id) on delete set null,
  outlier_multiple numeric not null,
  detected_at timestamptz not null default now()
);
```

**Indexes (minimum):**

- `channels`: `(niche_id)`, `(last_synced_at)`, `(youtube_created_at)`, `(outlier_score desc)`
- `outliers_feed`: `(detected_at desc)`, `(niche_id)`
- `niche_snapshots`: `(snapshot_date)`

### 5.4 Retention (D-073)

`retention-purge` runs nightly and calls `purge_stale_youtube_data()`. It does three things:

- **Stale channels.** It deletes channels whose `last_synced_at` is older than **30 days** (YouTube API policy). Their videos are removed by cascade. A channel is **never** deleted if any user tracks it or if any prompt, calendar entry or tracked event references it or its videos.
- **Video trimming.** It keeps the latest **30** videos per untracked channel. Older ones are deleted unless user data references them.
- **Snapshot rollup.** It keeps 90 days of daily snapshots. Older ones are reduced to one row per ISO week (the Monday row).

---

## 6. Jobs (Inngest, `workers/discovery.ts`)

Crons run on the Pacific quota day (`TZ=America/Los_Angeles`), because YouTube resets the daily quota at midnight PT (D-076). Discovery starts right after the reset.

| Function                               | Schedule | What it does                                                                                                                                                                                                                                                                                                       | Quota      |
| -------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| `discovery-run`                        | 00:15 PT | Picks ~30 seeds: highest priority first, then longest since `last_run_at`. For each it runs `search.list` (type=video, publishedAfter=7d, order=viewCount), collects new channel IDs, qualifies them (§6.2) and upserts them. Qualified IDs go to enrichment.                                                      | ~3,000     |
| `enrichment-cron` → `enrichment-batch` | every 2h | Picks channels that are due by tier (§6.1), in batches of 50. For each batch: `channels.list` → uploads `playlistItems.list` → `videos.list`. Computes averages, multiples and tier, and writes `outliers_feed`.                                                                                                   | ~6,500/day |
| `classify-run`                         | 02:00 PT | Takes unclassified channels plus channels classified more than 30 days ago. gpt-4o-mini reads their titles and description and returns niche label, faceless, language, confidence and related keywords. The label is embedded and matched to an existing niche (cosine ≥ 0.85); otherwise a new niche is created. | $0 YouTube |
| `niches-snapshot`                      | 04:00 PT | Computes five signals + Opportunity Score per niche, writes today's snapshot, sets status, warms the Upstash cache and sends niche notifications (§11).                                                                                                                                                            | $0 YouTube |
| `retention-purge`                      | 03:00 PT | `purge_stale_youtube_data()`                                                                                                                                                                                                                                                                                       | $0         |

The existing `channel-sync` (tracked channels) keeps running. It also writes `outliers_feed` rows when it detects an outlier, so tracked outliers show up in the global feed.

### 6.1 Refresh tiers

| Tier   | Interval | Rule                                                                                              |
| ------ | -------- | ------------------------------------------------------------------------------------------------- |
| `hot`  | 2 days   | Tracked by any user, OR has an outlier in the last 14 days, OR created < 6 months ago             |
| `warm` | 7 days   | Everything else that qualifies                                                                    |
| `cold` | 25 days  | No longer qualifies (§6.2), but has not expired yet. This keeps every row inside the 30-day rule. |

Tracked channels are also refreshed by `channel-sync` at the plan cadence (D-013). Enrichment skips a channel whose `last_synced_at` is within its interval.

### 6.2 Qualification filter

A discovered channel is kept only if both conditions hold:

1. **Recent or breaking out.** It was created within the last **12 months**, OR it has a video ≥ **3×** its baseline published in the last **30 days**.
2. **Enough views.** Its `avg_views_recent` is ≥ **5,000**.

Channels that fail are not stored. Channels found through live search or tracking are always stored, as before; they simply get `refresh_tier = 'cold'` if they don't qualify.

### 6.3 Seeds

- **Initial list:** about 80 faceless keywords (Appendix A), inserted by migration and editable on `/admin/discovery`.
- **User searches:** every successful live Niche Finder search adds its keyword with source `user_search` and priority 5. Adding a keyword that already exists does nothing.
- **Expansion:** classify-run may add related keywords with source `expansion` and priority 8, capped at **20 per day**.

### 6.4 Idempotency and safety

- **Retry-safe writes.** Upserts only, keyed on YouTube IDs. Every `step.run` is retry-safe.
- **One run at a time.** Each function sets `concurrency: 1`, and each event carries an idempotency key.
- **Budget guard.** Before every YouTube call a job checks `hasJobBudget(cost)`: the discovery category's units so far plus `cost` must stay within its budget (`DISCOVERY_DAILY_BUDGET`, default **3,000**, D-075). If the check fails, the job stops cleanly and the remaining work waits for the next run. Discovery only ever draws on its own budget, so it can't starve live searches, tracking sync or free tools.

---

## 7. Quota budget (default 10,000 units/day, D-075)

The day's quota (Pacific day, D-076) is split into per-category budgets. Each category stops at its own cap, so no category can starve another.

| Category      | Sources                                 | Default budget | Env override             |
| ------------- | --------------------------------------- | -------------- | ------------------------ |
| Live user     | Niche Finder search, other in-app calls | 3,500          | `YT_BUDGET_LIVE`         |
| Tracking sync | `channel-sync`                          | 2,000          | `YT_BUDGET_SYNC`         |
| Free tools    | public tools (D-054)                    | 1,500          | `YT_BUDGET_FREE_TOOLS`   |
| Discovery     | discovery run + enrichment              | 3,000          | `DISCOVERY_DAILY_BUDGET` |

Within discovery's 3,000: ~30 seed searches at 100 units would use it all, so in practice the run searches fewer seeds and leaves room for enrichment (1 `channels.list` per 50 channels, 1 `playlistItems.list` per channel, 1 `videos.list` per 50 videos).

> ⚠️ 3,000 units a day keeps the crawler small. Raise `DISCOVERY_DAILY_BUDGET` (and the other budgets) after the **D-036** quota extension. The D-036 audit form must disclose the derived metrics (outlier multiple, Opportunity Score) under "Analytics & Reporting".

---

## 8. Scoring (D-071, v1)

**Opportunity Score (0–100) per niche.** It is computed from the niche's _performing_ channels: those with `avg_views_recent ≥ 5,000`.

| Signal           | Weight | Definition                                                     |
| ---------------- | ------ | -------------------------------------------------------------- |
| Accessibility    | 30     | % of performing channels with < 10k subscribers                |
| Demand           | 25     | Median views of niche videos published in the last 90 days     |
| Momentum         | 20     | % of performing channels created in the last 12 months         |
| Outlier density  | 15     | Share of niche videos from the last 90 days with multiple ≥ 3× |
| Supply (inverse) | 10     | Niche uploads in the last 30 days (fewer = better)             |

**How the score is built:**

- **Normalise.** Each signal is converted to 0–1 by percentile rank across all active niches. Supply is inverted.
- **Combine.** Score = Σ weight × normalised signal, rounded.
- **Label.** **80+ Low competition**, **50–79 Medium**, **< 50 High**.
- **Why chips.** Generated from the two signals that contribute most, e.g. "62% small channels ranking" or "4 new channels breaking out".
- **Trend.** Today's score minus the score 7 days ago. The niche detail page also shows a 90-day line.

**Status:**

| Status      | Rule                                   |
| ----------- | -------------------------------------- |
| `rising`    | Trend ≥ +10 or momentum ≥ 50%          |
| `declining` | Trend ≤ −10                            |
| `saturated` | Score < 35 and supply percentile ≥ 0.8 |
| `active`    | Otherwise                              |

**Minimum sample:** a niche with fewer than 3 performing channels gets no score and is hidden from the feed.

**Channel and video metrics:**

- **Channel outlier score:** `avg_views_recent ÷ subscribers`, shown as "4.7×".
- **Video outlier multiple:** views ÷ channel baseline. It uses the same rule as tracked outliers and the free Outlier Checker (`lib/outliers/scoring.ts`, D-054). The feed threshold is ≥ 3×.

All weights, thresholds and intervals live in `lib/discovery/config.ts` so they can be tuned after beta.

---

## 9. Niche Finder redesign (UI)

### 9.1 Page structure: `/niches`

Tabs, selected by `?tab=`:

1. **Niches** (default): browse feed of niche cards
2. **Channels**: browse feed of channel cards
3. **Outliers**: global outlier feed
4. **Search**: existing live search, unchanged (1 credit per new keyword)

A freshness line sits above the tabs, e.g. "Updated 3h ago · 1,284 new channels this week".

A paid live search runs on page load only when `tab=search` **and** `q` is present. Opening a shared feed URL is always free.

### 9.2 Niche card

- **Header:** name + status badge (Rising / Low competition / …).
- **Score:** Opportunity Score as a large number, plus a 7-day trend arrow with a delta.
- **Why:** two "why" chips.
- **Mini stats:** channels, new this month, median views.
- **Thumbnails:** three small thumbnails from the niche's top outlier videos.
- **Actions:** **View niche** · **Track** · **Generate prompts**.

### 9.3 Channel card

- **Header:**
  - avatar, name and subs;
  - niche badge;
  - faceless badge;
  - "Likely monetized (est.)" badge.
- **Four stat tiles:** **Avg views/video · Days since start · Uploads · Outlier score**.
- **Most popular videos:** 4 thumbnails, each with title, views and age. Clicking one opens YouTube.
- **Actions:**
  - Track (existing tracking flow);
  - Details (`/niches/channels/[id]`);
  - Open niche.

### 9.4 Filters

Filters sit in a left panel on desktop and a bottom sheet on mobile. All of them live in the URL query string, so a filtered view can be shared.

| Tab      | Filters                                                                                                                                                                                                                                       |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Niches   | Score range, status, sort (score / trend / newest)                                                                                                                                                                                            |
| Channels | Niche, first upload after/before, subscribers range, avg views range, outlier score min. Toggles: faceless only, exclude kids content, has shorts, likely monetized (est.). Language. Sort: outlier score / avg views / newest / subscribers. |
| Outliers | Niche, min multiple, published within 7/30/90 days                                                                                                                                                                                            |

### 9.5 Niche detail page: `/niches/[slug]`

- Score breakdown (five signals as bars) and a 90-day trend chart.
- Top channels and top outliers in the niche.
- CTA strip: **Track niche** (tracks the niche's top channels up to the plan's cap) → **Generate prompts** → **Add to calendar**.
- The slug `channels` is reserved because `/niches/channels/[id]` already exists.

### 9.6 Design rules

- Dark mode by default, with the emerald accent via tokens (never inline hex).
- Lucide icons only.
- Reuse the primitives: Card, Badge, Tag, Tabs, EmptyState, ErrorState, LoadingSkeleton, Modal.
- Thumbnails are lazy-loaded from YouTube CDN URLs. No images are stored.

---

## 10. Credits and plans (D-072)

- **Browsing** the default Niches, Channels and Outliers feeds and the niche detail page costs **0 credits**, because it is served from our DB. Sorting, paging and a niche-only filter are free too.
- **Filtered search** (any other filter on a feed tab) costs **1 credit**, then re-running or paging it is free for 24h. It is charged on Apply (or on the gate card a locked filtered URL shows), never while a page renders.
- **Live search** costs 1 credit (unchanged, D-065).
- **Plan limits on browse depth:**
  - Starter and Trial see the **top 50 niches** by Opportunity Score, plus an upgrade prompt at the end of the list.
  - Pro and Team see all niches.
  - The Channels and Outliers feeds are not capped.

## 11. Notifications

- A niche someone tracks moves by ±10 in 7 days: "**[niche]** moved +12 this week". "Tracking a niche" means tracking at least one of its channels.
- A new outlier (≥ 3×) appears in a niche the user tracks: "New outlier in **[niche]**".
- The weekly digest gets a "Top rising niches" section. It follows existing digest rules (D-061), so only email-eligible plans receive it.

These notifications are in-app notification rows, which go through the existing preferences and quiet hours.

## 12. Cost estimate (approx.)

| Stage  | Data                                    | Monthly   |
| ------ | --------------------------------------- | --------- |
| Launch | ~20k channels / 600k videos (~1 GB)     | ~$27–35   |
| Growth | ~100k channels / 3M videos (~3–4 GB)    | ~$40–50   |
| Scale  | ~500k channels / 15M videos (~15–20 GB) | ~$100–150 |

YouTube API usage is free. gpt-4o-mini tagging costs about $5–10 one-time per 100k channels, then about $1–3 per month.

## 13. Compliance

- API data is refreshed or deleted within 30 days (§5.4).
- "Likely monetized" and any RPM figure are always labelled **est.**
- The Privacy and Terms pages describe the public channel data we store. This is tracked under D-058.

## 14. Build order

Each step is its own commit, with tests.

1. Migrations
2. Service layer
3. Jobs
4. Admin (seeds, quota breakdown)
5. UI: tabs, Channels tab
6. UI: Niches tab and niche detail
7. UI: Outliers tab
8. Notifications and digest
9. **Gate** (checked in DECISIONS D-069), which requires all of:
   - 7 days of unattended cron runs;
   - the quota is never exceeded;
   - no data older than 30 days;
   - Lighthouse/a11y pass on the new pages.

## 15. Acceptance criteria

- The feed shows new channels and outliers every day with no user action.
- Browsing the feeds makes **zero** YouTube API calls, verified in tests.
- The daily job budget is never exceeded, and the 500-unit buffer is always kept.
- Every channel card shows the four stat tiles plus up to 4 popular videos.
- Every niche card shows the score, the trend and two "why" chips.
- Every estimated field is visibly labelled "est.".
- Every new component has a jest-axe test and a Storybook story.

---

## Appendix A — Initial seed keywords (v1, pending owner review)

Priority 3 for the first 40 and 5 for the rest.

The keywords below cover history, mystery and true crime; money and business; tech and AI; science and space; self-improvement and psychology; relaxing and ambient; stories and lists; and misc evergreen topics.

- ancient history documentary
- medieval history explained
- mafia history
- cold war history
- ww2 stories
- unsolved mysteries
- true crime documentary
- serial killer documentary
- conspiracy theories explained
- dark history
- personal finance tips
- passive income ideas
- stock market explained
- real estate investing for beginners
- side hustle ideas
- luxury lifestyle billionaire
- business case study
- how brands make money
- ai tools tutorial
- chatgpt tips
- tech explained
- future technology
- ai news
- space documentary
- universe explained
- black holes explained
- ocean mysteries
- science facts
- stoicism
- self improvement tips
- dark psychology
- motivation speech
- productivity tips
- philosophy explained
- sleep music
- rain sounds for sleeping
- lofi study music
- meditation music
- asmr no talking
- relaxing ambience
- reddit stories
- scary stories
- bedtime stories for adults
- top 10 facts
- did you know facts
- geography explained
- countries compared
- animal facts
- wildlife documentary
- survival stories
- bible stories
- mythology explained
- greek mythology
- norse mythology
- famous paintings explained
- architecture documentary
- abandoned places
- engineering explained
- how it's made
- car history
- aviation documentary
- military technology
- football history
- sports documentary
- chess explained
- video game lore
- movie explained
- anime recap
- book summary
- celebrity net worth
- royal family history
- crypto explained
- economics explained
- health facts
- nutrition myths
- cooking without talking
- travel documentary
- minimalism lifestyle
- language learning tips
- history of inventions
