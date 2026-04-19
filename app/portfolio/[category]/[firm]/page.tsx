import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getFirmMedia } from '@/lib/cloudinary'
import FirmGallery from '@/components/FirmGallery'

export const revalidate = 3600

export default async function FirmPage({
  params,
}: {
  params: Promise<{ category: string; firm: string }>
}) {
  const { category: categorySlug, firm: firmSlug } = await params
  const data = await getFirmMedia(categorySlug, firmSlug)
  if (!data) notFound()

  const { categoryName, firmName, images, videos } = data

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-white/30 mb-6">
        <Link href="/portfolio" className="hover:text-white/60 transition-colors">
          Projects
        </Link>
        <span>/</span>
        <span className="text-white/60">{firmName}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-medium text-white">{firmName}</h1>
        <p className="text-sm text-white/30 mt-1">{categoryName}</p>
      </div>

      <FirmGallery images={images} videos={videos} />
    </div>
  )
}
