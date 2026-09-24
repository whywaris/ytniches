import { cn } from "@/lib/utils";

function SectionHeading({
  id,
  eyebrow,
  headline,
  subhead,
  align = "center",
}: {
  id: string;
  eyebrow?: string;
  headline: string;
  subhead?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={cn("mb-10 max-w-3xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? (
        <p className="mb-3 text-body-sm font-medium tracking-wide text-accent uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 id={id} className="text-h1 font-semibold text-text-primary md:text-display-sm">
        {headline}
      </h2>
      {subhead ? <p className="mt-4 text-body-lg text-text-secondary">{subhead}</p> : null}
    </div>
  );
}

// Every landing section: consistent vertical rhythm + labelled region.
function Section({
  id,
  labelledBy,
  className,
  children,
}: {
  id?: string;
  labelledBy: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn("scroll-mt-20 px-6 py-20 md:px-10 md:py-28", className)}
    >
      {children}
    </section>
  );
}

export { Section, SectionHeading };
