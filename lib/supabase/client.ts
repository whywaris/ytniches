import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/supabase/database.types";

// Application-Flow.md §3, Security.md §2.3. Browser client: anon key only,
// session lives in the HttpOnly cookie Supabase SSR manages — never read
// or written directly here.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
