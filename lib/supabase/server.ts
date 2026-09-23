import { cookies } from "next/headers";

import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/lib/supabase/database.types";

// For Server Components, Server Actions, and Route Handlers. Anon key +
// the user's own session only — never the service role key (TRD.md §3.1:
// admin/service-role access is a separate, explicit path with an audit log).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component, which can't set cookies —
            // middleware refreshes the session on every request instead.
          }
        },
      },
    },
  );
}

// lib/context.ts's one non-Supabase cookie read (the workspace-id hint)
// goes through here rather than importing next/headers itself -- a
// second top-level `next/headers` import site is what a Turbopack panic
// this session traced back to (a hard `node:fs` chunking error on every
// page whose client tree reaches a "use server" action importing
// getRequestContext, once lib/context.ts also imported next/headers
// directly). Keeping it confined to this already-proven-safe file avoids
// that.
export async function getCookie(name: string): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value ?? null;
}
