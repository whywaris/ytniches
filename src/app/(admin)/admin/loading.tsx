function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#E0D9CE] rounded-xl ${className ?? ''}`} />
}

export default function AdminLoading() {
  return (
    <div className="p-6 lg:p-8">
      <Skeleton className="h-9 w-56 mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-[20px] border border-[#E0D9CE] p-5">
            <Skeleton className="h-10 w-10 mb-3" />
            <Skeleton className="h-7 w-16 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-[20px] border border-[#E0D9CE] p-6 mb-8">
        <Skeleton className="h-56 w-full" />
      </div>
      <div className="bg-white rounded-[20px] border border-[#E0D9CE] h-80" />
    </div>
  )
}
