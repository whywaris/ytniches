import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

// UI-UX-Flow.md §5.4: "skeleton grid (matching card shape)". Next.js
// renders this automatically while page.tsx's async work (the SSR search)
// is in flight.
export default function NichesLoading() {
  return (
    <div className="mx-auto flex max-w-[1440px] gap-6 px-6 py-6 lg:px-10">
      <div className="w-80 shrink-0">
        <LoadingSkeleton className="h-[600px] w-full" />
      </div>
      <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <LoadingSkeleton key={index} className="h-40 w-full" />
        ))}
      </div>
    </div>
  );
}
