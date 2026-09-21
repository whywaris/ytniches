import type { ComponentProps } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import {
  AddChannelModal,
  type ChannelPreview,
  type ChannelSearchResultItem,
} from "@/components/features/tracking/add-channel-modal";
import { err, ok } from "@/lib/result";

const PREVIEW: ChannelPreview = {
  channelId: "chan-1",
  name: "Sleep Sounds Daily",
  avatarUrl: null,
  subscriberCount: 482_000,
  videoCount: 310,
};

function renderModal(overrides: Partial<ComponentProps<typeof AddChannelModal>> = {}) {
  const props = {
    open: true,
    onOpenChange: vi.fn(),
    onValidateUrl: vi.fn().mockResolvedValue(ok(PREVIEW)),
    onAddChannel: vi.fn().mockResolvedValue(ok(undefined)),
    onSearch: vi.fn().mockResolvedValue([] as ChannelSearchResultItem[]),
    onAdded: vi.fn(),
    ...overrides,
  };

  const utils = render(<AddChannelModal {...props} />);

  return { ...utils, ...props };
}

describe("AddChannelModal", () => {
  it("has no accessibility violations while open", async () => {
    const { baseElement } = renderModal();
    expect(await axe(baseElement)).toHaveNoViolations();
  });

  it("disables Validate until a URL is entered", () => {
    renderModal();
    expect(screen.getByRole("button", { name: "Validate" })).toBeDisabled();
  });

  it("validating -> previewing: shows the channel preview on a successful validation", async () => {
    const user = userEvent.setup();
    const { onValidateUrl } = renderModal();

    await user.type(screen.getByLabelText("Channel URL"), "https://youtube.com/@sleepsounds");
    await user.click(screen.getByRole("button", { name: "Validate" }));

    expect(onValidateUrl).toHaveBeenCalledWith("https://youtube.com/@sleepsounds");
    expect(await screen.findByText("Sleep Sounds Daily")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add to tracking" })).toBeInTheDocument();
  });

  it("validating -> invalid: shows an inline error and stays on the form", async () => {
    const user = userEvent.setup();
    renderModal({ onValidateUrl: vi.fn().mockResolvedValue(err({ type: "invalid_url" })) });

    await user.type(screen.getByLabelText("Channel URL"), "not a url");
    await user.click(screen.getByRole("button", { name: "Validate" }));

    expect(
      await screen.findByText("That doesn't look like a valid YouTube channel URL."),
    ).toBeInTheDocument();
  });

  it("previewing -> adding -> added: confirms and reports success via onAdded", async () => {
    const user = userEvent.setup();
    const { onAddChannel, onAdded } = renderModal();

    await user.type(screen.getByLabelText("Channel URL"), "https://youtube.com/@sleepsounds");
    await user.click(screen.getByRole("button", { name: "Validate" }));
    await user.click(await screen.findByRole("button", { name: "Add to tracking" }));

    expect(onAddChannel).toHaveBeenCalledWith("chan-1");
    expect(await screen.findByText(/is now being tracked/)).toBeInTheDocument();
    expect(onAdded).toHaveBeenCalledWith("chan-1");
  });

  it("adding -> failed -> retry: shows the error and retrying calls onAddChannel again", async () => {
    const user = userEvent.setup();
    const onAddChannel = vi
      .fn()
      .mockResolvedValueOnce(err({ type: "tier_limit", limit: 10, current: 10 }))
      .mockResolvedValueOnce(ok(undefined));
    renderModal({ onAddChannel });

    await user.type(screen.getByLabelText("Channel URL"), "https://youtube.com/@sleepsounds");
    await user.click(screen.getByRole("button", { name: "Validate" }));
    await user.click(await screen.findByRole("button", { name: "Add to tracking" }));

    expect(
      await screen.findByText(
        "You've reached your tracking limit (10 of 10). Upgrade to track more.",
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(onAddChannel).toHaveBeenCalledTimes(2);
    expect(await screen.findByText(/is now being tracked/)).toBeInTheDocument();
  });

  it("search tab: submits a query and lists results", async () => {
    const user = userEvent.setup();
    const results: ChannelSearchResultItem[] = [
      { channelId: "chan-2", name: "Tiny Tech Reviews", avatarUrl: null, subscriberCount: 44_900 },
    ];
    const { onSearch } = renderModal({ onSearch: vi.fn().mockResolvedValue(results) });

    await user.click(screen.getByRole("tab", { name: "Search" }));
    await user.type(screen.getByLabelText("Search channels"), "tiny");
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(onSearch).toHaveBeenCalledWith("tiny");
    expect(await screen.findByText("Tiny Tech Reviews")).toBeInTheDocument();
  });

  it("search tab: adding a result calls onAddChannel and onAdded, then shows a checkmark", async () => {
    const user = userEvent.setup();
    const results: ChannelSearchResultItem[] = [
      { channelId: "chan-2", name: "Tiny Tech Reviews", avatarUrl: null, subscriberCount: 44_900 },
    ];
    const { onAddChannel, onAdded } = renderModal({ onSearch: vi.fn().mockResolvedValue(results) });

    await user.click(screen.getByRole("tab", { name: "Search" }));
    await user.type(screen.getByLabelText("Search channels"), "tiny");
    await user.click(screen.getByRole("button", { name: "Search" }));
    await user.click(await screen.findByRole("button", { name: "Add" }));

    expect(onAddChannel).toHaveBeenCalledWith("chan-2");
    expect(onAdded).toHaveBeenCalledWith("chan-2");
    expect(screen.queryByRole("button", { name: "Add" })).not.toBeInTheDocument();
  });
});
