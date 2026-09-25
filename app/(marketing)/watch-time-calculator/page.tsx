import { WatchTimeTool } from "@/components/features/tools/calculator-tools";
import { ToolPage, toolMetadata } from "@/components/features/tools/tool-page";

// D-055: the old site's URL, kept exactly so its ranking carries over.
export const metadata = toolMetadata("watch-time-calculator");

export default function Page() {
  return (
    <ToolPage slug="watch-time-calculator">
      <WatchTimeTool />
    </ToolPage>
  );
}
