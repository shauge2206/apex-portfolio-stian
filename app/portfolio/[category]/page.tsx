import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCategoryPage } from '@/lib/cloudinary'

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category: categorySlug } = await params
  const data = await getCategoryPage(categorySlug)
  if (!data) notFound()

  const { category, firms } = data

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-white/30 mb-8">
        <Link href="/portfolio" className="hover:text-white/60 transition-colors">
          Portfolio
        </Link>
        <span>/</span>
        <span className="text-white/60">{category.name}</span>
      </nav>

      {/* Firm grid */}
      <div className="grid grid-cols-1 gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
        {firms.map((firm) => (
          <Link
            key={firm.slug}
            href={`/portfolio/${categorySlug}/${firm.slug}`}
            className="group bg-[#0a0a0a] block overflow-hidden"
          >
            {/* Preview strip */}
            <div className="flex gap-px bg-white/10">
              {firm.previewUrls.length > 0 ? (
                firm.previewUrls.map((url, i) => (
                  <div
                    key={i}
                    className="relative flex-1 aspect-square overflow-hidden bg-white/5"
                  >
                    <Image
                      src={url}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 33vw, (max-width: 1024px) 22vw, 16vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ))
              ) : (
                <div className="w-full aspect-[3/1] bg-white/5" />
              )}
            </div>

            {/* Info */}
            <div className="px-4 py-3 border-t border-white/5">
              <p className="text-sm font-medium text-white truncate">{firm.name}</p>
              <div className="flex gap-3 mt-1.5">
                {firm.imageCount > 0 && (
                  <span className="text-xs text-white/30">
                    {firm.imageCount} foto
                  </span>
                )}
                {firm.videoCount > 0 && (
                  <span className="text-xs text-white/30">
                    {firm.videoCount} video
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
