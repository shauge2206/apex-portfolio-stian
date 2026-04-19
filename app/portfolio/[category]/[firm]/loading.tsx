export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Breadcrumb skeleton */}
      <div className="flex gap-2 items-center mb-6">
        <div className="h-3 w-14 bg-white/10 rounded animate-pulse" />
        <div className="h-3 w-2 bg-white/5 rounded animate-pulse" />
        <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
        <div className="h-3 w-2 bg-white/5 rounded animate-pulse" />
        <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
      </div>

      {/* Heading skeleton */}
      <div className="h-7 w-48 bg-white/10 rounded animate-pulse mb-8" />

      {/* Tabs skeleton */}
      <div className="flex gap-6 border-b border-white/10 mb-8">
        <div className="h-4 w-16 bg-white/15 rounded animate-pulse mb-3" />
        <div className="h-4 w-16 bg-white/5 rounded animate-pulse mb-3" />
      </div>

      {/* Masonry skeleton */}
      <div className="columns-2 md:columns-3 gap-2">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="break-inside-avoid mb-2 bg-white/5 rounded animate-pulse"
            style={{ aspectRatio: [3 / 4, 16 / 9, 1][i % 3] }}
          />
        ))}
      </div>
    </div>
  )
}
