import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Params { params: Promise<{ page: string }> }

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { page } = await params
    const supabase = await createClient()
    const { data } = await supabase
      .from('cta_settings')
      .select('*')
      .eq('page', page)
      .single()
    return NextResponse.json(data ?? null)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
