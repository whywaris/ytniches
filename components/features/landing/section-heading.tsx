import { cn } from "@/lib/utils";

// D-082: section h2s use the marketing display face.
function SectionHeading({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      id={id}
      className={cn(
        "font-display text-h1 font-normal text-balance text-text-primary md:text-display-sm",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export { SectionHeading };
