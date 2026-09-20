import { describe, expect, it } from "vitest";

import { scrubSensitiveData } from "@/lib/sentry/scrub";

import type { ErrorEvent } from "@sentry/nextjs";

describe("scrubSensitiveData", () => {
  it("removes email, username, and ip_address from user context", () => {
    const event = {
      user: { id: "123", email: "user@example.com", username: "someone", ip_address: "1.2.3.4" },
    } as ErrorEvent;

    const result = scrubSensitiveData(event);

    expect(result.user).toEqual({ id: "123" });
  });

  it("removes cookies and auth headers from request context", () => {
    const event = {
      request: {
        cookies: { "sb-access-token": "secret" },
        headers: {
          authorization: "Bearer secret",
          cookie: "sb-access-token=secret",
          "user-agent": "vitest",
        },
      },
    } as unknown as ErrorEvent;

    const result = scrubSensitiveData(event);

    expect(result.request?.cookies).toBeUndefined();
    expect(result.request?.headers?.authorization).toBeUndefined();
    expect(result.request?.headers?.cookie).toBeUndefined();
    expect(result.request?.headers?.["user-agent"]).toBe("vitest");
  });

  it("does not throw on an event with no user or request context", () => {
    expect(() => scrubSensitiveData({} as ErrorEvent)).not.toThrow();
  });
});
