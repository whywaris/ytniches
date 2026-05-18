import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/verify'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

type Params = { params: Promise<{ id: string; promptId: string }> }

// PATCH — update field content or access
export async function PATCH(request: Request, { params }: Params) {
  const check = await verifyAdmin()
  if (check instanceof NextResponse) return check

  const { id, promptId } = await params
  const body = await request.json()

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('niche_prompt_values')
    .update(body)
    .eq('id', promptId)
    .eq('channel_id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE — remove a field from a channel
export async function DELETE(_request: Request, { params }: Params) {
  const check = await verifyAdmin()
  if (check instanceof NextResponse) return check

  const { id, promptId } = await params
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('niche_prompt_values')
    .delete()
    .eq('id', promptId)
    .eq('channel_id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
