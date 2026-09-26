-- Down:
-- drop extension if exists vector;

-- D-074 / Niche-Discovery-Engine.md §5.3. niches.embedding holds
-- text-embedding-3-small vectors (1536 dims) so a new AI label can be
-- matched to an existing niche by cosine similarity instead of creating a
-- near-duplicate. Installed into `extensions` (Supabase convention) so the
-- type and operators never shadow anything in `public`.
create schema if not exists extensions;
create extension if not exists vector with schema extensions;
