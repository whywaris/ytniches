import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWeeklyDigest } from '@/lib/email/digest'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify admin
  const { data: profile } = await supabase
    .from('users')
    .select('is_admin, email')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json().catch(() => ({}))
  const targetEmail: string = (body as { email?: string }).email ?? profile.email ?? user.email ?? ''

  try {
    const result = await sendWeeklyDigest(targetEmail)
    return NextResponse.json({ success: true, ...result, sentTo: targetEmail })
  } catch (error) {
    console.error('Test digest failed:', error)
    return NextResponse.json({ error: 'Test digest failed', details: String(error) }, { status: 500 })
  }
}
