import { EmbedCodeTool } from "@/components/features/tools/embed-code-tool";
import { ToolPage, toolMetadata } from "@/components/features/tools/tool-page";

// D-054: old site's URL kept exactly, so existing rankings carry over.
export const metadata = toolMetadata("youtube-embed-code-generator");

export default function Page() {
  return (
    <ToolPage slug="youtube-embed-code-generator">
      <EmbedCodeTool />
    </ToolPage>
  );
}
