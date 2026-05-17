import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const sort = searchParams.get('sort') ?? 'votes'
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 20
  const offset = (page - 1) * limit

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('niche_requests')
    .select('*', { count: 'exact' })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  if (sort === 'votes') query = query.order('votes_count', { ascending: false })
  else if (sort === 'newest') query = query.order('created_at', { ascending: false })
  else query = query.order('created_at', { ascending: true })

  query = query.range(offset, offset + limit - 1)

  const { data: requests, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let requestsWithVotes = requests ?? []

  if (user && requestsWithVotes.length > 0) {
    const { data: userVotes } = await supabase
      .from('niche_request_votes')
      .select('request_id')
      .eq('user_id', user.id)
      .in('request_id', requestsWithVotes.map(r => r.id))

    const votedIds = new Set(userVotes?.map(v => v.request_id) ?? [])
    requestsWithVotes = requestsWithVotes.map(r => ({ ...r, has_voted: votedIds.has(r.id) }))
  }

  return NextResponse.json({ data: requestsWithVotes, total: count ?? 0, page, limit })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { title, description, category, reason } = body

  if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  if (!category) return NextResponse.json({ error: 'Category is required' }, { status: 400 })

  const { data, error } = await supabase
    .from('niche_requests')
    .insert({
      user_id: user.id,
      title: title.trim(),
      description: description?.trim() || null,
      category,
      reason: reason?.trim() || null,
      status: 'pending',
      votes_count: 1,
    })
    .select()
    .single()

  if (error) {
    if (error.message.includes('Request limit')) {
      return NextResponse.json({ error: 'You can only submit 3 requests per month.' }, { status: 429 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
