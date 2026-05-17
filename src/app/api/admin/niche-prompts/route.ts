import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/verify'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET() {
  const check = await verifyAdmin()
  if (check instanceof NextResponse) return check

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('niche_prompts')
    .select(`*, field_values:prompt_field_values(*, field:prompt_fields(*))`)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const check = await verifyAdmin()
  if (check instanceof NextResponse) return check

  const { channel_name, channel_url, field_values } = (await request.json()) as {
    channel_name: string
    channel_url?: string
    field_values?: { field_id: string; value: string }[]
  }

  if (!channel_name?.trim()) return NextResponse.json({ error: 'channel_name required' }, { status: 400 })

  const supabase = createAdminClient()

  // Step 1: Create niche_prompt record
  const { data: prompt, error: promptError } = await supabase
    .from('niche_prompts')
    .insert({ channel_name: channel_name.trim(), channel_url: channel_url?.trim() ?? '' })
    .select()
    .single()

  if (promptError) return NextResponse.json({ error: promptError.message }, { status: 500 })

  // Step 2: Insert field values (only non-empty ones)
  if (field_values?.length) {
    const nonEmpty = field_values.filter((fv) => fv.value.trim() !== '')
    if (nonEmpty.length > 0) {
      const valuesToInsert = nonEmpty.map((fv) => ({
        niche_prompt_id: prompt.id as string,
        field_id: fv.field_id,
        value: fv.value,
      }))
      const { error: valuesError } = await supabase
        .from('prompt_field_values')
        .insert(valuesToInsert)
      if (valuesError) {
        return NextResponse.json({ error: valuesError.message }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ success: true, data: prompt })
}
