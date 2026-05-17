-- ==========================================
-- FIX: Prompt Field Values RLS & Constraints
-- ==========================================

-- Ensure unique constraint exists on (niche_prompt_id, field_id)
-- The migration 015 already creates it, but this is idempotent
ALTER TABLE public.prompt_field_values
  DROP CONSTRAINT IF EXISTS prompt_field_values_niche_prompt_id_field_id_key;

ALTER TABLE public.prompt_field_values
  ADD CONSTRAINT prompt_field_values_niche_prompt_id_field_id_key
  UNIQUE (niche_prompt_id, field_id);

-- ==========================================
-- Fix RLS policies for prompt_field_values
-- ==========================================

-- Drop existing policies and recreate with proper access
DROP POLICY IF EXISTS "admin_all_field_values" ON public.prompt_field_values;
DROP POLICY IF EXISTS "pro_read_field_values" ON public.prompt_field_values;
DROP POLICY IF EXISTS "users_read_visible_field_values" ON public.prompt_field_values;

-- Admin can do everything
CREATE POLICY "admin_all_field_values" ON public.prompt_field_values
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );

-- Pro/Lifetime users can read field values where the field is show_to_users = true
CREATE POLICY "users_read_visible_field_values" ON public.prompt_field_values
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.prompt_fields
      WHERE id = field_id AND show_to_users = true
    )
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND plan IN ('pro', 'lifetime')
    )
  );

-- ==========================================
-- Fix RLS policies for niche_prompts
-- ==========================================

DROP POLICY IF EXISTS "admin_all_niche_prompts" ON public.niche_prompts;
DROP POLICY IF EXISTS "pro_read_niche_prompts" ON public.niche_prompts;
DROP POLICY IF EXISTS "users_read_niche_prompts" ON public.niche_prompts;

-- Admin can do everything
CREATE POLICY "admin_all_niche_prompts" ON public.niche_prompts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );

-- Authenticated pro/lifetime users can read published niche prompts
CREATE POLICY "users_read_niche_prompts" ON public.niche_prompts
  FOR SELECT USING (
    published = true
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND plan IN ('pro', 'lifetime')
    )
  );

-- ==========================================
-- Fix RLS policies for prompt_fields
-- ==========================================

DROP POLICY IF EXISTS "admin_all_prompt_fields" ON public.prompt_fields;
DROP POLICY IF EXISTS "users_read_active_fields" ON public.prompt_fields;

-- Admin can do everything
CREATE POLICY "admin_all_prompt_fields" ON public.prompt_fields
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );

-- All authenticated users can read active fields (needed for dashboard display)
CREATE POLICY "users_read_active_fields" ON public.prompt_fields
  FOR SELECT USING (
    is_active = true
    AND show_to_users = true
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND plan IN ('pro', 'lifetime')
    )
  );
