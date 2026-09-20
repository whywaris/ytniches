import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(app)/actions";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — YTNiches",
};

// Placeholder landing page for Phase 0's auth flow (middleware redirects
// here on successful login). Real dashboard is Phase 1 (UI-UX-Flow.md
// §4.5).
//
// TODO Phase 1: signup should redirect to /onboarding instead of
// /dashboard once onboarding is built (Application-Flow.md §3.1).
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-base px-6 text-center">
      <h1 className="text-h1 font-semibold text-text-primary">Dashboard — coming in Phase 1</h1>
      {user?.email ? (
        <p className="text-body-sm text-text-secondary">Signed in as {user.email}</p>
      ) : null}
      <form action={signOut}>
        <Button type="submit" variant="ghost">
          Log out
        </Button>
      </form>
    </div>
  );
}
