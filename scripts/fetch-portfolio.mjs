/**
 * Fetches all portfolio data from Cloudinary once and writes it to
 * data/portfolio-cache.json. Run before `next build` so build workers
 * read from the file instead of independently hitting the Cloudinary API.
 *
 * If the fetch fails (e.g. rate limit), the existing file is kept so the
 * build can still proceed with the last known good data.
 */

import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const CACHE_FILE = path.join(ROOT, 'data/portfolio-cache.json')

// Load .env.local when running locally
try {
  const { default: dotenv } = await import('dotenv')
  dotenv.config({ path: path.join(ROOT, '.env.local') })
} catch {}

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

function toSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')) } catch { return fallback }
}

async function fetchAll() {
  const hiddenCats = new Set(readJson(path.join(ROOT, 'data/hidden-categories.json'), []))
  const hiddenSlugs = new Set(readJson(path.join(ROOT, 'data/hidden.json'), []))
  const EXCLUDED = new Set(['logo'])

  const { folders: catFolders } = await cloudinary.api.sub_folders('apex')

  return Promise.all(
    catFolders
      .filter(cf => !EXCLUDED.has(toSlug(cf.name)) && !hiddenCats.has(toSlug(cf.name)))
      .map(async cf => {
        const { folders: firmFolders } = await cloudinary.api
          .sub_folders(cf.path).catch(() => ({ folders: [] }))

        const firms = await Promise.all(
          firmFolders
            .filter(ff => !hiddenSlugs.has(toSlug(ff.name)))
            .map(async ff => {
              const { folders: subfolders } = await cloudinary.api
                .sub_folders(ff.path).catch(() => ({ folders: [] }))

              const foldersToSearch = subfolders.length > 0 ? subfolders : [ff]

              const results = await Promise.all(
                foldersToSearch.map(sf =>
                  cloudinary.api
                    .resources_by_asset_folder(sf.path, { max_results: 500, tags: true })
                    .catch(() => ({ resources: [] }))
                )
              )

              const all = results.flatMap(r => r.resources)
              const isThumbnail = r => r.resource_type === 'image' && r.tags?.includes('thumbnail')
              const toRaw = r => ({
                publicId: r.public_id,
                resourceType: r.resource_type,
                format: r.format,
                createdAt: r.created_at,
                width: r.width ?? 1200,
                height: r.height ?? 800,
                tags: r.tags ?? [],
              })

              return {
                name: ff.name,
                slug: toSlug(ff.name),
                path: ff.path,
                category: cf.name,
                categorySlug: toSlug(cf.name),
                thumbnail: all.find(isThumbnail) ? toRaw(all.find(isThumbnail)) : undefined,
                images: all.filter(r => r.resource_type === 'image' && !isThumbnail(r)).map(toRaw),
                videos: all.filter(r => r.resource_type === 'video').map(toRaw),
              }
            })
        )

        return { name: cf.name, slug: toSlug(cf.name), path: cf.path, firms }
      })
  )
}

try {
  const data = await fetchAll()
  fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2))
  const firmCount = data.flatMap(c => c.firms).length
  console.log(`✓ Portfolio cache written: ${data.length} categories, ${firmCount} firms`)
} catch (err) {
  console.warn(`⚠ Could not fetch portfolio data: ${err.message}`)
  const existing = readJson(CACHE_FILE, null)
  if (existing) {
    console.log(`  Using existing cache (${existing.length} categories)`)
  } else {
    fs.writeFileSync(CACHE_FILE, '[]')
    console.warn('  No existing cache — portfolio will be empty until data is fetched')
  }
}
