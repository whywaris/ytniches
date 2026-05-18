import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET — fetch all channels with prompt values based on user plan
export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get user plan
  const { data: userData } = await supabase
    .from('users')
    .select('plan')
    .eq('id', user.id)
    .single()

  const isPro = userData?.plan === 'pro' || userData?.plan === 'lifetime'

  // Fetch all active templates
  const { data: templates } = await supabase
    .from('prompt_templates')
    .select('*')
    .eq('is_active', true)
    .order('position')

  // Fetch all active channels with prompt values
  const { data: channels } = await supabase
    .from('niche_channels')
    .select(`
      *,
      prompt_values:niche_prompt_values(
        *,
        template:prompt_templates(*)
      )
    `)
    .eq('is_active', true)
    .order('position')

  return NextResponse.json({
    templates: templates ?? [],
    channels: channels ?? [],
    isPro,
  })
}
