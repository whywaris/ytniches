import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function NicheDetailLoading() {
  return (
    <div className="mx-auto max-w-[1440px] px-6 py-6 lg:px-10">
      <LoadingSkeleton className="mb-4 h-5 w-32" />
      <LoadingSkeleton className="h-8 w-72" />
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <LoadingSkeleton className="h-64 w-full" />
        <LoadingSkeleton className="h-64 w-full lg:col-span-2" />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <LoadingSkeleton key={index} className="h-72 w-full" />
        ))}
      </div>
    </div>
  );
}
