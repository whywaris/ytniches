import { EmailButton, EMAIL_COLORS } from "@/lib/email/templates/layout";

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export interface InviteEmailProps {
  workspaceName: string;
  role: string;
  acceptUrl: string;
}

// PRD.md §8.1 workspace invites. Doesn't use EmailLayout (layout.tsx) --
// that shell's footer links to /settings/notifications, which assumes an
// existing account and doesn't apply here (the recipient may not have one
// yet). Same visual language (colors, wordmark, button), own minimal
// wrapper instead, with a "didn't expect this" line rather than a
// preferences link -- standard practice for an invite/access-grant email.
export function InviteEmail({ workspaceName, role, acceptUrl }: InviteEmailProps) {
  return (
    <div
      style={{
        backgroundColor: EMAIL_COLORS.bgBase,
        fontFamily: FONT_STACK,
        padding: "32px 16px",
      }}
    >
      <div style={{ display: "none", overflow: "hidden", lineHeight: "1px", opacity: 0 }}>
        You&apos;ve been invited to join {workspaceName} on YTNiches.
      </div>
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>
        <p
          style={{
            color: EMAIL_COLORS.accent,
            fontSize: "16px",
            fontWeight: 700,
            margin: "0 0 24px",
          }}
        >
          YTNiches
        </p>
        <div
          style={{
            backgroundColor: EMAIL_COLORS.bgSurface1,
            border: `1px solid ${EMAIL_COLORS.borderDefault}`,
            borderRadius: "8px",
            padding: "24px",
            color: EMAIL_COLORS.textPrimary,
          }}
        >
          <p style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 8px" }}>
            You&apos;ve been invited to {workspaceName}
          </p>
          <p style={{ fontSize: "14px", color: EMAIL_COLORS.textSecondary, margin: 0 }}>
            Join as {role} to collaborate on tracked channels, prompts, and the content calendar.
          </p>
          <EmailButton href={acceptUrl} label="Accept invitation" />
        </div>
        <p style={{ color: EMAIL_COLORS.textTertiary, fontSize: "12px", margin: "16px 0 0" }}>
          This invitation expires in 7 days. If you weren&apos;t expecting this, you can ignore this
          email.
        </p>
      </div>
    </div>
  );
}

export function inviteEmailText(workspaceName: string, role: string, acceptUrl: string): string {
  return `You've been invited to join ${workspaceName} on YTNiches as ${role}.\n\n${acceptUrl}\n\nThis invitation expires in 7 days. If you weren't expecting this, you can ignore this email.`;
}
