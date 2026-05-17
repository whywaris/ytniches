import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin/verify'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET() {
  const check = await verifyAdmin()
  if (check instanceof NextResponse) return check

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('prompt_fields')
    .select('*')
    .order('position')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const check = await verifyAdmin()
  if (check instanceof NextResponse) return check

  const { name, placeholder, show_to_users } = (await request.json()) as {
    name: string
    placeholder?: string
    show_to_users?: boolean
  }

  if (!name?.trim()) return NextResponse.json({ error: 'name required' }, { status: 400 })

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')

  const supabase = createAdminClient()

  const { data: maxField } = await supabase
    .from('prompt_fields')
    .select('position')
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const position = ((maxField?.position as number) ?? -1) + 1

  const { data, error } = await supabase
    .from('prompt_fields')
    .insert({ name: name.trim(), slug, placeholder: placeholder ?? '', show_to_users: show_to_users ?? true, position })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
