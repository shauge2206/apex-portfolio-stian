import { v2 as cloudinary } from 'cloudinary'
import { unstable_cache } from 'next/cache'
import { MediaItem } from '@/types'
import fs from 'fs'
import path from 'path'

function getThumbnailOverrides(): Record<string, string> {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/thumbnails.json'), 'utf-8'))
  } catch {
    return {}
  }
}

function getThumbnailOffsets(): Record<string, number> {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/thumbnail-offsets.json'), 'utf-8'))
  } catch {
    return {}
  }
}

function getThumbnailFocalPoints(): Record<string, { x: number; y: number }> {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/thumbnail-focal-points.json'), 'utf-8'))
  } catch {
    return {}
  }
}

function getHiddenSlugs(): Set<string> {
  try {
    const arr = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/hidden.json'), 'utf-8'))
    return new Set(arr)
  } catch {
    return new Set()
  }
}

function getHiddenCategorySlugs(): Set<string> {
  try {
    const arr = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/hidden-categories.json'), 'utf-8'))
    return new Set(arr)
  } catch {
    return new Set()
  }
}

function getOrderMap(): Record<string, string[]> {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/order.json'), 'utf-8'))
  } catch {
    return {}
  }
}

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// ─── URL helpers (local computation, no API calls) ────────────────────────────

function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}

function imgUrl(publicId: string, transforms: Record<string, unknown> = {}): string {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [{ quality: 'auto', fetch_format: 'auto', ...transforms }],
  })
}

function videoUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    secure: true,
    resource_type: 'video',
    transformation: [{ quality: 'auto' }],
  })
}

function videoThumbUrl(publicId: string, startOffset = 0): string {
  return cloudinary.url(publicId, {
    secure: true,
    resource_type: 'video',
    transformation: [{ width: 800, crop: 'limit', quality: 'auto', fetch_format: 'jpg', start_offset: startOffset }],
  })
}

// Firms that get a double-width tile on the portfolio page
const WIDE_FIRM_SLUGS = new Set(['wasco', 'egon', 'kys'])

// Per-firm video thumbnail offsets (seconds from start)
const FIRM_VIDEO_OFFSET: Record<string, number> = {
  'bpc-fest': 6,
  kys: 3,
  leela: 6,
  'asian-fusion': 6,
  porto13: 6,
  bilia: 3,
}

// Firms that should use a video frame as thumbnail even when images exist
const VIDEO_THUMBNAIL_FIRMS = new Set(['bilia'])

// ─── Raw resource types stored in cache ───────────────────────────────────────

interface RawResource {
  publicId: string
  resourceType: 'image' | 'video'
  format: string
  createdAt: string
  width: number
  height: number
  tags: string[]
}

interface CachedFirm {
  name: string
  slug: string
  path: string
  category: string
  categorySlug: string
  thumbnail?: RawResource  // file named "thumbnail" in the folder
  images: RawResource[]
  videos: RawResource[]
}

interface CachedCategory {
  name: string
  slug: string
  path: string
  firms: CachedFirm[]
}

// ─── Core Cloudinary fetcher — called only once per cache period ───────────────

async function fetchAllPortfolioData(): Promise<CachedCategory[]> {
  const { folders: categoryFolders } = await cloudinary.api.sub_folders('apex')

  const EXCLUDED_FOLDERS = new Set(['logo'])
  const hiddenCats = getHiddenCategorySlugs()

  return Promise.all(
    categoryFolders
      .filter((cf: { name: string }) => !EXCLUDED_FOLDERS.has(toSlug(cf.name)) && !hiddenCats.has(toSlug(cf.name)))
      .map(async (cf: { name: string; path: string }) => {
      const { folders: firmFolders } = await cloudinary.api
        .sub_folders(cf.path)
        .catch(() => ({ folders: [] }))

      const firms: CachedFirm[] = await Promise.all(
        firmFolders
          .filter((ff: { name: string }) => !getHiddenSlugs().has(toSlug(ff.name)))
          .map(async (ff: { name: string; path: string }) => {
          // Each firm has subfolders (e.g. "bilder", "video").
          // resources_by_asset_folder does NOT support resource_type filter —
          // it returns all types, so we filter client-side.
          const { folders: subfolders } = await cloudinary.api
            .sub_folders(ff.path)
            .catch(() => ({ folders: [] }))

          const foldersToSearch: { path: string }[] =
            subfolders.length > 0 ? subfolders : [ff]

          const results = await Promise.all(
            foldersToSearch.map((sf) =>
              cloudinary.api
                .resources_by_asset_folder(sf.path, { max_results: 500, tags: true })
                .catch(() => ({ resources: [] }))
            )
          )

          const all: any[] = results.flatMap((r: { resources: any[] }) => r.resources)

          const toRaw = (r: any): RawResource => ({
            publicId: r.public_id,
            resourceType: r.resource_type as 'image' | 'video',
            format: r.format,
            createdAt: r.created_at,
            width: r.width ?? 1200,
            height: r.height ?? 800,
            tags: r.tags ?? [],
          })

          const isThumbnail = (r: any) =>
            r.resource_type === 'image' && r.tags?.includes('thumbnail')

          const thumbnailRaw = all.find(isThumbnail)

          return {
            name: ff.name,
            slug: toSlug(ff.name),
            path: ff.path,
            category: cf.name,
            categorySlug: toSlug(cf.name),
            thumbnail: thumbnailRaw ? toRaw(thumbnailRaw) : undefined,
            images: all.filter((r) => r.resource_type === 'image' && !isThumbnail(r)).map(toRaw),
            videos: all.filter((r) => r.resource_type === 'video').map(toRaw),
          }
        })
      )

      return {
        name: cf.name,
        slug: toSlug(cf.name),
        path: cf.path,
        firms,
      }
    })
  )
}

// Read from file cache generated by scripts/fetch-portfolio.mjs at build time.
// Falls back to live Cloudinary fetch only if the file is missing (e.g. local dev).
function readPortfolioCacheFile(): CachedCategory[] | null {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), 'data/portfolio-cache.json'), 'utf-8')
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch {}
  return null
}

export async function getPortfolioCache(): Promise<CachedCategory[]> {
  const cached = readPortfolioCacheFile()
  if (cached) return cached
  return fetchAllPortfolioData()
}

export { imgUrl, videoThumbUrl }

export const getLogoUrl = unstable_cache(
  async (): Promise<string | null> => {
    try {
      const { resources } = await cloudinary.api.resources_by_asset_folder('apex/Logo', { max_results: 1 })
      if (resources[0]) return imgUrl(resources[0].public_id, { width: 300 })
    } catch {}
    return null
  },
  ['logo-url'],
  { revalidate: 86400 }
)

// ─── Portfolio page ───────────────────────────────────────────────────────────

export async function getPortfolioWithThumbnails() {
  const categories = await getPortfolioCache()

  return categories.map((cat) => {
    // Find the first image from any firm in the category
    const firstImage = cat.firms.flatMap((f) => f.images)[0]
    // Fall back to first video thumbnail if no images exist
    const firstVideo = cat.firms.flatMap((f) => f.videos)[0]

    const thumbnailUrl = firstImage
      ? imgUrl(firstImage.publicId, { width: 800, height: 600, crop: 'fill' })
      : firstVideo
      ? videoThumbUrl(firstVideo.publicId)
      : undefined

    return {
      name: cat.name,
      slug: cat.slug,
      firmCount: cat.firms.length,
      thumbnailUrl,
    }
  })
}

// ─── Category page ────────────────────────────────────────────────────────────

export async function getCategoryPage(categorySlug: string) {
  const categories = await getPortfolioCache()
  const category = categories.find((c) => c.slug === categorySlug)
  if (!category) return null

  return {
    category: { name: category.name, slug: category.slug },
    firms: category.firms.map((firm) => ({
      name: firm.name,
      slug: firm.slug,
      category: firm.category,
      categorySlug: firm.categorySlug,
      imageCount: firm.images.length,
      videoCount: firm.videos.length,
      // Use images for preview; fall back to video thumbnails
      previewUrls: firm.images.length > 0
        ? firm.images.slice(0, 3).map((r) => imgUrl(r.publicId, { width: 400, height: 400, crop: 'fill' }))
        : firm.videos.slice(0, 3).map((r) => videoThumbUrl(r.publicId)),
    })),
  }
}

// ─── Firm page ────────────────────────────────────────────────────────────────

export async function getFirmMedia(categorySlug: string, firmSlug: string) {
  const categories = await getPortfolioCache()
  const category = categories.find((c) => c.slug === categorySlug)
  if (!category) return null

  const firm = category.firms.find((f) => f.slug === firmSlug)
  if (!firm) return null

  const byDate = (a: RawResource, b: RawResource) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

  const toMediaItem = (r: RawResource, isVideo = false): MediaItem => ({
    publicId: r.publicId,
    url: isVideo ? videoUrl(r.publicId) : imgUrl(r.publicId, { width: 2400, crop: 'limit' }),
    thumbnailUrl: isVideo
      ? videoThumbUrl(r.publicId)
      : imgUrl(r.publicId, { width: 500, crop: 'limit' }),
    resourceType: isVideo ? 'video' : 'image',
    format: r.format,
    createdAt: r.createdAt,
    width: r.width,
    height: r.height,
  })

  return {
    categoryName: category.name,
    firmName: firm.name,
    images: [...firm.images].sort(byDate).map((r) => toMediaItem(r, false)),
    videos: [...firm.videos].sort(byDate).map((r) => toMediaItem(r, true)),
  }
}

// ─── Flat project list (all firms across all categories) ──────────────────────

export async function getAllProjects() {
  const categories = await getPortfolioCache()

  const orderMap = getOrderMap()
  const hiddenSlugs = getHiddenSlugs()
  const thumbOffsets = getThumbnailOffsets()
  const thumbFocalPoints = getThumbnailFocalPoints()

  return categories.flatMap((cat) => {
    const ordered = orderMap[cat.slug]
    const firms = ordered
      ? [...cat.firms].sort((a, b) => {
          const ai = ordered.indexOf(a.slug)
          const bi = ordered.indexOf(b.slug)
          if (ai === -1 && bi === -1) return 0
          if (ai === -1) return 1
          if (bi === -1) return -1
          return ai - bi
        })
      : cat.firms

    return firms
      .filter((firm) => !hiddenSlugs.has(firm.slug))
      .map((firm) => {
        const firstImage = firm.images[0]
        const firstVideo = firm.videos[0]

        let thumbnailUrl: string | undefined
        let thumbnailWidth = 800
        let thumbnailHeight = 600

        const overrideId = getThumbnailOverrides()[firm.slug]
        const overrideImage = overrideId ? firm.images.find((r) => r.publicId === overrideId) : null
        const overrideVideo = overrideId ? firm.videos.find((r) => r.publicId === overrideId) : null

        if (overrideImage) {
          const fp = thumbFocalPoints[firm.slug]
          thumbnailUrl = fp
            ? imgUrl(overrideImage.publicId, {
                width: 800, height: 600, crop: 'fill',
                gravity: 'xy_center',
                x: Math.round(fp.x * overrideImage.width),
                y: Math.round(fp.y * overrideImage.height),
              })
            : imgUrl(overrideImage.publicId, { width: 800, crop: 'limit' })
          thumbnailWidth = overrideImage.width
          thumbnailHeight = overrideImage.height
        } else if (overrideVideo) {
          const offset = thumbOffsets[firm.slug] ?? 0
          thumbnailUrl = videoThumbUrl(overrideVideo.publicId, offset)
          thumbnailWidth = overrideVideo.width
          thumbnailHeight = overrideVideo.height
        } else if (firm.thumbnail) {
          thumbnailUrl = imgUrl(firm.thumbnail.publicId, { width: 800, crop: 'limit' })
          thumbnailWidth = firm.thumbnail.width
          thumbnailHeight = firm.thumbnail.height
        } else if (firstVideo && VIDEO_THUMBNAIL_FIRMS.has(firm.slug)) {
          const offset = FIRM_VIDEO_OFFSET[firm.slug] ?? 0
          thumbnailUrl = videoThumbUrl(firstVideo.publicId, offset)
          thumbnailWidth = firstVideo.width
          thumbnailHeight = firstVideo.height
        } else if (firstImage) {
          thumbnailUrl = imgUrl(firstImage.publicId, { width: 800, crop: 'limit' })
          thumbnailWidth = firstImage.width
          thumbnailHeight = firstImage.height
        } else if (firstVideo) {
          const offset = FIRM_VIDEO_OFFSET[firm.slug] ?? 0
          thumbnailUrl = videoThumbUrl(firstVideo.publicId, offset)
          thumbnailWidth = firstVideo.width
          thumbnailHeight = firstVideo.height
        }

        return {
          name: firm.name,
          slug: firm.slug,
          category: firm.category,
          categorySlug: firm.categorySlug,
          imageCount: firm.images.length,
          videoCount: firm.videos.length,
          thumbnailUrl,
          thumbnailWidth,
          thumbnailHeight,
          wide: WIDE_FIRM_SLUGS.has(firm.slug),
        }
      })
  })
}

// ─── All slugs for generateStaticParams ───────────────────────────────────────

export async function getAllFirmSlugs() {
  const categories = await getPortfolioCache()
  return categories.flatMap((cat) =>
    cat.firms.map((firm) => ({ category: cat.slug, firm: firm.slug }))
  )
}

// ─── Test page / legacy ───────────────────────────────────────────────────────

export async function getPortfolioStructure() {
  const categories = await getPortfolioCache()
  return categories.map((cat) => ({
    name: cat.name,
    slug: cat.slug,
    path: cat.path,
    firms: cat.firms.map((f) => ({
      name: f.name,
      slug: f.slug,
      path: f.path,
      category: f.category,
      categorySlug: f.categorySlug,
      imageCount: f.images.length,
      videoCount: f.videos.length,
    })),
  }))
}
