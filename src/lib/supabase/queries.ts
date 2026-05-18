import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import type { Niche, BlogPost } from '@/types'

// ─── Niches ───────────────────────────────────────────────────────────────────

export async function getNiches(filters?: {
  category?: string
  competition?: string
  cpmRange?: string
  search?: string
  isPremium?: boolean
  limit?: number
  offset?: number
}): Promise<{ niches: Niche[]; count: number }> {
  const supabase = await createClient()
  return _queryNiches(supabase as any, filters)
}

// Uses service role to bypass RLS — for library page which shows all niches
// with premium ones locked in the UI. Niche list metadata is not sensitive.
export async function getAllNiches(filters?: {
  category?: string
  competition?: string
  cpmRange?: string
  search?: string
  limit?: number
  offset?: number
}): Promise<{ niches: Niche[]; count: number }> {
  const supabase = createAdminClient()
  return _queryNiches(supabase as any, filters)
}

async function _queryNiches(
  supabase: ReturnType<typeof createAdminClient>,
  filters?: {
    category?: string
    competition?: string
    cpmRange?: string
    search?: string
    isPremium?: boolean
    limit?: number
    offset?: number
  }
): Promise<{ niches: Niche[]; count: number }> {
  let query = supabase
    .from('niches')
    .select('*', { count: 'exact' })
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (filters?.category && filters.category !== 'All') {
    query = query.eq('category', filters.category)
  }
  if (filters?.competition && filters.competition !== 'All') {
    query = query.eq('competition_level', filters.competition)
  }
  if (filters?.search?.trim()) {
    query = query.ilike('name', `%${filters.search.trim()}%`)
  }
  if (filters?.isPremium !== undefined) {
    query = query.eq('is_premium', filters.isPremium)
  }

  // CPM range — use cpm_min as proxy for range bucket
  if (filters?.cpmRange && filters.cpmRange !== 'All') {
    if (filters.cpmRange === '0-15') query = query.lt('cpm_min', 15)
    else if (filters.cpmRange === '15-30') query = query.gte('cpm_min', 15).lt('cpm_min', 30)
    else if (filters.cpmRange === '30+') query = query.gte('cpm_min', 30)
  }

  const limit = filters?.limit ?? 24
  const offset = filters?.offset ?? 0
  query = query.range(offset, offset + limit - 1)

  const { data, count } = await query
  return { niches: (data as Niche[]) ?? [], count: count ?? 0 }
}

// Uses admin client so homepage shows both free + premium niches (premium locked in UI)
export async function getFeaturedNiches(): Promise<Niche[]> {
  const supabase = createAdminClient()
  const [freeRes, premiumRes] = await Promise.all([
    supabase
      .from('niches')
      .select('*')
      .eq('is_premium', false)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('niches')
      .select('*')
      .eq('is_premium', true)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(3),
  ])
  return [
    ...((freeRes.data as Niche[]) ?? []),
    ...((premiumRes.data as Niche[]) ?? []),
  ]
}

export async function getNicheBySlug(slug: string): Promise<Niche | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('niches')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  return (data as Niche) ?? null
}

export async function getRelatedNiches(
  category: string,
  excludeSlug: string,
  limit = 4
): Promise<Niche[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('niches')
    .select('id, name, slug, category, cpm_min, cpm_max, competition_level, is_premium, published, created_at, updated_at, growth_trend, avg_views, best_upload_day, ideal_video_length, top_audience, age_group, audience_size, video_ideas, script_hooks, title_templates, thumbnail_prompts, content_calendar')
    .eq('category', category)
    .eq('published', true)
    .neq('slug', excludeSlug)
    .limit(limit)
    .order('created_at', { ascending: false })
  return (data as Niche[]) ?? []
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

export async function getBlogPosts(limit = 50): Promise<BlogPost[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data as BlogPost[]) ?? []
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  return (data as BlogPost) ?? null
}
