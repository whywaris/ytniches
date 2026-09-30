import { EmailButton, EMAIL_COLORS } from "@/lib/email/templates/layout";

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export interface LoginLockEmailProps {
  minutes: number;
  resetUrl: string;
  siteUrl: string;
}

// Security.md §2.4 lockout alert (D-083). Own minimal wrapper like the
// invite email: a security notice shouldn't carry the notification-
// preferences footer, since it can't be switched off.
export function LoginLockEmail({ minutes, resetUrl, siteUrl }: LoginLockEmailProps) {
  return (
    <div
      style={{ backgroundColor: EMAIL_COLORS.bgBase, fontFamily: FONT_STACK, padding: "32px 16px" }}
    >
      <div style={{ display: "none", overflow: "hidden", lineHeight: "1px", opacity: 0 }}>
        Too many wrong passwords. Password sign-in is paused for {minutes} minutes.
      </div>
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- email HTML, not a Next page */}
        <img
          src={`${siteUrl}/email/logo.png`}
          alt="YTNiches"
          width={120}
          style={{ display: "block", margin: "0 0 24px" }}
        />
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
            Password sign-in is paused
          </p>
          <p style={{ fontSize: "14px", color: EMAIL_COLORS.textSecondary, margin: "0 0 8px" }}>
            Someone entered the wrong password for your YTNiches account several times, so password
            sign-in is paused for {minutes} minutes. Signing in with Google still works.
          </p>
          <p style={{ fontSize: "14px", color: EMAIL_COLORS.textSecondary, margin: 0 }}>
            If this wasn&apos;t you, reset your password.
          </p>
          <EmailButton href={resetUrl} label="Reset password" />
        </div>
        <p style={{ color: EMAIL_COLORS.textTertiary, fontSize: "12px", margin: "16px 0 0" }}>
          If it was you, wait {minutes} minutes and try again. You don&apos;t need to do anything
          else.
        </p>
      </div>
    </div>
  );
}

export function loginLockEmailText(minutes: number, resetUrl: string): string {
  return `Someone entered the wrong password for your YTNiches account several times, so password sign-in is paused for ${minutes} minutes. Signing in with Google still works.\n\nIf this wasn't you, reset your password: ${resetUrl}\n\nIf it was you, wait ${minutes} minutes and try again.`;
}
