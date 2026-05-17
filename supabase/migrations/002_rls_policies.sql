-- ============================================================
-- 002_rls_policies.sql
-- YTNiches — Row Level Security policies
-- Uses helper functions from 001 to avoid recursive RLS.
-- ============================================================

-- ==========================================
-- ENABLE RLS
-- ==========================================
alter table public.users       enable row level security;
alter table public.niches      enable row level security;
alter table public.blog_posts  enable row level security;
alter table public.saved_niches enable row level security;

-- ==========================================
-- USERS policies
-- ==========================================

-- Every authenticated user can read their own profile
create policy "users_select_own"
  on public.users
  for select
  using (auth.uid() = id);

-- Every authenticated user can update their own profile
-- (plan changes come via service-role in webhook handler, not here)
create policy "users_update_own"
  on public.users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admins can read all user profiles
create policy "admin_select_all_users"
  on public.users
  for select
  using (public.is_admin());

-- Admins can update all user profiles (e.g. grant admin, change plan)
create policy "admin_update_all_users"
  on public.users
  for update
  using (public.is_admin());

-- Service role inserts are allowed (handle_new_user trigger runs as definer)
-- No explicit insert policy needed for anon/auth roles.

-- ==========================================
-- NICHES policies
-- ==========================================

-- Unauthenticated visitors and free-plan users: published + free niches only
create policy "public_read_free_niches"
  on public.niches
  for select
  using (
    published = true
    and is_premium = false
  );

-- Pro / Lifetime users: all published niches
create policy "pro_read_all_niches"
  on public.niches
  for select
  using (
    published = true
    and public.get_user_plan() in ('pro', 'lifetime')
  );

-- Admins: full CRUD on niches (covers unpublished drafts too)
create policy "admin_all_niches"
  on public.niches
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- ==========================================
-- BLOG POSTS policies
-- ==========================================

-- Anyone (anon + auth) can read published posts
create policy "public_read_published_posts"
  on public.blog_posts
  for select
  using (published = true);

-- Admins: full CRUD on blog posts
create policy "admin_all_blog_posts"
  on public.blog_posts
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- ==========================================
-- SAVED NICHES policies
-- ==========================================

-- Users can read their own saved niche rows
create policy "users_read_own_saved"
  on public.saved_niches
  for select
  using (auth.uid() = user_id);

-- Users can save niches (insert)
create policy "users_insert_own_saved"
  on public.saved_niches
  for insert
  with check (auth.uid() = user_id);

-- Users can unsave niches (delete)
create policy "users_delete_own_saved"
  on public.saved_niches
  for delete
  using (auth.uid() = user_id);

-- Admins can view all saved niches (analytics)
create policy "admin_read_all_saved"
  on public.saved_niches
  for select
  using (public.is_admin());
