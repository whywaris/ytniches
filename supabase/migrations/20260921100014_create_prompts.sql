-- Down:
-- drop table if exists public.prompts;

-- Backend-Schema.md §3.4. User-owned generation output. `workspace_id` has
-- no FK yet -- `workspaces` doesn't exist until Phase 3 (Backend-Schema.md
-- §5) -- same nullable-now pattern as tracked_channels.workspace_id.
-- `tone` stays plain text (Backend-Schema.md's own column type), not a
-- Postgres enum -- CLAUDE.md §4.2: enums are hard to change, and this is a
-- closed, small, app-validated (Zod) set already.
create table public.prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  workspace_id uuid,
  source_video_id uuid not null references public.videos (id) on delete cascade,
  target_audience text,
  tone text not null default 'neutral',
  output jsonb not null,
  regeneration_of uuid references public.prompts (id) on delete set null,
  feedback_tags text[] not null default '{}',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index prompts_user_created_idx on public.prompts (user_id, created_at desc);
create index prompts_source_video_id_idx on public.prompts (source_video_id);
create index prompts_regeneration_of_idx on public.prompts (regeneration_of);

create trigger set_prompts_updated_at
  before update on public.prompts
  for each row execute function public.set_updated_at();

alter table public.prompts enable row level security;

-- Standard user-scoped policy pattern (Backend-Schema.md §6.1). No DELETE
-- policy -- deletion is a soft-delete (deleted_at set via UPDATE), per the
-- schema's own deleted_at column, same shape as notifications'
-- read_at/dismissed_at being UPDATE-only.
create policy "users_read_own_prompts" on public.prompts
  for select
  using (auth.uid() = user_id);

create policy "users_insert_own_prompts" on public.prompts
  for insert
  with check (auth.uid() = user_id);

create policy "users_update_own_prompts" on public.prompts
  for update
  using (auth.uid() = user_id);
