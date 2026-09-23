import { beforeEach, describe, expect, it, vi } from "vitest";

const emailsSend = vi.fn();
const getResendClient = vi.fn();
vi.mock("@/lib/email/client", () => ({
  getResendClient: (...args: unknown[]) => getResendClient(...args),
  NOTIFICATIONS_FROM_ADDRESS: "YTNiches <updates@ytniches.com>",
}));

const getUserById = vi.fn();
vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({
    auth: { admin: { getUserById: (...args: unknown[]) => getUserById(...args) } },
  }),
}));

const captureException = vi.fn();
vi.mock("@sentry/nextjs", () => ({
  captureException: (...args: unknown[]) => captureException(...args),
}));

const {
  sendNewVideoEmail,
  sendViewSpikeEmail,
  sendCadenceChangeEmail,
  sendOutlierEmail,
  sendWeeklyDigestEmail,
} = await import("@/lib/email/notifications");

beforeEach(() => {
  vi.clearAllMocks();
  getResendClient.mockReturnValue({ emails: { send: emailsSend } });
  getUserById.mockResolvedValue({ data: { user: { email: "mac@example.com" } }, error: null });
  emailsSend.mockResolvedValue({ data: { id: "email-1" }, error: null });
});

const EVENT = {
  channelId: "chan-1",
  channelName: "Sleep Sounds Daily",
  payload: { videoId: "vid-1", title: "8 Hours of Deep Sleep" },
};

describe("sendNewVideoEmail", () => {
  it("sends with the right subject, recipient, and both react + text bodies", async () => {
    const sent = await sendNewVideoEmail("user-1", EVENT);

    expect(sent).toBe(true);
    expect(emailsSend).toHaveBeenCalledOnce();
    const call = emailsSend.mock.calls[0][0];
    expect(call.to).toBe("mac@example.com");
    expect(call.from).toBe("YTNiches <updates@ytniches.com>");
    expect(call.subject).toBe("New video from Sleep Sounds Daily");
    expect(call.react).toBeTruthy();
    expect(call.text).toContain("8 Hours of Deep Sleep");
  });

  it("returns false without looking up the user when Resend isn't configured", async () => {
    getResendClient.mockReturnValue(undefined);

    const sent = await sendNewVideoEmail("user-1", EVENT);

    expect(sent).toBe(false);
    expect(getUserById).not.toHaveBeenCalled();
    expect(emailsSend).not.toHaveBeenCalled();
  });

  it("returns false without sending when the user has no email on file", async () => {
    getUserById.mockResolvedValue({ data: { user: null }, error: null });

    const sent = await sendNewVideoEmail("user-1", EVENT);

    expect(sent).toBe(false);
    expect(emailsSend).not.toHaveBeenCalled();
  });

  it("returns false and reports to Sentry when Resend returns an error", async () => {
    emailsSend.mockResolvedValue({
      data: null,
      error: { message: "invalid_from_address", statusCode: 422, name: "invalid_from_address" },
    });

    const sent = await sendNewVideoEmail("user-1", EVENT);

    expect(sent).toBe(false);
    expect(captureException).toHaveBeenCalledOnce();
  });

  it("returns false and reports to Sentry when the send call throws", async () => {
    emailsSend.mockRejectedValue(new Error("network down"));

    const sent = await sendNewVideoEmail("user-1", EVENT);

    expect(sent).toBe(false);
    expect(captureException).toHaveBeenCalledOnce();
  });
});

describe("sendViewSpikeEmail", () => {
  it("formats the crossed threshold in the subject and body", async () => {
    await sendViewSpikeEmail("user-1", {
      ...EVENT,
      payload: { ...EVENT.payload, crossedThreshold: 100_000 },
    });

    const call = emailsSend.mock.calls[0][0];
    expect(call.subject).toBe("Sleep Sounds Daily crossed 100.0K views");
  });
});

describe("sendCadenceChangeEmail", () => {
  it("formats both rates in the body", async () => {
    await sendCadenceChangeEmail("user-1", {
      ...EVENT,
      payload: { previousPerWeek: 1, currentPerWeek: 3 },
    });

    const call = emailsSend.mock.calls[0][0];
    expect(call.text).toContain("Was 1.0/week, now 3.0/week");
  });
});

describe("sendOutlierEmail", () => {
  it("links the CTA to the prompt-generator deep link when a video id is present", async () => {
    await sendOutlierEmail("user-1", {
      ...EVENT,
      payload: { ...EVENT.payload, viewCount: 500_000 },
    });

    const call = emailsSend.mock.calls[0][0];
    expect(call.text).toContain("/prompts?channelId=chan-1&videoId=vid-1");
  });

  it("falls back to the channel page when no video id is in the payload", async () => {
    await sendOutlierEmail("user-1", { ...EVENT, payload: {} });

    const call = emailsSend.mock.calls[0][0];
    expect(call.text).toContain("/tracking/chan-1");
  });
});

describe("sendWeeklyDigestEmail", () => {
  it("uses a daily subject for daily cadence", async () => {
    await sendWeeklyDigestEmail("user-1", { cadence: "daily", topOutliers: [], newVideos: [] });
    expect(emailsSend.mock.calls[0][0].subject).toBe("Your daily digest");
  });

  it("uses a weekly subject and lists items in both react and text bodies", async () => {
    await sendWeeklyDigestEmail("user-1", {
      cadence: "weekly",
      topOutliers: [
        { title: "Viral video", channelName: "Chan A", url: "https://x/a", viewCount: 900_000 },
      ],
      newVideos: [{ title: "Fresh upload", channelName: "Chan B", url: "https://x/b" }],
    });

    const call = emailsSend.mock.calls[0][0];
    expect(call.subject).toBe("Your weekly digest");
    expect(call.text).toContain("Viral video");
    expect(call.text).toContain("Fresh upload");
  });
});
