import { describe, expect, it } from "vitest";

import { describeTrackedEvent } from "@/app/(app)/tracking/[channelId]/channel-event-item";
import type { TrackedEvent } from "@/lib/services/tracking";

function makeEvent(overrides: Partial<TrackedEvent> = {}): TrackedEvent {
  return {
    id: "e1",
    channelId: "chan-1",
    eventType: "new_video",
    payload: {},
    detectedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("describeTrackedEvent", () => {
  it("describes a new_video event using its title", () => {
    const event = makeEvent({ payload: { videoId: "v1", title: "Ep 1" } });
    expect(describeTrackedEvent(event)).toBe("Ep 1");
  });

  it("describes a view_spike event with the formatted milestone", () => {
    const event = makeEvent({
      eventType: "view_spike",
      payload: { title: "Ep 1", crossedThreshold: 100_000, viewCount: 105_000 },
    });
    expect(describeTrackedEvent(event)).toBe("Ep 1 crossed 100.0K views");
  });

  it("describes a cadence_change event with both rates", () => {
    const event = makeEvent({
      eventType: "cadence_change",
      payload: { previousPerWeek: 1, currentPerWeek: 3 },
    });
    expect(describeTrackedEvent(event)).toBe("Was 1.0/week, now 3.0/week");
  });

  it("returns null for a malformed payload instead of throwing", () => {
    const event = makeEvent({ eventType: "view_spike", payload: {} });
    expect(describeTrackedEvent(event)).toBeNull();
  });

  it("returns null for an unimplemented event type", () => {
    const event = makeEvent({ eventType: "subscriber_milestone" });
    expect(describeTrackedEvent(event)).toBeNull();
  });
});
