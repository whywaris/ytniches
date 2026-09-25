import { RevenueTool } from "@/components/features/tools/calculator-tools";
import { ToolPage, toolMetadata } from "@/components/features/tools/tool-page";

// D-055: the old site's URL, kept exactly so its ranking carries over.
export const metadata = toolMetadata("youtube-revenue-calculator");

export default function Page() {
  return (
    <ToolPage slug="youtube-revenue-calculator">
      <RevenueTool />
    </ToolPage>
  );
}
