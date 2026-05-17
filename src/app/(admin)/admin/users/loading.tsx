function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#E0D9CE] rounded-xl ${className ?? ''}`} />
}

export default function UsersLoading() {
  return (
    <div className="p-6 lg:p-8">
      <Skeleton className="h-9 w-32 mb-2" />
      <Skeleton className="h-4 w-28 mb-6" />
      <div className="flex gap-3 mb-5">
        <Skeleton className="h-9 w-56 rounded-full" />
        <Skeleton className="h-9 w-32 rounded-full" />
      </div>
      <div className="bg-white rounded-[20px] border border-[#E0D9CE] overflow-hidden">
        <div className="bg-[#F5F0E8] px-5 py-3 flex gap-20">
          {['Email', 'Plan', 'Joined', 'Actions'].map((h) => <Skeleton key={h} className="h-3 w-16" />)}
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-8 px-5 py-4 border-t border-[#E0D9CE]">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-24 hidden md:block" />
          </div>
        ))}
      </div>
    </div>
  )
}
