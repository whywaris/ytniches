import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/verify'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET() {
  const check = await verifyAdmin()
  if (check instanceof NextResponse) return check

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('niche_channels')
    .select(`*, prompt_values:niche_prompt_values(*)`)
    .order('position')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const check = await verifyAdmin()
  if (check instanceof NextResponse) return check

  const { channel_name, channel_url, category } = await request.json()
  if (!channel_name?.trim()) return NextResponse.json({ error: 'channel_name required' }, { status: 400 })

  const supabase = createAdminClient()

  // Get next position
  const { data: maxRow } = await supabase
    .from('niche_channels')
    .select('position')
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const { data, error } = await supabase
    .from('niche_channels')
    .insert({
      channel_name: channel_name.trim(),
      channel_url: channel_url?.trim() ?? '',
      category: category?.trim() ?? '',
      position: (maxRow?.position ?? -1) + 1,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
