import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Niche, ScriptHook, ContentCalendar } from '@/types'

export const runtime = 'nodejs'

export interface NicheApiResponse extends Niche {
  isLocked: boolean
  lockReason: 'signup' | 'upgrade' | null
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: niche, error } = await supabase
    .from('niches')
    .select(`
      id, name, slug, category,
      cpm_min, cpm_max, competition_level, growth_trend,
      avg_views, best_upload_day, ideal_video_length,
      top_audience, age_group, audience_size,
      is_premium, published, created_at, updated_at,
      video_ideas, script_hooks, title_templates,
      thumbnail_prompts, content_calendar
    `)
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (error || !niche) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const typedNiche = niche as unknown as Niche

  // Helper to return preview (locked) response
  function lockedResponse(reason: 'signup' | 'upgrade'): NextResponse {
    const preview: NicheApiResponse = {
      ...typedNiche,
      video_ideas: (typedNiche.video_ideas ?? []).slice(0, 3),
      script_hooks: ((typedNiche.script_hooks ?? []) as ScriptHook[]).slice(0, 1),
      title_templates: (typedNiche.title_templates ?? []).slice(0, 2),
      thumbnail_prompts: [],
      content_calendar: { weeks: [] } as ContentCalendar,
      isLocked: true,
      lockReason: reason,
    }
    return NextResponse.json(preview)
  }

  // Unauthenticated — preview only
  if (!user) return lockedResponse('signup')

  // Check plan
  const { data: userData } = await supabase
    .from('users')
    .select('plan')
    .eq('id', user.id)
    .single()

  const isPro =
    userData?.plan === 'pro' || userData?.plan === 'lifetime'

  const canAccess = !typedNiche.is_premium || isPro

  if (!canAccess) return lockedResponse('upgrade')

  // Full access
  const full: NicheApiResponse = {
    ...typedNiche,
    isLocked: false,
    lockReason: null,
  }
  return NextResponse.json(full)
}
