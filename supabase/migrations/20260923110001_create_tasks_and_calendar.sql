-- Down:
-- drop policy if exists "calendar_entries_update_contributor" on public.calendar_entries;
-- drop policy if exists "calendar_entries_insert_contributor" on public.calendar_entries;
-- drop policy if exists "calendar_entries_select_member" on public.calendar_entries;
-- drop policy if exists "tasks_update_contributor" on public.tasks;
-- drop policy if exists "tasks_insert_contributor" on public.tasks;
-- drop policy if exists "tasks_select_member" on public.tasks;
-- drop function if exists public.is_workspace_contributor(uuid);
-- drop table if exists public.calendar_entries;
-- drop table if exists public.tasks;
-- drop type if exists public.calendar_status;
-- drop type if exists public.task_status;

-- Backend-Schema.md §5.4 (tasks), §5.5 (calendar_entries). Phase 3 Tasks
-- 2+3 — see DECISIONS.md D-045 for the /workspace/tasks routing call.
create type public.task_status as enum ('open', 'in_progress', 'done');
create type public.calendar_status as enum ('idea', 'scripted', 'filmed', 'edited', 'published');

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  title text not null,
  description text,
  assignee_id uuid references public.profiles (id) on delete set null,
  due_date date,
  status public.task_status not null default 'open',
  -- Polymorphic link (channel / prompt / calendar_entry), Backend-Schema.md
  -- §5.4's own pattern -- no FK possible across three target tables, so a
  -- CHECK constrains the type tag instead.
  linked_type text,
  linked_id uuid,
  created_by uuid not null references public.profiles (id) on delete cascade,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_linked_type_check
    check (linked_type is null or linked_type in ('channel', 'prompt', 'calendar_entry'))
);

create index tasks_workspace_id_idx on public.tasks (workspace_id) where deleted_at is null;
create index tasks_assignee_id_idx on public.tasks (assignee_id) where deleted_at is null;
create index tasks_workspace_status_idx on public.tasks (workspace_id, status) where deleted_at is null;

-- workspace_id nullable: Backend-Schema.md §5.5's "Null = personal calendar
-- entry; set = team". Only the team-scoped path has a UI in this phase
-- (Phase 3 kickoff's own constraint), but the column and its RLS below
-- both already support the personal case so no later migration is needed
-- to add it.
create table public.calendar_entries (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  channel_id uuid references public.channels (id) on delete set null,
  title text not null,
  description text,
  linked_prompts uuid[] not null default '{}'::uuid[],
  status public.calendar_status not null default 'idea',
  scheduled_for timestamptz,
  assignee_id uuid references public.profiles (id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index calendar_entries_workspace_id_idx
  on public.calendar_entries (workspace_id) where deleted_at is null;
create index calendar_entries_user_id_idx
  on public.calendar_entries (user_id) where workspace_id is null and deleted_at is null;
create index calendar_entries_scheduled_for_idx
  on public.calendar_entries (workspace_id, scheduled_for) where deleted_at is null;

create trigger set_tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

create trigger set_calendar_entries_updated_at
  before update on public.calendar_entries
  for each row execute function public.set_updated_at();

alter table public.tasks enable row level security;
alter table public.calendar_entries enable row level security;

-- Reuses is_workspace_member/is_workspace_admin (Backend-Schema.md §5.7) --
-- same SECURITY DEFINER reasoning applies verbatim, these two tables just
-- consume the existing helpers rather than needing their own recursion
-- fix. One new helper: "editor or admin" (a plain "viewer" role is
-- read-only by name and by PRD.md §8.1's role model — create/edit/assign
-- on tasks and calendar entries is a contributor action, not a viewing
-- one).
create function public.is_workspace_contributor(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = auth.uid()
      and role in ('admin', 'editor')
  );
$$;
revoke execute on function public.is_workspace_contributor(uuid) from public, anon;
grant execute on function public.is_workspace_contributor(uuid) to authenticated;

-- tasks ---------------------------------------------------------------

create policy "tasks_select_member" on public.tasks
  for select
  using (public.is_workspace_member(workspace_id));

create policy "tasks_insert_contributor" on public.tasks
  for insert
  with check (public.is_workspace_contributor(workspace_id) and created_by = auth.uid());

-- Soft-delete only (Backend-Schema.md §1.3) -- deleteTask sets deleted_at
-- via this same UPDATE policy, no separate DELETE policy exists.
create policy "tasks_update_contributor" on public.tasks
  for update
  using (public.is_workspace_contributor(workspace_id));

-- calendar_entries ------------------------------------------------------

create policy "calendar_entries_select_member" on public.calendar_entries
  for select
  using (
    (workspace_id is not null and public.is_workspace_member(workspace_id))
    or (workspace_id is null and user_id = auth.uid())
  );

create policy "calendar_entries_insert_contributor" on public.calendar_entries
  for insert
  with check (
    user_id = auth.uid()
    and (
      (workspace_id is not null and public.is_workspace_contributor(workspace_id))
      or workspace_id is null
    )
  );

create policy "calendar_entries_update_contributor" on public.calendar_entries
  for update
  using (
    (workspace_id is not null and public.is_workspace_contributor(workspace_id))
    or (workspace_id is null and user_id = auth.uid())
  );
