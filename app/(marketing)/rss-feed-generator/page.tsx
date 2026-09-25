import { RssFeedTool } from "@/components/features/tools/channel-tools";
import { ToolPage, toolMetadata } from "@/components/features/tools/tool-page";

// D-054: old site's URL kept exactly, so existing rankings carry over.
export const metadata = toolMetadata("rss-feed-generator");

export default function Page() {
  return (
    <ToolPage slug="rss-feed-generator">
      <RssFeedTool />
    </ToolPage>
  );
}
