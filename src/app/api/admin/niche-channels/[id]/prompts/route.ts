import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/verify'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

type Params = { params: Promise<{ id: string }> }

// POST — add new field to a channel
export async function POST(request: Request, { params }: Params) {
  const check = await verifyAdmin()
  if (check instanceof NextResponse) return check

  const { id } = await params
  const { field_name, access, content } = await request.json()

  if (!field_name?.trim()) return NextResponse.json({ error: 'field_name required' }, { status: 400 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('niche_prompt_values')
    .insert({
      channel_id: id,
      field_name: field_name.trim(),
      access: access ?? 'free',
      content: content ?? '',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
