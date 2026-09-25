import { QrCodeTool } from "@/components/features/tools/qr-code-tool";
import { ToolPage, toolMetadata } from "@/components/features/tools/tool-page";

// D-055: the old site's URL, kept exactly so its ranking carries over.
export const metadata = toolMetadata("youtube-qr-code-generator");

export default function Page() {
  return (
    <ToolPage slug="youtube-qr-code-generator">
      <QrCodeTool />
    </ToolPage>
  );
}
