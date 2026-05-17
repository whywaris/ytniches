-- Allow anyone (unauthenticated) to read ALL published niches.
-- Field-level restriction (preview vs full kit) is enforced in the API layer.

drop policy if exists "public_read_free_niches"  on public.niches;
drop policy if exists "pro_read_all_niches"       on public.niches;
drop policy if exists "public_read_published_niches" on public.niches;

create policy "public_read_published_niches"
  on public.niches
  for select
  using (published = true);
