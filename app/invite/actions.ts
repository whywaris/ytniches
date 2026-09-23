"use server";

import {
  acceptInvitationAction,
  setActiveWorkspaceCookieAction,
} from "@/app/(app)/workspace/actions";
import { getInvitationPreview, type InvitationPreview } from "@/lib/services/workspace";
import type { InvalidInvitationError } from "@/lib/services/workspace";
import type { Result } from "@/lib/result";

// getInvitationPreview needs no session (Application-Flow.md §2.2-style
// public route) -- reused directly, not re-exported from workspace/
// actions.ts, since that file's other actions all assume an authenticated
// getRequestContext(). acceptInvitationAction does require a session
// (getRequestContext() throws otherwise); this page's own client redirects
// through /login?redirect=/invite?token=... first (Application-Flow.md
// §5.7's existing deep-link pattern), so by the time this fires a session
// exists.
export async function getInvitationPreviewAction(
  token: string,
): Promise<Result<InvitationPreview, InvalidInvitationError>> {
  return getInvitationPreview(token);
}

export async function acceptInvitationAndActivateAction(
  token: string,
): ReturnType<typeof acceptInvitationAction> {
  const result = await acceptInvitationAction(token);
  if (result.ok) {
    await setActiveWorkspaceCookieAction(result.value.id);
  }
  return result;
}
