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

  it("removes token/password/service_role_key/stripe_key/creem_key wherever they appear in extra context", () => {
    const event = {
      extra: {
        userToken: "abc",
        password: "hunter2",
        SUPABASE_SERVICE_ROLE_KEY: "sb_secret_xxx",
        stripe_key: "sk_live_xxx",
        creem_key: "creem_xxx",
        safeField: "keep me",
      },
    } as unknown as ErrorEvent;

    const result = scrubSensitiveData(event);

    expect(result.extra).toEqual({ safeField: "keep me" });
  });

  it("removes sensitive keys nested inside breadcrumb data", () => {
    const event = {
      breadcrumbs: [
        {
          category: "fetch",
          data: { url: "/api/billing", authorization: "Bearer xxx", status: 200 },
        },
      ],
    } as unknown as ErrorEvent;

    const result = scrubSensitiveData(event);

    expect(result.breadcrumbs?.[0].data).toEqual({ url: "/api/billing", status: 200 });
  });

  it("does not throw on an event with no user, request, or extra context", () => {
    expect(() => scrubSensitiveData({} as ErrorEvent)).not.toThrow();
  });
});
