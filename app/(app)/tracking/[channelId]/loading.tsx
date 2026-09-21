import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function TrackingChannelLoading() {
  return (
    <div className="mx-auto max-w-[1440px] px-6 py-6 lg:px-10">
      <LoadingSkeleton className="mb-6 h-20 w-full" />
      <LoadingSkeleton className="h-96 w-full" />
    </div>
  );
}
