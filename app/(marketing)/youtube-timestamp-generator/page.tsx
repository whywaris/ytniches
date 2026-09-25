import { TimestampTool } from "@/components/features/tools/timestamp-tool";
import { ToolPage, toolMetadata } from "@/components/features/tools/tool-page";

// D-055: the old site's URL, kept exactly so its ranking carries over.
export const metadata = toolMetadata("youtube-timestamp-generator");

export default function Page() {
  return (
    <ToolPage slug="youtube-timestamp-generator">
      <TimestampTool />
    </ToolPage>
  );
}
