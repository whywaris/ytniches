import { ThumbnailViewerTool } from "@/components/features/tools/thumbnail-viewer-tool";
import { ToolPage, toolMetadata } from "@/components/features/tools/tool-page";

// D-055: the old site's URL, kept exactly so its ranking carries over.
export const metadata = toolMetadata("youtube-thumbnail-download");

export default function Page() {
  return (
    <ToolPage slug="youtube-thumbnail-download">
      <ThumbnailViewerTool />
    </ToolPage>
  );
}
