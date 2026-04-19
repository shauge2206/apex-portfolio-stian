'use client'

import { useState, useTransition } from 'react'
import { setThumbnail, clearThumbnail } from './actions'

interface MediaItem {
  publicId: string
  url: string
  type: 'image' | 'video'
}

interface Firm {
  name: string
  slug: string
  currentThumbnailId: string | null
  thumbnailUrl: string | null
  images: MediaItem[]
  videos: MediaItem[]
}

export default function ThumbnailPicker({ firms }: { firms: Firm[] }) {
  const [open, setOpen] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const activeFirm = firms.find((f) => f.slug === open)
  const allMedia = activeFirm ? [...activeFirm.images, ...activeFirm.videos] : []

  const select = (firmSlug: string, publicId: string) => {
    startTransition(async () => {
      await setThumbnail(firmSlug, publicId)
      setOpen(null)
    })
  }

  const reset = (firmSlug: string) => {
    startTransition(async () => {
      await clearThumbnail(firmSlug)
    })
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {firms.map((firm) => {
          const hasMedia = firm.images.length > 0 || firm.videos.length > 0
          return (
            <div key={firm.slug} className="bg-[#111] rounded overflow-hidden">
              <div className="relative aspect-[4/3] bg-[#1a1a1a]">
                {firm.thumbnailUrl && (
                  <img src={firm.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-white truncate mb-2">{firm.name}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOpen(firm.slug)}
                    disabled={!hasMedia}
                    className="flex-1 text-xs bg-white/10 hover:bg-white/20 text-white py-1.5 rounded transition-colors disabled:opacity-30"
                  >
                    {hasMedia ? 'Change' : 'No media'}
                  </button>
                  {firm.currentThumbnailId && (
                    <button
                      onClick={() => reset(firm.slug)}
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

      {/* Picker modal */}
      {open && activeFirm && (
        <div
          className="fixed inset-0 z-50 bg-black/90 overflow-y-auto"
          onClick={() => setOpen(null)}
        >
          <div className="min-h-full flex items-start justify-center p-4 py-8">
            <div
              className="bg-[#111] rounded-lg max-w-4xl w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-medium">{activeFirm.name} — pick thumbnail</h2>
                <button onClick={() => setOpen(null)} className="text-white/40 hover:text-white text-xl leading-none">×</button>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {allMedia.map((item) => (
                  <button
                    key={item.publicId}
                    onClick={() => select(activeFirm.slug, item.publicId)}
                    disabled={pending}
                    className={`relative overflow-hidden rounded transition-opacity ${
                      item.publicId === activeFirm.currentThumbnailId
                        ? 'ring-2 ring-white'
                        : 'hover:opacity-80'
                    }`}
                  >
                    <img src={item.url} className="w-full h-auto block" alt="" />
                    {item.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
