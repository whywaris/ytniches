import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCustomerPortalUrl } from '@/lib/lemonsqueezy/client'

const APP_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', APP_URL))
  }

  const { data: profile } = await supabase
    .from('users')
    .select('lemonsqueezy_subscription_id')
    .eq('id', user.id)
    .single()

  if (!profile?.lemonsqueezy_subscription_id) {
    return NextResponse.redirect(new URL('/pricing', APP_URL))
  }

  try {
    const portalUrl = await getCustomerPortalUrl(profile.lemonsqueezy_subscription_id)
    return NextResponse.redirect(portalUrl)
  } catch (err) {
    console.error('[Portal] Failed to get portal URL:', err)
    return NextResponse.redirect(new URL('/dashboard', APP_URL))
  }
}
