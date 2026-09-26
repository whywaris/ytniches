import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { ToastProvider } from "@/components/ui/toast-provider";

vi.mock("@/app/(app)/settings/profile/actions", () => ({
  setTimeZoneAction: vi.fn(async () => ({ ok: true, value: undefined })),
}));

const { ProfileClient } = await import("@/app/(app)/settings/profile/profile-client");

describe("ProfileClient", () => {
  it("shows the saved time zone, nothing to save yet, and is accessible", async () => {
    const { container } = render(
      <ToastProvider>
        <ProfileClient timeZone="Asia/Karachi" timeZones={["UTC", "Asia/Karachi"]} />
      </ToastProvider>,
    );
    expect(screen.getByRole("combobox", { name: /time zone/i })).toHaveTextContent("Asia/Karachi");
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
    expect(await axe(container)).toHaveNoViolations();
  });
});
