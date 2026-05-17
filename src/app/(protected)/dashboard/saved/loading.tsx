function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#E0D9CE] rounded-xl ${className ?? ''}`} />
}

export default function SavedLoading() {
  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-7 w-10 rounded-full" />
      </div>
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-9 w-20 rounded-full" />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
    </div>
  )
}
