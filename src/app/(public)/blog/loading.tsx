function SkeletonPostCard() {
  return (
    <div className="bg-white rounded-[20px] border border-[#E0D9CE] overflow-hidden animate-pulse">
      <div className="aspect-video bg-[#EDE8DF]" />
      <div className="p-5">
        <div className="flex gap-1.5 mb-3">
          <div className="h-5 w-16 bg-[#EDE8DF] rounded-full" />
          <div className="h-5 w-20 bg-[#EDE8DF] rounded-full" />
        </div>
        <div className="h-6 w-4/5 bg-[#EDE8DF] rounded mb-2" />
        <div className="h-4 w-full bg-[#EDE8DF] rounded mb-1.5" />
        <div className="h-4 w-3/4 bg-[#EDE8DF] rounded mb-4" />
        <div className="flex justify-between pt-3 border-t border-[#E0D9CE]">
          <div className="h-3 w-24 bg-[#EDE8DF] rounded" />
          <div className="h-3 w-20 bg-[#EDE8DF] rounded" />
        </div>
      </div>
    </div>
  )
}

export default function BlogLoading() {
  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 animate-pulse">
          <div className="h-12 w-28 bg-[#EDE8DF] rounded-xl mb-3" />
          <div className="h-5 w-96 bg-[#EDE8DF] rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonPostCard key={i} />)}
        </div>
      </div>
    </div>
  )
}
