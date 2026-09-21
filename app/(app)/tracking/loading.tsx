import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

// UI-UX-Flow.md §6.6: "skeleton event cards". Next.js renders this
// automatically while page.tsx's async work (SSR feed + tracked-channels
// fetch) is in flight.
export default function TrackingLoading() {
  return (
    <div className="mx-auto flex max-w-[1440px] gap-6 px-6 py-6 lg:px-10">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <LoadingSkeleton className="h-9 w-full" />
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingSkeleton key={index} className="h-32 w-full" />
        ))}
      </div>
      <div className="hidden w-72 shrink-0 lg:block">
        <LoadingSkeleton className="h-[500px] w-full" />
      </div>
    </div>
  );
}
