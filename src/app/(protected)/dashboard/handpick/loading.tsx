function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#E0D9CE] rounded-xl ${className ?? ''}`} />
}

export default function ExplorerLoading() {
  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
      <div className="flex gap-3 mb-6">
        {['w-44', 'w-32', 'w-36'].map((w) => <Skeleton key={w} className={`h-10 rounded-full ${w}`} />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-52" />)}
      </div>
    </div>
  )
}
