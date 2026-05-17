import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('users').select('is_admin').eq('id', user.id).single()
  return data?.is_admin ? supabase : null
}

export async function GET() {
  const supabase = await verifyAdmin()
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: steps, error } = await supabase
    .from('prompt_steps')
    .select('*, subtabs:prompt_subtabs(*)')
    .order('position')
    .order('position', { referencedTable: 'prompt_subtabs' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(steps ?? [])
}

export async function POST(request: Request) {
  const supabase = await verifyAdmin()
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { label, icon } = (await request.json()) as { label: string; icon?: string }

  const { data: maxStep } = await supabase
    .from('prompt_steps')
    .select('position')
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const newPosition = (maxStep?.position ?? -1) + 1

  const { data: step, error } = await supabase
    .from('prompt_steps')
    .insert({ label, icon: icon ?? 'file-text', position: newPosition })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('prompt_subtabs').insert({
    step_id: step.id,
    label: 'New Prompt',
    title: '',
    subtitle: '',
    content: '',
    position: 0,
  })

  return NextResponse.json(step)
}
