import { EmailButton, EmailLayout, EMAIL_COLORS } from "@/lib/email/templates/layout";

export interface NotificationEmailProps {
  heading: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  siteUrl: string;
}

// Shared by all four per-event emails (new_video/view_spike/cadence_change/
// outlier_detected) -- same content shape as composeNotification() in
// workers/channel-sync.ts (title/body/relatedResource), just rendered as an
// email instead of an in-app row.
export function NotificationEmail({
  heading,
  body,
  ctaLabel,
  ctaUrl,
  siteUrl,
}: NotificationEmailProps) {
  return (
    <EmailLayout preheader={body} siteUrl={siteUrl}>
      <p style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 8px" }}>{heading}</p>
      <p style={{ fontSize: "14px", color: EMAIL_COLORS.textSecondary, margin: 0 }}>{body}</p>
      <EmailButton href={ctaUrl} label={ctaLabel} />
    </EmailLayout>
  );
}

export function notificationEmailText(heading: string, body: string, ctaUrl: string): string {
  return `${heading}\n\n${body}\n\n${ctaUrl}`;
}
