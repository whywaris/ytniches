function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#E0D9CE] rounded-xl ${className ?? ''}`} />
}

export default function DashboardLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="mb-8">
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-[20px] border border-[#E0D9CE] p-5">
            <Skeleton className="h-10 w-10 mb-3" />
            <Skeleton className="h-7 w-16 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="flex gap-3 mb-10">
        {[140, 110, 100].map((w) => <Skeleton key={w} className={`h-10 rounded-full w-[${w}px]`} />)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <Skeleton className="h-6 w-36 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-[20px] border border-[#E0D9CE] p-5 h-40" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
        </div>
      </div>
    </div>
  )
}
