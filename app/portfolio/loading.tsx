const ratios = ['aspect-[4/3]', 'aspect-[3/4]', 'aspect-video', 'aspect-square', 'aspect-[4/3]', 'aspect-[3/2]']

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {[...Array(12)].map((_, i) => (
          <div key={i}>
            <div className={`${ratios[i % ratios.length]} bg-[#111] animate-pulse`} />
            <div className="pt-2 space-y-1.5">
              <div className="h-3.5 w-3/4 bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-white/5 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
