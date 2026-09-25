import { ChannelIdFinderTool } from "@/components/features/tools/channel-tools";
import { ToolPage, toolMetadata } from "@/components/features/tools/tool-page";

// D-054: new tool, at the root like the others (no /tools prefix).
export const metadata = toolMetadata("youtube-channel-id-finder");

export default function Page() {
  return (
    <ToolPage slug="youtube-channel-id-finder">
      <ChannelIdFinderTool />
    </ToolPage>
  );
}
