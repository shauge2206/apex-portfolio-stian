'use server'

import fs from 'fs'
import path from 'path'
import { revalidatePath } from 'next/cache'

const FILE = path.join(process.cwd(), 'data/thumbnails.json')
const OFFSETS_FILE = path.join(process.cwd(), 'data/thumbnail-offsets.json')
const FOCAL_FILE = path.join(process.cwd(), 'data/thumbnail-focal-points.json')
const HIDDEN_FILE = path.join(process.cwd(), 'data/hidden.json')
const ORDER_FILE = path.join(process.cwd(), 'data/order.json')
const CAT_ORDER_FILE = path.join(process.cwd(), 'data/category-order.json')
const HIDDEN_CATS_FILE = path.join(process.cwd(), 'data/hidden-categories.json')
const CAT_THUMB_FILE = path.join(process.cwd(), 'data/category-thumbnails.json')
const CAT_OFFSETS_FILE = path.join(process.cwd(), 'data/category-thumbnail-offsets.json')
const CAT_FOCAL_FILE = path.join(process.cwd(), 'data/category-thumbnail-focal-points.json')

type FocalPoint = { x: number; y: number }

function readJson<T>(file: string, fallback: T): T {
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')) } catch { return fallback }
}

// Publishes all pending changes to the live portfolio (busts the page cache).
// Call this explicitly rather than after every individual change.
export async function publishChanges() {
  revalidatePath('/portfolio')
}

export async function setThumbnail(
  firmSlug: string,
  publicId: string,
  offset?: number,
  focalPoint?: FocalPoint | null,
) {
  const thumbs = readJson<Record<string, string>>(FILE, {})
  thumbs[firmSlug] = publicId
  fs.writeFileSync(FILE, JSON.stringify(thumbs, null, 2))

  const offsets = readJson<Record<string, number>>(OFFSETS_FILE, {})
  if (offset !== undefined && offset > 0) { offsets[firmSlug] = offset } else { delete offsets[firmSlug] }
  fs.writeFileSync(OFFSETS_FILE, JSON.stringify(offsets, null, 2))

  const focals = readJson<Record<string, FocalPoint>>(FOCAL_FILE, {})
  if (focalPoint) { focals[firmSlug] = focalPoint } else { delete focals[firmSlug] }
  fs.writeFileSync(FOCAL_FILE, JSON.stringify(focals, null, 2))
}

export async function clearThumbnail(firmSlug: string) {
  const thumbs = readJson<Record<string, string>>(FILE, {})
  delete thumbs[firmSlug]
  fs.writeFileSync(FILE, JSON.stringify(thumbs, null, 2))

  const offsets = readJson<Record<string, number>>(OFFSETS_FILE, {})
  delete offsets[firmSlug]
  fs.writeFileSync(OFFSETS_FILE, JSON.stringify(offsets, null, 2))

  const focals = readJson<Record<string, FocalPoint>>(FOCAL_FILE, {})
  delete focals[firmSlug]
  fs.writeFileSync(FOCAL_FILE, JSON.stringify(focals, null, 2))
}

export async function toggleHidden(firmSlug: string) {
  let hidden: string[] = []
  try { hidden = JSON.parse(fs.readFileSync(HIDDEN_FILE, 'utf-8')) } catch {}
  if (hidden.includes(firmSlug)) {
    hidden = hidden.filter((s) => s !== firmSlug)
  } else {
    hidden.push(firmSlug)
  }
  fs.writeFileSync(HIDDEN_FILE, JSON.stringify(hidden, null, 2))
}

export async function saveOrder(categorySlug: string, orderedSlugs: string[]) {
  let order: Record<string, string[]> = {}
  try { order = JSON.parse(fs.readFileSync(ORDER_FILE, 'utf-8')) } catch {}
  order[categorySlug] = orderedSlugs
  fs.writeFileSync(ORDER_FILE, JSON.stringify(order, null, 2))
}

export async function toggleCategoryHidden(categorySlug: string) {
  let hidden: string[] = readJson<string[]>(HIDDEN_CATS_FILE, [])
  if (hidden.includes(categorySlug)) {
    hidden = hidden.filter((s) => s !== categorySlug)
  } else {
    hidden.push(categorySlug)
  }
  fs.writeFileSync(HIDDEN_CATS_FILE, JSON.stringify(hidden, null, 2))
}

export async function saveCategoryOrder(orderedSlugs: string[]) {
  fs.writeFileSync(CAT_ORDER_FILE, JSON.stringify(orderedSlugs, null, 2))
}

export async function setCategoryThumbnail(
  categorySlug: string,
  publicId: string,
  offset?: number,
  focalPoint?: FocalPoint | null,
) {
  const thumbs = readJson<Record<string, string>>(CAT_THUMB_FILE, {})
  thumbs[categorySlug] = publicId
  fs.writeFileSync(CAT_THUMB_FILE, JSON.stringify(thumbs, null, 2))

  const offsets = readJson<Record<string, number>>(CAT_OFFSETS_FILE, {})
  if (offset !== undefined && offset > 0) { offsets[categorySlug] = offset } else { delete offsets[categorySlug] }
  fs.writeFileSync(CAT_OFFSETS_FILE, JSON.stringify(offsets, null, 2))

  const focals = readJson<Record<string, FocalPoint>>(CAT_FOCAL_FILE, {})
  if (focalPoint) { focals[categorySlug] = focalPoint } else { delete focals[categorySlug] }
  fs.writeFileSync(CAT_FOCAL_FILE, JSON.stringify(focals, null, 2))
}

export async function clearCategoryThumbnail(categorySlug: string) {
  const thumbs = readJson<Record<string, string>>(CAT_THUMB_FILE, {})
  delete thumbs[categorySlug]
  fs.writeFileSync(CAT_THUMB_FILE, JSON.stringify(thumbs, null, 2))

  const offsets = readJson<Record<string, number>>(CAT_OFFSETS_FILE, {})
  delete offsets[categorySlug]
  fs.writeFileSync(CAT_OFFSETS_FILE, JSON.stringify(offsets, null, 2))

  const focals = readJson<Record<string, FocalPoint>>(CAT_FOCAL_FILE, {})
  delete focals[categorySlug]
  fs.writeFileSync(CAT_FOCAL_FILE, JSON.stringify(focals, null, 2))
}
