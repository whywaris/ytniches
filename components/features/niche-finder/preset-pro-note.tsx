import Link from "next/link";

import { Lock } from "lucide-react";

// D-077: the "New faceless" preset is free for everyone, but its Faceless
// filter is Pro. On Starter, say so once, above the results.
function PresetProNote() {
  return (
    <p className="flex items-center gap-1.5 text-body-sm text-text-secondary">
      <Lock aria-hidden="true" className="size-3.5 shrink-0" />
      <span>
        Faceless filter is Pro —{" "}
        <Link href="/settings/billing" className="font-medium text-accent-text hover:underline">
          upgrade
        </Link>{" "}
        to customise it.
      </span>
    </p>
  );
}

export { PresetProNote };
