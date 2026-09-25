import { ThumbnailResizerTool } from "@/components/features/tools/thumbnail-resizer-tool";
import { ToolPage, toolMetadata } from "@/components/features/tools/tool-page";

// D-054: old site's URL kept exactly, so existing rankings carry over.
export const metadata = toolMetadata("thumbnail-resizer");

export default function Page() {
  return (
    <ToolPage slug="thumbnail-resizer">
      <ThumbnailResizerTool />
    </ToolPage>
  );
}
