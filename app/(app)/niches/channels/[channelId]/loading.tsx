import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function ChannelDetailLoading() {
  return (
    <div className="mx-auto max-w-[1440px] px-6 py-6 lg:px-10">
      <LoadingSkeleton className="mb-4 h-5 w-32" />
      <div className="flex items-center gap-4">
        <LoadingSkeleton className="size-14 rounded-full" />
        <LoadingSkeleton className="h-8 w-64" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingSkeleton key={index} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}
