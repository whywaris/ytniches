import { Info } from "lucide-react";

import { cn } from "@/lib/utils";
import { ESTIMATE_LABEL } from "@/lib/youtube/estimates";

// D-084: shown next to scores, niche tags and other figures we calculate
// from YouTube data, so they can't be mistaken for YouTube's own numbers.
function EstimateNote({ what, className }: { what: string; className?: string }) {
  return (
    <p className={cn("flex items-center gap-1.5 text-caption text-text-tertiary", className)}>
      <Info aria-hidden="true" className="size-3.5 shrink-0" />
      <span>
        {what}: {ESTIMATE_LABEL}.
      </span>
    </p>
  );
}

export { EstimateNote };
