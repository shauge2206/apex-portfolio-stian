export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Breadcrumb skeleton */}
      <div className="flex gap-2 items-center mb-8">
        <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
        <div className="h-3 w-2 bg-white/5 rounded animate-pulse" />
        <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
      </div>

      {/* Firm grid skeleton */}
      <div className="grid grid-cols-1 gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-[#0a0a0a]">
            <div className="flex gap-px bg-white/10">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex-1 aspect-square bg-white/5 animate-pulse" />
              ))}
            </div>
            <div className="px-4 py-3 border-t border-white/5 space-y-1.5">
              <div className="h-3.5 w-2/3 bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-1/4 bg-white/5 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
