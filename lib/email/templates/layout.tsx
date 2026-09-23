import type { ReactNode } from "react";

// Design-System.md §2.1/§2.2/§2.4 hex values -- email clients don't load
// Tailwind, so these are inline styles against the same dark-mode tokens,
// not the app's own classes. System font stack, not the app's webfont:
// most email clients strip @font-face / custom fonts regardless.
const COLORS = {
  bgBase: "#0a0a0b",
  bgSurface1: "#131315",
  textPrimary: "#f5f5f7",
  textSecondary: "#a1a1a6",
  textTertiary: "#6e6e73",
  borderDefault: "#38383a",
  accent: "#10b981",
};

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export interface EmailLayoutProps {
  preheader: string;
  children: ReactNode;
  siteUrl: string;
}

// Minimal shared shell for every notification/digest email (TRD.md §6.4):
// wordmark, one content card, a footer link to notification preferences.
// Plain divs with inline styles, not @react-email/components (gap 10) --
// deliberately not chasing pixel-perfect legacy-Outlook table layouts for
// templates this simple.
export function EmailLayout({ preheader, children, siteUrl }: EmailLayoutProps) {
  return (
    <div
      style={{
        backgroundColor: COLORS.bgBase,
        fontFamily: FONT_STACK,
        padding: "32px 16px",
      }}
    >
      {/* Hidden preheader text -- the one-line preview most inboxes show
          next to the subject. */}
      <div style={{ display: "none", overflow: "hidden", lineHeight: "1px", opacity: 0 }}>
        {preheader}
      </div>

      <div style={{ maxWidth: "480px", margin: "0 auto" }}>
        <p
          style={{
            color: COLORS.accent,
            fontSize: "16px",
            fontWeight: 700,
            margin: "0 0 24px",
          }}
        >
          YTNiches
        </p>

        <div
          style={{
            backgroundColor: COLORS.bgSurface1,
            border: `1px solid ${COLORS.borderDefault}`,
            borderRadius: "8px",
            padding: "24px",
            color: COLORS.textPrimary,
          }}
        >
          {children}
        </div>

        <p style={{ color: COLORS.textTertiary, fontSize: "12px", margin: "16px 0 0" }}>
          <a href={`${siteUrl}/settings/notifications`} style={{ color: COLORS.textTertiary }}>
            Manage notification preferences
          </a>
        </p>
      </div>
    </div>
  );
}

export function EmailButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      style={{
        display: "inline-block",
        backgroundColor: COLORS.accent,
        color: COLORS.bgBase,
        fontWeight: 600,
        fontSize: "14px",
        textDecoration: "none",
        padding: "10px 18px",
        borderRadius: "6px",
        marginTop: "16px",
      }}
    >
      {label}
    </a>
  );
}

export { COLORS as EMAIL_COLORS };
