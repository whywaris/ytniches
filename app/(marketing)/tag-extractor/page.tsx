import { TagExtractorTool } from "@/components/features/tools/tag-extractor-tool";
import { ToolPage, toolMetadata } from "@/components/features/tools/tool-page";

// D-055: the old site's URL, kept exactly so its ranking carries over.
export const metadata = toolMetadata("tag-extractor");

export default function Page() {
  return (
    <ToolPage slug="tag-extractor">
      <TagExtractorTool />
    </ToolPage>
  );
}
