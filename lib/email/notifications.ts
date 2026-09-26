import type { ReactElement } from "react";

import { captureException } from "@sentry/nextjs";

import { getResendClient, NOTIFICATIONS_FROM_ADDRESS } from "@/lib/email/client";
import {
  DigestEmail,
  digestEmailText,
  type DigestNicheItem,
  type DigestOutlierItem,
  type DigestVideoItem,
} from "@/lib/email/templates/digest-email";
import { NotificationEmail, notificationEmailText } from "@/lib/email/templates/notification-email";
import { createServiceClient } from "@/lib/supabase/service";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Structurally compatible with workers/channel-sync.ts's DetectedEvent, but
// deliberately not imported from there -- lib/ shouldn't depend on
// workers/, and every send*Email function already implies its own event
// type by name, so `eventType` itself isn't needed here.
export interface NotificationEventInput {
  channelId: string;
  channelName: string;
  payload: Record<string, string | number>;
}

// gap 4: only a background job needs an arbitrary user's email (every
// other call site in this codebase looks up the *current session's* user
// via the session client, which doesn't help here) -- service-role admin
// lookup, not exported, since nothing outside this module needs it.
async function getUserEmail(userId: string): Promise<string | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  if (error || !data.user?.email) return null;
  return data.user.email;
}

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

// Every send*Email function funnels through here: look up the recipient,
// render both the React template and its plain-text fallback (required for
// deliverability -- HTML-only mail gets penalized by spam filters), send,
// and never throw -- a failed email must never take down the in-app
// delivery it's layered on top of (Phase 2 Task 2 gap 6/constraint).
// Eligibility (tier, email_enabled, quiet hours) is the caller's job
// (workers/channel-sync.ts's fanOutNotifications) -- this function sends
// unconditionally once asked.
async function sendEmail(params: {
  userId: string;
  subject: string;
  react: ReactElement;
  text: string;
}): Promise<boolean> {
  const client = getResendClient();
  if (!client) return false;

  const email = await getUserEmail(params.userId);
  if (!email) return false;

  try {
    const { error } = await client.emails.send({
      from: NOTIFICATIONS_FROM_ADDRESS,
      to: email,
      subject: params.subject,
      react: params.react,
      text: params.text,
    });
    if (error) {
      captureException(new Error(`Resend send failed: ${error.message}`));
      return false;
    }
    return true;
  } catch (cause) {
    captureException(cause);
    return false;
  }
}

async function sendPerVideoEmail(
  userId: string,
  subject: string,
  heading: string,
  body: string,
  ctaLabel: string,
  ctaUrl: string,
): Promise<boolean> {
  return sendEmail({
    userId,
    subject,
    react: NotificationEmail({ heading, body, ctaLabel, ctaUrl, siteUrl: SITE_URL }),
    text: notificationEmailText(heading, body, ctaUrl),
  });
}

export async function sendNewVideoEmail(
  userId: string,
  event: NotificationEventInput,
): Promise<boolean> {
  const title = typeof event.payload.title === "string" ? event.payload.title : "a new video";
  return sendPerVideoEmail(
    userId,
    `New video from ${event.channelName}`,
    `New video from ${event.channelName}`,
    title,
    "View channel",
    `${SITE_URL}/tracking/${event.channelId}`,
  );
}

export async function sendViewSpikeEmail(
  userId: string,
  event: NotificationEventInput,
): Promise<boolean> {
  const title = typeof event.payload.title === "string" ? event.payload.title : "A video";
  const crossed =
    typeof event.payload.crossedThreshold === "number"
      ? formatCount(event.payload.crossedThreshold)
      : "a milestone";
  return sendPerVideoEmail(
    userId,
    `${event.channelName} crossed ${crossed} views`,
    `${event.channelName} crossed ${crossed} views`,
    title,
    "View channel",
    `${SITE_URL}/tracking/${event.channelId}`,
  );
}

export async function sendCadenceChangeEmail(
  userId: string,
  event: NotificationEventInput,
): Promise<boolean> {
  const previous =
    typeof event.payload.previousPerWeek === "number"
      ? event.payload.previousPerWeek.toFixed(1)
      : "?";
  const current =
    typeof event.payload.currentPerWeek === "number"
      ? event.payload.currentPerWeek.toFixed(1)
      : "?";
  return sendPerVideoEmail(
    userId,
    `${event.channelName} changed upload cadence`,
    `${event.channelName} changed upload cadence`,
    `Was ${previous}/week, now ${current}/week`,
    "View channel",
    `${SITE_URL}/tracking/${event.channelId}`,
  );
}

export async function sendOutlierEmail(
  userId: string,
  event: NotificationEventInput,
): Promise<boolean> {
  const title = typeof event.payload.title === "string" ? event.payload.title : "A video";
  const viewCount =
    typeof event.payload.viewCount === "number" ? formatCount(event.payload.viewCount) : null;
  const videoId = typeof event.payload.videoId === "string" ? event.payload.videoId : null;
  // PRD.md §7.1's "one-click extract prompts from this outlier" -- the
  // email's CTA goes straight to that deep link (Phase 2 Task 1), not just
  // the channel page like the other three event types.
  const ctaUrl = videoId
    ? `${SITE_URL}/prompts?channelId=${event.channelId}&videoId=${videoId}`
    : `${SITE_URL}/tracking/${event.channelId}`;
  return sendPerVideoEmail(
    userId,
    `Outlier detected on ${event.channelName}`,
    `Outlier detected on ${event.channelName}`,
    viewCount ? `${title} — ${viewCount} views` : title,
    "Extract prompts",
    ctaUrl,
  );
}

export interface WeeklyDigestData {
  cadence: "daily" | "weekly";
  topOutliers: DigestOutlierItem[];
  newVideos: DigestVideoItem[];
  risingNiches?: DigestNicheItem[];
}

export async function sendWeeklyDigestEmail(
  userId: string,
  data: WeeklyDigestData,
): Promise<boolean> {
  const subject = data.cadence === "daily" ? "Your daily digest" : "Your weekly digest";
  return sendEmail({
    userId,
    subject,
    react: DigestEmail({ ...data, siteUrl: SITE_URL }),
    text: digestEmailText(data),
  });
}
