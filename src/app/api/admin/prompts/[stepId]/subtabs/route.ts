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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ stepId: string }> }
) {
  const supabase = await verifyAdmin()
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { stepId } = await params
  const { label } = (await request.json()) as { label: string }

  const { data: maxSub } = await supabase
    .from('prompt_subtabs')
    .select('position')
    .eq('step_id', stepId)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const newPosition = (maxSub?.position ?? -1) + 1

  const { data, error } = await supabase
    .from('prompt_subtabs')
    .insert({
      step_id: stepId,
      label,
      title: '',
      subtitle: '',
      content: '',
      position: newPosition,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
