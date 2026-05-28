import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const AUTH_PAGES = ['/auth/login', '/auth/signup', '/auth/verify-email', '/auth/reset-password', '/login', '/signup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  try {
    // Always run updateSession first — refreshes token, returns response with updated cookies
    const response = await updateSession(request)

    // Create client that reads from the UPDATED request cookies (after updateSession mutates them)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // 1. Logged in + visiting auth pages → redirect to dashboard
    if (user && AUTH_PAGES.some(p => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // 2. NOT logged in + visiting dashboard → redirect to login
    if (!user && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // 3. NOT logged in + visiting admin → redirect to login
    if (!user && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // 4. Logged in + visiting admin → check is_admin
    if (user && pathname.startsWith('/admin')) {
      const { data: profile } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!profile?.is_admin) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    return response
  } catch (error) {
    // If middleware fails, let the request through rather than crashing
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/auth/:path*'],
}
