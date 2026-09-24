import { NextResponse, type NextRequest } from "next/server";

import { createServerClient } from "@supabase/ssr";

// Application-Flow.md §2.1-2.4 route tables. Prefix-matched here — Next.js
// route groups like (app)/(auth) never appear in the actual URL — so
// adding a new page under an existing group later doesn't require
// touching this file. Includes routes that don't have a page yet (e.g.
// /niches, /admin/*): hitting one just 404s after the auth check passes,
// which is correct.
const AUTH_ROUTES = ["/signup", "/login", "/forgot-password", "/reset-password", "/verify"];
const APP_ROUTE_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/niches",
  "/tracking",
  "/prompts",
  "/outliers",
  "/calendar",
  "/workspace",
  "/settings",
];
const ADMIN_PREFIX = "/admin";

export type RouteAccess = "public" | "auth" | "app" | "admin";

export function classifyRoute(pathname: string): RouteAccess {
  if (pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`)) {
    return "admin";
  }
  if (AUTH_ROUTES.includes(pathname)) {
    return "auth";
  }
  if (
    APP_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  ) {
    return "app";
  }
  return "public";
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Also refreshes the session (extends TTL) on every authenticated
  // request, per Security.md §2.3.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const access = classifyRoute(pathname);

  if (access === "app" && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname + search);
    return NextResponse.redirect(redirectUrl);
  }

  if (access === "auth" && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (access === "admin" && !user) {
    // Application-Flow.md §2.6: non-super-admin -> hard 403, always,
    // including anonymous visitors — not a login redirect.
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Onboarding gate (UI-UX-Flow.md §3) and the admin role check share one
  // profiles query -- both only matter once `user` exists and the route
  // isn't purely public/auth. A skipped user never hits the onboarding
  // redirect: skipOnboarding() sets onboarding_step to 5, same as a
  // genuine finish (Backend-Schema.md §2.2's onboarding_skipped_at is what
  // tells those two apart, not relevant here).
  if ((access === "app" || access === "admin") && user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, onboarding_step, suspended_at, last_active_at")
      .eq("id", user.id)
      .single();

    // Suspended accounts: the PostgREST pre-request hook rejects every
    // Data API call they make (code account_suspended), including this
    // one -- so either signal sends them to the suspended page.
    if (profileError?.code === "account_suspended" || profile?.suspended_at) {
      return NextResponse.redirect(new URL("/suspended", request.url));
    }

    // "Active users" for the admin dashboard: stamped at most once per UTC
    // day (the date check here avoids an RPC on every request; the
    // function re-checks it server-side).
    const today = new Date().toISOString().slice(0, 10);
    if (profile && profile.last_active_at?.slice(0, 10) !== today) {
      await supabase.rpc("touch_last_active");
    }

    const onOnboardingRoute = pathname === "/onboarding" || pathname.startsWith("/onboarding/");
    if (access === "app" && profile?.onboarding_step === 0 && !onOnboardingRoute) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    if (access === "admin" && profile?.role !== "super_admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
