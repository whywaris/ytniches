-- ============================================================================
-- Migration 020: YouTube Automation Tools
-- Creates the automation_tools table with RLS, trigger, and 30 seed tools
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================================

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.automation_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tagline text NOT NULL DEFAULT '',
  logo_text text NOT NULL DEFAULT '',
  logo_bg text NOT NULL DEFAULT '#F1EFE8',
  logo_color text NOT NULL DEFAULT '#1A1612',
  website_url text NOT NULL DEFAULT '',
  affiliate_url text,
  stage text NOT NULL DEFAULT 'Research & Niche Selection',
  stage_number int NOT NULL DEFAULT 1,
  category text NOT NULL DEFAULT '',
  pricing text NOT NULL DEFAULT 'freemium',
  short_description text NOT NULL DEFAULT '',
  review text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  is_faceless_friendly boolean NOT NULL DEFAULT false,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.automation_tools ENABLE ROW LEVEL SECURITY;

-- 3. Public read policy (published tools only)
CREATE POLICY "Anyone can read published automation tools"
  ON public.automation_tools FOR SELECT
  USING (is_published = true);

-- 4. Admin full access policy
CREATE POLICY "Admins can manage automation tools"
  ON public.automation_tools FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 5. Updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_automation_tools_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_automation_tools_updated
  BEFORE UPDATE ON public.automation_tools
  FOR EACH ROW EXECUTE FUNCTION public.handle_automation_tools_updated_at();