import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/verify'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const check = await verifyAdmin()
  if (check instanceof NextResponse) return check

  const { id } = await params
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('niche_prompts')
    .select(`*, field_values:prompt_field_values(*, field:prompt_fields(*))`)
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(request: Request, { params }: Params) {
  const check = await verifyAdmin()
  if (check instanceof NextResponse) return check

  const { id } = await params
  const { channel_name, channel_url, field_values } = (await request.json()) as {
    channel_name?: string
    channel_url?: string
    field_values?: { field_id: string; value: string }[]
  }

  const supabase = createAdminClient()

  if (channel_name !== undefined || channel_url !== undefined) {
    const update: Record<string, string> = {}
    if (channel_name !== undefined) update.channel_name = channel_name
    if (channel_url !== undefined) update.channel_url = channel_url
    const { error: updateError } = await supabase.from('niche_prompts').update(update).eq('id', id)
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  if (field_values?.length) {
    for (const fv of field_values) {
      if (fv.value.trim() === '') {
        // Delete empty values instead of storing blank strings
        await supabase
          .from('prompt_field_values')
          .delete()
          .eq('niche_prompt_id', id)
          .eq('field_id', fv.field_id)
      } else {
        // Upsert non-empty values
        const { error: upsertError } = await supabase.from('prompt_field_values').upsert(
          { niche_prompt_id: id, field_id: fv.field_id, value: fv.value },
          { onConflict: 'niche_prompt_id,field_id' }
        )
        if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(_request: Request, { params }: Params) {
  const check = await verifyAdmin()
  if (check instanceof NextResponse) return check

  const { id } = await params
  const supabase = createAdminClient()
  const { error } = await supabase.from('niche_prompts').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
