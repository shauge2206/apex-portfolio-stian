import fs from 'fs'
import path from 'path'
import { getAllProjects, imgUrl, videoThumbUrl, getPortfolioCache } from '@/lib/cloudinary'
import PortfolioGrid from '@/components/PortfolioGrid'

export const revalidate = 3600

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

export default async function PortfolioPage() {
  const [projects, rawCategories] = await Promise.all([getAllProjects(), getPortfolioCache()])

  // Group by category, preserving order
  const categories: {
    name: string
    slug: string
    thumbnailUrl?: string
    projects: typeof projects
  }[] = []

  for (const project of projects) {
    let cat = categories.find((c) => c.slug === project.categorySlug)
    if (!cat) {
      cat = { name: project.category, slug: project.categorySlug, projects: [] }
      categories.push(cat)
    }
    cat.projects.push(project)
  }

  // Apply category ordering
  const catOrder = getCategoryOrder()
  if (catOrder.length > 0) {
    categories.sort((a, b) => {
      const ai = catOrder.indexOf(a.slug)
      const bi = catOrder.indexOf(b.slug)
      if (ai === -1 && bi === -1) return 0
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })
  }

  // Apply category thumbnail overrides
  const catThumbs = getCategoryThumbnails()
  const catThumbOffsets = getCategoryThumbnailOffsets()
  const catFocalPoints = getCategoryThumbnailFocalPoints()
  for (const cat of categories) {
    const publicId = catThumbs[cat.slug]
    if (!publicId) continue
    const offset = catThumbOffsets[cat.slug]
    const fp = catFocalPoints[cat.slug]
    if (offset !== undefined) {
      cat.thumbnailUrl = videoThumbUrl(publicId, offset)
    } else if (fp) {
      const rawCat = rawCategories.find((c) => c.slug === cat.slug)
      const img = rawCat?.firms.flatMap((f) => f.images).find((r) => r.publicId === publicId)
      cat.thumbnailUrl = img
        ? imgUrl(publicId, {
            width: 800, height: 600, crop: 'fill',
            gravity: 'xy_center',
            x: Math.round(fp.x * img.width),
            y: Math.round(fp.y * img.height),
          })
        : imgUrl(publicId, { width: 800, height: 600, crop: 'fill' })
    } else {
      cat.thumbnailUrl = imgUrl(publicId, { width: 800, height: 600, crop: 'fill' })
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <PortfolioGrid categories={categories} />
    </div>
  )
}
