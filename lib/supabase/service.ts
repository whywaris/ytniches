import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

// Service-role client: bypasses RLS entirely. Only for the narrow set of
// writes Backend-Schema.md §6.1 designates service-role-only (channels,
// videos — shared cache tables with no per-user ownership to scope an
// authenticated-role RLS policy to, unlike credit_events). Security.md
// §1.3 principle 4 / CLAUDE.md's RLS gotcha: this is the "admin action"
// exception, used from a server-only context, never from a client-callable
// surface without validation already having happened first.
//
// SUPABASE_SERVICE_ROLE_KEY is blank in .env.local as of Phase 1C — fill it
// in from Supabase Dashboard -> Project Settings -> API -> service_role
// secret before any code that calls this actually runs.
export function createServiceClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
