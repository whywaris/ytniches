import { captureException } from "@sentry/nextjs";

import { getResendClient, NOTIFICATIONS_FROM_ADDRESS } from "@/lib/email/client";
import { InviteEmail, inviteEmailText } from "@/lib/email/templates/invite-email";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Separate from lib/email/notifications.ts's sendEmail: that helper looks
// up the recipient's address from an existing userId (lib/email/
// notifications.ts's getUserEmail), which doesn't apply here -- an invite
// goes to an arbitrary email address that may not have an account yet.
// Never throws, same reasoning as sendEmail: a failed invite email
// shouldn't take down inviteMember's own DB write, which already
// succeeded by the time this is called.
export async function sendWorkspaceInviteEmail(
  email: string,
  params: { workspaceName: string; role: string; token: string },
): Promise<boolean> {
  const client = getResendClient();
  if (!client) return false;

  const acceptUrl = `${SITE_URL}/invite?token=${params.token}`;

  try {
    const { error } = await client.emails.send({
      from: NOTIFICATIONS_FROM_ADDRESS,
      to: email,
      subject: `You've been invited to join ${params.workspaceName} on YTNiches`,
      react: InviteEmail({ workspaceName: params.workspaceName, role: params.role, acceptUrl }),
      text: inviteEmailText(params.workspaceName, params.role, acceptUrl),
    });
    if (error) {
      captureException(new Error(`Resend invite send failed: ${error.message}`));
      return false;
    }
    return true;
  } catch (cause) {
    captureException(cause);
    return false;
  }
}
