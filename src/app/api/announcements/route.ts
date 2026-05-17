import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get('target') ?? 'public'

  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('announcements')
      .select('id, message')
      .eq('target', target)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      // Table might not exist yet
      return NextResponse.json({ announcement: null })
    }

    const announcement = data?.[0] ?? null
    return NextResponse.json({ announcement })
  } catch {
    return NextResponse.json({ announcement: null })
  }
}
