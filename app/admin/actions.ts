'use server'

import fs from 'fs'
import path from 'path'
import { revalidatePath } from 'next/cache'

const FILE = path.join(process.cwd(), 'data/thumbnails.json')

export async function setThumbnail(firmSlug: string, publicId: string) {
  const current = JSON.parse(fs.readFileSync(FILE, 'utf-8'))
  current[firmSlug] = publicId
  fs.writeFileSync(FILE, JSON.stringify(current, null, 2))
  revalidatePath('/portfolio')
}

export async function clearThumbnail(firmSlug: string) {
  const current = JSON.parse(fs.readFileSync(FILE, 'utf-8'))
  delete current[firmSlug]
  fs.writeFileSync(FILE, JSON.stringify(current, null, 2))
  revalidatePath('/portfolio')
}
