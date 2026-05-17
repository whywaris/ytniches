import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('niche_request_votes')
    .insert({ request_id: params.id, user_id: user.id })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Already voted' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fetch updated count
  const { data } = await supabase
    .from('niche_requests')
    .select('votes_count')
    .eq('id', params.id)
    .single()

  return NextResponse.json({ votes_count: data?.votes_count ?? 0 })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('niche_request_votes')
    .delete()
    .eq('request_id', params.id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data } = await supabase
    .from('niche_requests')
    .select('votes_count')
    .eq('id', params.id)
    .single()

  return NextResponse.json({ votes_count: data?.votes_count ?? 0 })
}
