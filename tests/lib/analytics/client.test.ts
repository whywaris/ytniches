import { afterAll, describe, expect, it, vi } from "vitest";

const init = vi.fn<(key: string, config: Record<string, unknown>) => void>();
const captureSpy = vi.fn<(event: string, properties?: Record<string, unknown>) => void>();
vi.mock("posthog-js", () => ({
  default: {
    init: (key: string, config: Record<string, unknown>) => init(key, config),
    capture: (event: string, properties?: Record<string, unknown>) => captureSpy(event, properties),
  },
}));

vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test");
const { capture } = await import("@/lib/analytics/client");
// Tests share one module graph (isolate: false); don't leak the key.
afterAll(() => {
  vi.unstubAllEnvs();
});

describe("analytics client", () => {
  it("runs PostHog cookieless (in-memory persistence), D-067e", async () => {
    await capture("test_event", { a: 1 });
    expect(init).toHaveBeenCalledWith(
      "phc_test",
      expect.objectContaining({ persistence: "memory" }),
    );
    expect(captureSpy).toHaveBeenCalledWith("test_event", { a: 1 });
  });
});
