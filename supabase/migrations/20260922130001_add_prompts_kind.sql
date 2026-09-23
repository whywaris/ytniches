-- Down:
-- alter table public.prompts drop column if exists kind;

-- Phase 2 Task 3 (Thumbnail Ideas) gap 2: thumbnail idea sets are stored as
-- prompts rows, disambiguated by this column, rather than a 6th key on the
-- existing 5-key PromptOutput shape (which would force every regular AI
-- Prompts generation to also produce thumbnail ideas, or store misleading
-- empty title_variants/hook_variants/etc. on thumbnail-ideas rows).
-- Zero-downtime: existing rows get the default, insertPromptRow's insert
-- (lib/services/prompts.ts) never needed to change.
alter table public.prompts
  add column kind text not null default 'prompt'
  constraint prompts_kind_check check (kind in ('prompt', 'thumbnail_ideas'));
