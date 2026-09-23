import { getInvitationPreview } from "@/lib/services/workspace";
import { createClient } from "@/lib/supabase/server";
import { InviteClient } from "@/app/invite/invite-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accept invitation — YTNiches",
};

// Application-Flow.md §2.2-style public route (not in middleware.ts's
// APP_ROUTE_PREFIXES — classifyRoute falls through to "public" by
// default). Reachable signed out: the preview lookup uses the
// service-role client keyed on the token alone (see getInvitationPreview's
// own comment), same trust model as a password-reset link.
export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) {
    return <InviteClient token="" preview={null} isAuthenticated={false} />;
  }

  const [previewResult, session] = await Promise.all([
    getInvitationPreview(token),
    createClient().then((supabase) => supabase.auth.getUser()),
  ]);

  return (
    <InviteClient
      token={token}
      preview={previewResult.ok ? previewResult.value : null}
      isAuthenticated={session.data.user !== null}
    />
  );
}
