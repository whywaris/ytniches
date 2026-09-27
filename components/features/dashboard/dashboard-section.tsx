import Link from "next/link";

import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

// Shared chrome for each dashboard section: heading + optional "View all".
function DashboardSection({
  id,
  title,
  viewAllHref,
  children,
}: {
  id: string;
  title: string;
  viewAllHref?: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mt-10">
      <div className="mb-3 flex items-center justify-between">
        <h2 id={id} className="text-h4 font-semibold text-text-primary">
          {title}
        </h2>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="text-body-sm font-medium text-accent-text hover:underline"
          >
            View all
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

// Suspense fallback shaped like the section it stands in for.
function SectionSkeleton({ rows = 1, height = "h-24" }: { rows?: number; height?: string }) {
  return (
    <div className="mt-10 space-y-3">
      <LoadingSkeleton className="h-5 w-48" />
      {Array.from({ length: rows }).map((_, index) => (
        <LoadingSkeleton key={index} className={`${height} w-full rounded-md`} />
      ))}
    </div>
  );
}

export { DashboardSection, SectionSkeleton };
