import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Use 303 redirect to ensure browser follows with GET
      const redirectUrl = new URL(next, origin)
      return NextResponse.redirect(redirectUrl.toString(), { status: 303 })
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}
