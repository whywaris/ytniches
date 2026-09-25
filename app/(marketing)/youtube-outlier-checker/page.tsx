import { OutlierCheckerTool } from "@/components/features/tools/outlier-checker-tool";
import { ToolPage, toolMetadata } from "@/components/features/tools/tool-page";

// D-054: new tool, at the root like the others (no /tools prefix).
export const metadata = toolMetadata("youtube-outlier-checker");

export default function Page() {
  return (
    <ToolPage slug="youtube-outlier-checker">
      <OutlierCheckerTool />
    </ToolPage>
  );
}
