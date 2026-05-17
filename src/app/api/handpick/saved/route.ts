import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json([])

    const { data, error } = await supabase
      .from('saved_handpick_niches')
      .select('handpick_id')
      .eq('user_id', user.id)

    if (error) return NextResponse.json([])

    return NextResponse.json(data?.map((d) => d.handpick_id) ?? [])
  } catch {
    return NextResponse.json([])
  }
}
