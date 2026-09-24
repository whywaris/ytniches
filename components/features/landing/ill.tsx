import { cn } from "@/lib/utils";

// Illustration placeholder (Landing-Page-Spec [ILL: id]). The real asset
// swaps in later via CSS background-image targeting [data-ill="<id>"] --
// no component change needed.
function Ill({ id, className }: { id: string; className?: string }) {
  return (
    <div
      data-ill={id}
      role="img"
      aria-label={`Illustration placeholder: ${id}`}
      className={cn(
        "flex items-center justify-center rounded-lg border border-border-default bg-bg-surface-1 bg-cover bg-center p-4 text-center font-mono text-caption text-text-secondary",
        className,
      )}
    >
      {id}
    </div>
  );
}

export { Ill };
