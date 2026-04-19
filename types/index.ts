export interface MediaItem {
  publicId: string
  url: string
  thumbnailUrl: string
  resourceType: 'image' | 'video'
  format: string
  createdAt: string
  width: number
  height: number
}

export interface Firm {
  name: string
  slug: string
  path: string
  category: string
  categorySlug: string
  videoCount: number
  imageCount: number
}

export interface Category {
  name: string
  slug: string
  path: string
  firms: Firm[]
}
