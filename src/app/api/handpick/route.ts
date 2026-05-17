import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const hotOnly = searchParams.get('hot') === 'true'

  const { data: { user } } = await supabase.auth.getUser()
  let isPro = false

  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single()
    isPro = userData?.plan === 'pro' || userData?.plan === 'lifetime'
  }

  let query = supabase
    .from('handpick_niches')
    .select('*')
    .eq('published', true)
    .order('position')

  if (category) query = query.eq('category', category)
  if (hotOnly) query = query.eq('is_hot', true)
  if (!isPro) query = query.eq('is_pro_only', false)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
