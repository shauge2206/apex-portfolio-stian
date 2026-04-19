'use client'

import { useState, useTransition } from 'react'
import { setCategoryThumbnail, clearCategoryThumbnail } from './actions'
import ThumbnailCropEditor from './ThumbnailCropEditor'
import VideoFramePicker from './VideoFramePicker'

interface FocalPoint { x: number; y: number }

interface MediaItem {
  publicId: string
  url: string
  type: 'image' | 'video'
  width?: number
  height?: number
}

interface CategoryItem {
  slug: string
  name: string
  currentThumbnailId: string | null
  currentOffset?: number
  currentFocalPoint?: FocalPoint
  thumbnailUrl: string | null
  images: MediaItem[]
  videos: MediaItem[]
}

type Mode =
  | { type: 'grid' }
  | { type: 'crop'; item: MediaItem }
  | { type: 'video'; publicId: string; offset: number }


export default function CategoryThumbnailPicker({ categories, cloudName }: { categories: CategoryItem[]; cloudName: string }) {
  const [open, setOpen] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>({ type: 'grid' })
  const [pending, startTransition] = useTransition()

  const activeCat = categories.find((c) => c.slug === open)
  const allMedia = activeCat ? [...activeCat.images, ...activeCat.videos] : []

  const closeModal = () => {
    setOpen(null)
    setMode({ type: 'grid' })
  }

  const handleItemClick = (item: MediaItem) => {
    if (item.type === 'video') {
      setMode({ type: 'video', publicId: item.publicId, offset: activeCat?.currentOffset ?? 0 })
    } else {
      setMode({ type: 'crop', item })
    }
  }

  const confirmCrop = (categorySlug: string, publicId: string, focalPoint: FocalPoint | null) => {
    startTransition(async () => {
      await setCategoryThumbnail(categorySlug, publicId, undefined, focalPoint)
      closeModal()
    })
  }

  const confirmVideo = (categorySlug: string, publicId: string, offset: number) => {
    startTransition(async () => {
      await setCategoryThumbnail(categorySlug, publicId, offset)
      closeModal()
    })
  }

  const reset = (categorySlug: string) => {
    startTransition(async () => { await clearCategoryThumbnail(categorySlug) })
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat) => {
          const hasMedia = cat.images.length > 0 || cat.videos.length > 0
          return (
            <div key={cat.slug} className="bg-[#111] rounded overflow-hidden">
              <div className="relative aspect-[4/3] bg-[#1a1a1a]">
                {cat.thumbnailUrl && (
                  <img src={cat.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-white truncate mb-2">{cat.name}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setOpen(cat.slug); setMode({ type: 'grid' }) }}
                    disabled={!hasMedia}
                    className="flex-1 text-xs bg-white/10 hover:bg-white/20 text-white py-1.5 rounded transition-colors disabled:opacity-30"
                  >
                    {hasMedia ? 'Change' : 'No media'}
                  </button>
                  {cat.currentThumbnailId && (
                    <button
                      onClick={() => reset(cat.slug)}
                      className="text-xs text-white/40 hover:text-white px-2 transition-colors"
                      title="Reset to default"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {open && activeCat && (
        <div className="fixed inset-0 z-50 bg-black/90 overflow-y-auto" onClick={closeModal}>
          <div className="min-h-full flex items-start justify-center p-4 py-8">
            <div className="bg-[#111] rounded-lg max-w-4xl w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-medium">{activeCat.name} — velg kategorithumbnail</h2>
                <button onClick={closeModal} className="text-white/40 hover:text-white text-xl leading-none">×</button>
              </div>

              {mode.type === 'crop' && (
                <ThumbnailCropEditor
                  publicId={mode.item.publicId}
                  imageWidth={mode.item.width ?? 1200}
                  imageHeight={mode.item.height ?? 800}
                  cloudName={cloudName}
                  initialFocalPoint={
                    mode.item.publicId === activeCat.currentThumbnailId
                      ? activeCat.currentFocalPoint
                      : undefined
                  }
                  onConfirm={(fp) => confirmCrop(activeCat.slug, mode.item.publicId, fp)}
                  onBack={() => setMode({ type: 'grid' })}
                />
              )}

              {mode.type === 'video' && (
                <VideoFramePicker
                  publicId={mode.publicId}
                  cloudName={cloudName}
                  initialOffset={mode.offset}
                  onConfirm={(offset) => confirmVideo(activeCat.slug, mode.publicId, offset)}
                  onBack={() => setMode({ type: 'grid' })}
                />
              )}

              {mode.type === 'grid' && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {allMedia.map((item) => (
                    <button
                      key={item.publicId}
                      onClick={() => handleItemClick(item)}
                      disabled={pending}
                      className={`relative overflow-hidden rounded transition-opacity ${
                        item.publicId === activeCat.currentThumbnailId ? 'ring-2 ring-white' : 'hover:opacity-80'
                      }`}
                    >
                      <img src={item.url} className="w-full h-auto block" alt="" />
                      {item.type === 'video' ? (
                        <>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                          <div className="absolute bottom-1 right-1 text-[9px] text-white/70 bg-black/50 px-1 rounded">
                            Velg sekund
                          </div>
                        </>
                      ) : (
                        <div className="absolute bottom-1 right-1 text-[9px] text-white/70 bg-black/50 px-1 rounded">
                          Velg utsnitt
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
