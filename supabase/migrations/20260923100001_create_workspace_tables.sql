-- Down:
-- alter table public.prompts drop constraint if exists prompts_workspace_id_fkey;
-- alter table public.tracked_channels drop constraint if exists tracked_channels_workspace_id_fkey;
-- drop table if exists public.workspace_invitations;
-- drop table if exists public.workspace_members;
-- drop table if exists public.workspaces;
-- drop type if exists public.workspace_role;

-- Backend-Schema.md §5. Phase 3 Task 1 (Workspace) — see DECISIONS.md D-043,
-- D-044 for the routing/UI-spec gaps resolved before this was written.
-- RLS policies live in the next migration (they need SECURITY DEFINER
-- helper functions to avoid self-referential recursion on
-- workspace_members — see that file's own comment).
create type public.workspace_role as enum ('admin', 'editor', 'viewer');

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  subscription_id uuid references public.subscriptions (id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.workspace_role not null default 'viewer',
  invited_by uuid references public.profiles (id) on delete set null,
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table public.workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  email text not null,
  role public.workspace_role not null,
  token text not null unique,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  invited_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index workspace_members_user_id_idx on public.workspace_members (user_id);
create index workspace_invitations_workspace_email_idx
  on public.workspace_invitations (workspace_id, email);

create trigger set_workspaces_updated_at
  before update on public.workspaces
  for each row execute function public.set_updated_at();

create trigger set_workspace_members_updated_at
  before update on public.workspace_members
  for each row execute function public.set_updated_at();

create trigger set_workspace_invitations_updated_at
  before update on public.workspace_invitations
  for each row execute function public.set_updated_at();

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_invitations enable row level security;

-- Backfill FK now that public.workspaces exists (Backend-Schema.md §5's
-- closing note): both columns were added nullable, no FK, in Phase 1
-- (tracked_channels, prompts), since workspaces didn't exist yet. Null
-- still means "personal" going forward.
alter table public.tracked_channels
  add constraint tracked_channels_workspace_id_fkey
  foreign key (workspace_id) references public.workspaces (id) on delete set null;

alter table public.prompts
  add constraint prompts_workspace_id_fkey
  foreign key (workspace_id) references public.workspaces (id) on delete set null;
