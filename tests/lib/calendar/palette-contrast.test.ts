import { describe, expect, it } from "vitest";

import { PALETTE } from "@/lib/calendar/colors";

// Calendar entry labels are near-black (#0a0a0b) on the channel colour.
function luminance(hex: string): number {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

describe("calendar channel palette", () => {
  it.each(PALETTE)("%s keeps near-black labels at 4.5:1 or better", (color) => {
    const ratio = (luminance(color) + 0.05) / (luminance("#0a0a0b") + 0.05);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
