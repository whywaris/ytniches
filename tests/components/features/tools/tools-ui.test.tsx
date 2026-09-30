import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

const capture = vi.fn();
vi.mock("@/lib/analytics/client", () => ({ capture: (...args: unknown[]) => capture(...args) }));

const lookupChannelAction = vi.fn();
vi.mock("@/app/(marketing)/tools/actions", () => ({
  lookupChannelAction: (...args: unknown[]) => lookupChannelAction(...args),
  checkOutlierAction: vi.fn(),
  extractTagsAction: vi.fn(),
}));

const { SubscribeLinkTool, ChannelIdFinderTool } =
  await import("@/components/features/tools/channel-tools");
const { EmbedCodeTool } = await import("@/components/features/tools/embed-code-tool");
const { OutlierCheckerTool } = await import("@/components/features/tools/outlier-checker-tool");
const { ThumbnailResizerTool } = await import("@/components/features/tools/thumbnail-resizer-tool");
const { WatchTimeTool, RevenueTool } = await import("@/components/features/tools/calculator-tools");
const { TimestampTool } = await import("@/components/features/tools/timestamp-tool");
const { ThumbnailViewerTool } = await import("@/components/features/tools/thumbnail-viewer-tool");
const { TagExtractorTool } = await import("@/components/features/tools/tag-extractor-tool");
const { QrCodeTool } = await import("@/components/features/tools/qr-code-tool");
const { ToolPage } = await import("@/components/features/tools/tool-page");
const { getTool } = await import("@/lib/tools/registry");

const ID = "UC_x5XG1OV2P6uZZ5FSM9Ttw";

describe.each([
  ["SubscribeLinkTool", SubscribeLinkTool],
  ["ChannelIdFinderTool", ChannelIdFinderTool],
  ["EmbedCodeTool", EmbedCodeTool],
  ["OutlierCheckerTool", OutlierCheckerTool],
  ["ThumbnailResizerTool", ThumbnailResizerTool],
  ["WatchTimeTool", WatchTimeTool],
  ["RevenueTool", RevenueTool],
  ["TimestampTool", TimestampTool],
  ["ThumbnailViewerTool", ThumbnailViewerTool],
  ["TagExtractorTool", TagExtractorTool],
  ["QrCodeTool", QrCodeTool],
])("%s", (_name, Tool) => {
  it("has no axe violations", async () => {
    const { container } = render(<Tool />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("channel tools", () => {
  it("builds the subscribe link from a channel URL without calling the server", async () => {
    const user = userEvent.setup();
    render(<SubscribeLinkTool />);

    await user.type(screen.getByLabelText(/Channel URL/), `https://youtube.com/channel/${ID}`);
    await user.click(screen.getByRole("button", { name: "Generate" }));

    expect(
      screen.getByDisplayValue(`https://www.youtube.com/channel/${ID}?sub_confirmation=1`),
    ).toBeInTheDocument();
    expect(lookupChannelAction).not.toHaveBeenCalled();
    expect(capture).toHaveBeenCalledWith("tool_used", { slug: "youtube-subscribe-link-generator" });
    expect(screen.getByRole("link", { name: /Start free trial/ })).toHaveAttribute(
      "href",
      "/signup",
    );
  });

  it("asks the server only for @handles", async () => {
    const user = userEvent.setup();
    lookupChannelAction.mockResolvedValue({ ok: true, value: { channelId: ID, title: "Google" } });
    render(<ChannelIdFinderTool />);

    await user.type(screen.getByLabelText(/@handle or channel link/), "@GoogleDevelopers");
    await user.click(screen.getByRole("button", { name: "Find ID" }));

    expect(await screen.findByDisplayValue(ID)).toBeInTheDocument();
    expect(lookupChannelAction).toHaveBeenCalledWith({ query: "@GoogleDevelopers", company: "" });
  });

  it("explains legacy links instead of calling the server", async () => {
    const user = userEvent.setup();
    render(<ChannelIdFinderTool />);

    await user.type(screen.getByLabelText(/@handle or channel link/), "youtube.com/c/Legacy");
    await user.click(screen.getByRole("button", { name: "Find ID" }));

    expect(screen.getByText(/Old \/c\/ and \/user\/ links don't work here/)).toBeInTheDocument();
    expect(lookupChannelAction).not.toHaveBeenCalled();
  });
});

describe("ToolPage", () => {
  it("renders the FAQ and matching FAQPage JSON-LD", () => {
    const { container } = render(
      <ToolPage slug="youtube-outlier-checker">
        <p>tool</p>
      </ToolPage>,
    );
    const tool = getTool("youtube-outlier-checker")!;
    const jsonLd = JSON.parse(
      container.querySelector('script[type="application/ld+json"]')!.textContent!,
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(tool.name);
    expect(jsonLd["@type"]).toBe("FAQPage");
    expect(jsonLd.mainEntity.map((q: { name: string }) => q.name)).toEqual(
      tool.faq.map((item) => item.question),
    );
    expect(screen.getAllByRole("link", { name: /YouTube/ }).length).toBeGreaterThanOrEqual(3);
  });
});

describe("RevenueTool", () => {
  it("shows no estimate for an out-of-range RPM", async () => {
    const user = userEvent.setup();
    render(<RevenueTool />);
    await user.type(screen.getByLabelText(/^Views/), "50000");
    await user.type(screen.getByLabelText(/Your RPM/), "500");

    expect(screen.getByText(/Enter an RPM between/)).toBeInTheDocument();
    expect(screen.queryByText(/Estimated earnings/)).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText(/Your RPM/));
    await user.type(screen.getByLabelText(/Your RPM/), "4");
    expect(screen.getByText("$200.00")).toBeInTheDocument();
  });
});
