import fs from 'fs'
import path from 'path'
import { getPortfolioCache, imgUrl, videoThumbUrl } from '@/lib/cloudinary'
import ThumbnailPicker from './ThumbnailPicker'

export default async function AdminPage() {
  let categories
  try {
    categories = await getPortfolioCache()
  } catch (e: any) {
    return <pre style={{ color: 'red', padding: '2rem' }}>getPortfolioCache failed: {e?.message}</pre>
  }

  let overrides: Record<string, string> = {}
  try {
    overrides = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/thumbnails.json'), 'utf-8'))
  } catch (e: any) {
    return <pre style={{ color: 'red', padding: '2rem' }}>thumbnails.json failed: {e?.message}</pre>
  }

  let firms
  try {
    firms = categories.flatMap((cat) =>
      cat.firms.map((firm) => {
        const overrideId = overrides[firm.slug]
        const overrideImg = overrideId ? firm.images.find((r) => r.publicId === overrideId) : null
        const overrideVid = overrideId ? firm.videos.find((r) => r.publicId === overrideId) : null
        const fallback = firm.thumbnail ?? firm.images[0] ?? null

        const currentThumbUrl = overrideImg
          ? imgUrl(overrideImg.publicId, { width: 400, height: 300, crop: 'fill' })
          : overrideVid
          ? videoThumbUrl(overrideVid.publicId)
          : fallback
          ? imgUrl(fallback.publicId, { width: 400, height: 300, crop: 'fill' })
          : firm.videos[0]
          ? videoThumbUrl(firm.videos[0].publicId)
          : null

        return {
          name: firm.name,
          slug: firm.slug,
          currentThumbnailId: overrideId ?? null,
          thumbnailUrl: currentThumbUrl,
          images: firm.images.map((r) => ({
            publicId: r.publicId,
            url: imgUrl(r.publicId, { width: 400, crop: 'limit' }),
            type: 'image' as const,
          })),
          videos: firm.videos.map((r) => ({
            publicId: r.publicId,
            url: videoThumbUrl(r.publicId),
            type: 'video' as const,
          })),
        }
      })
    )
  } catch (e: any) {
    return <pre style={{ color: 'red', padding: '2rem' }}>firms mapping failed: {e?.message}</pre>
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-xl font-medium text-white">Thumbnail admin</h1>
        <p className="text-sm text-white/40 mt-1">Click "Change" to pick a thumbnail for any project.</p>
      </div>
      <ThumbnailPicker firms={firms} />
    </div>
  )
}
