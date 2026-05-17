import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const type = searchParams.get('type') // weekly_digest | all

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ytniches.com'

  if (!token) {
    return NextResponse.redirect(new URL('/unsubscribe?error=invalid', siteUrl))
  }

  const supabase = createAdminClient()

  const { data: prefs } = await supabase
    .from('email_preferences')
    .select('user_id')
    .eq('unsubscribe_token', token)
    .single()

  if (!prefs) {
    return NextResponse.redirect(new URL('/unsubscribe?error=invalid', siteUrl))
  }

  if (type === 'all') {
    await supabase
      .from('email_preferences')
      .update({ unsubscribed_all: true })
      .eq('unsubscribe_token', token)
  } else if (type === 'weekly_digest') {
    await supabase
      .from('email_preferences')
      .update({ weekly_digest: false })
      .eq('unsubscribe_token', token)
  }

  return NextResponse.redirect(new URL('/unsubscribe?success=true', siteUrl))
}
