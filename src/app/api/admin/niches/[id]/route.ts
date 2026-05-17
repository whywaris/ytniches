import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { verifyAdmin } from '@/lib/admin/verify'
import { createAdminClient } from '@/lib/supabase/server'

interface Params { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: Params) {
  const check = await verifyAdmin()
  if (check instanceof NextResponse) return check

  const { id } = await params
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('niches').select('*').eq('id', id).single()
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ niche: data })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const check = await verifyAdmin()
  if (check instanceof NextResponse) return check

  const { id } = await params
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

  const supabase = createAdminClient()
  const { data, error } = await supabase.from('niches').update(body).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/niches')
  revalidatePath('/')
  if (data?.slug) revalidatePath(`/niches/${data.slug as string}`)
  return NextResponse.json({ niche: data })
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const check = await verifyAdmin()
  if (check instanceof NextResponse) return check

  const { id } = await params
  const supabase = createAdminClient()
  const { error } = await supabase.from('niches').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/niches')
  revalidatePath('/')
  return NextResponse.json({ success: true })
}
