import fs from 'fs'
import path from 'path'
import { getPortfolioCache, imgUrl, videoThumbUrl } from '@/lib/cloudinary'
import ThumbnailPicker from './ThumbnailPicker'
import CategoryThumbnailPicker from './CategoryThumbnailPicker'
import ProjectManager from './ProjectManager'
import PublishBar from './PublishBar'

function getHiddenSet(): Set<string> {
  try {
    return new Set(JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/hidden.json'), 'utf-8')))
  } catch { return new Set() }
}

function getHiddenCategorySet(): Set<string> {
  try {
    return new Set(JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/hidden-categories.json'), 'utf-8')))
  } catch { return new Set() }
}

function getOrderMap(): Record<string, string[]> {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/order.json'), 'utf-8'))
  } catch { return {} }
}

function getCategoryOrder(): string[] {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/category-order.json'), 'utf-8'))
  } catch { return [] }
}

function getCategoryThumbnails(): Record<string, string> {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/category-thumbnails.json'), 'utf-8'))
  } catch { return {} }
}

function getThumbnailOffsets(): Record<string, number> {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/thumbnail-offsets.json'), 'utf-8'))
  } catch { return {} }
}

function getThumbnailFocalPoints(): Record<string, { x: number; y: number }> {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/thumbnail-focal-points.json'), 'utf-8'))
  } catch { return {} }
}

function getCategoryThumbnailOffsets(): Record<string, number> {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/category-thumbnail-offsets.json'), 'utf-8'))
  } catch { return {} }
}

function getCategoryThumbnailFocalPoints(): Record<string, { x: number; y: number }> {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/category-thumbnail-focal-points.json'), 'utf-8'))
  } catch { return {} }
}

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

  const thumbOffsets = getThumbnailOffsets()
  const thumbFocalPoints = getThumbnailFocalPoints()
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ''

  let firms
  try {
    firms = categories.flatMap((cat) =>
      cat.firms.map((firm) => {
        const overrideId = overrides[firm.slug]
        const overrideImg = overrideId ? firm.images.find((r) => r.publicId === overrideId) : null
        const overrideVid = overrideId ? firm.videos.find((r) => r.publicId === overrideId) : null
        const fallback = firm.thumbnail ?? firm.images[0] ?? null
        const currentOffset = overrideId ? thumbOffsets[firm.slug] : undefined

        const currentThumbUrl = overrideImg
          ? imgUrl(overrideImg.publicId, { width: 400, height: 300, crop: 'fill' })
          : overrideVid
          ? videoThumbUrl(overrideVid.publicId, currentOffset ?? 0)
          : fallback
          ? imgUrl(fallback.publicId, { width: 400, height: 300, crop: 'fill' })
          : firm.videos[0]
          ? videoThumbUrl(firm.videos[0].publicId)
          : null

        return {
          name: firm.name,
          slug: firm.slug,
          currentThumbnailId: overrideId ?? null,
          currentOffset,
          currentFocalPoint: overrideId ? thumbFocalPoints[firm.slug] : undefined,
          thumbnailUrl: currentThumbUrl,
          images: firm.images.map((r) => ({
            publicId: r.publicId,
            url: imgUrl(r.publicId, { width: 400, crop: 'limit' }),
            type: 'image' as const,
            width: r.width,
            height: r.height,
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

  // Build ProjectManager data: all firms (including hidden), sorted per category
  const hiddenSet = getHiddenSet()
  const hiddenCatSet = getHiddenCategorySet()
  const orderMap = getOrderMap()
  const catOrder = getCategoryOrder()

  const sortedCategories = catOrder.length > 0
    ? [...categories].sort((a, b) => {
        const ai = catOrder.indexOf(a.slug)
        const bi = catOrder.indexOf(b.slug)
        if (ai === -1 && bi === -1) return 0
        if (ai === -1) return 1
        if (bi === -1) return -1
        return ai - bi
      })
    : categories

  // Build CategoryThumbnailPicker data
  const catThumbs = getCategoryThumbnails()
  const catThumbOffsets = getCategoryThumbnailOffsets()
  const catFocalPoints = getCategoryThumbnailFocalPoints()
  const catPickerData = sortedCategories.map((cat) => {
    const allImages = cat.firms.flatMap((f) => f.images)
    const allVideos = cat.firms.flatMap((f) => f.videos)
    const currentId = catThumbs[cat.slug] ?? null
    const currentOffset = currentId ? catThumbOffsets[cat.slug] : undefined
    const currentImg = currentId ? allImages.find((r) => r.publicId === currentId) : null
    const currentVid = currentId ? allVideos.find((r) => r.publicId === currentId) : null
    const fallbackImg = allImages[0] ?? null
    return {
      slug: cat.slug,
      name: cat.name,
      currentThumbnailId: currentId,
      currentOffset,
      currentFocalPoint: currentId ? catFocalPoints[cat.slug] : undefined,
      thumbnailUrl: currentImg
        ? imgUrl(currentImg.publicId, { width: 400, height: 300, crop: 'fill' })
        : currentVid
        ? videoThumbUrl(currentVid.publicId, currentOffset ?? 0)
        : fallbackImg
        ? imgUrl(fallbackImg.publicId, { width: 400, height: 300, crop: 'fill' })
        : null,
      images: allImages.map((r) => ({
        publicId: r.publicId,
        url: imgUrl(r.publicId, { width: 400, crop: 'limit' }),
        type: 'image' as const,
        width: r.width,
        height: r.height,
      })),
      videos: allVideos.map((r) => ({
        publicId: r.publicId,
        url: videoThumbUrl(r.publicId),
        type: 'video' as const,
      })),
    }
  })

  const pmCategories = sortedCategories.map((cat) => {
    const ordered = orderMap[cat.slug]
    const sortedFirms = ordered
      ? [...cat.firms].sort((a, b) => {
          const ai = ordered.indexOf(a.slug)
          const bi = ordered.indexOf(b.slug)
          if (ai === -1 && bi === -1) return 0
          if (ai === -1) return 1
          if (bi === -1) return -1
          return ai - bi
        })
      : cat.firms

    return {
      slug: cat.slug,
      name: cat.name,
      hidden: hiddenCatSet.has(cat.slug),
      projects: sortedFirms.map((firm) => {
        const overrideId = overrides[firm.slug]
        const overrideImg = overrideId ? firm.images.find((r) => r.publicId === overrideId) : null
        const overrideVid = overrideId ? firm.videos.find((r) => r.publicId === overrideId) : null
        const fallback = firm.thumbnail ?? firm.images[0] ?? null

        const thumbnailUrl = overrideImg
          ? imgUrl(overrideImg.publicId, { width: 400, height: 300, crop: 'fill' })
          : overrideVid
          ? videoThumbUrl(overrideVid.publicId)
          : fallback
          ? imgUrl(fallback.publicId, { width: 400, height: 300, crop: 'fill' })
          : firm.videos[0]
          ? videoThumbUrl(firm.videos[0].publicId)
          : undefined

        return {
          slug: firm.slug,
          name: firm.name,
          categorySlug: cat.slug,
          categoryName: cat.name,
          thumbnailUrl: thumbnailUrl ?? undefined,
          hidden: hiddenSet.has(firm.slug),
        }
      }),
    }
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PublishBar />
      <div className="mb-8">
        <h1 className="text-xl font-medium text-white">Kategorithumbnails</h1>
        <p className="text-sm text-white/40 mt-1">Velg forsidebilde for hver kategori.</p>
      </div>
      <CategoryThumbnailPicker categories={catPickerData} cloudName={cloudName} />

      <hr className="my-12" style={{ borderColor: 'var(--t-border)' }} />

      <div className="mb-8">
        <h1 className="text-xl font-medium text-white">Prosjektthumbnails</h1>
        <p className="text-sm text-white/40 mt-1">Velg forsidebilde for hvert prosjekt.</p>
      </div>
      <ThumbnailPicker firms={firms} cloudName={cloudName} />

      <hr className="my-12" style={{ borderColor: 'var(--t-border)' }} />

      <div className="mb-8">
        <h1 className="text-xl font-medium text-white">Prosjekter</h1>
        <p className="text-sm text-white/40 mt-1">Dra for å endre rekkefølge. Skjul eller vis prosjekter.</p>
      </div>
      <ProjectManager categories={pmCategories} />
    </div>
  )
}
