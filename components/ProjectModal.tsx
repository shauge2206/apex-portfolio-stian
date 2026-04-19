'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { MediaItem } from '@/types'

function VideoItem({ item, isActive, preload }: { item: MediaItem; isActive: boolean; preload: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    if (isActive) {
      video.play().catch(() => {})
      setPaused(false)
    } else {
      video.pause()
      video.currentTime = 0
      setPaused(false)
    }
  }, [isActive])

  const toggle = () => {
    const video = ref.current
    if (!video) return
    if (video.paused) {
      video.play()
      setPaused(false)
    } else {
      video.pause()
      setPaused(true)
    }
  }

  return (
    <div className="relative flex items-center justify-center" style={{ maxHeight: 'calc(100vh - 160px)', maxWidth: '100%' }}>
      <video
        ref={ref}
        src={item.url}
        poster={item.thumbnailUrl}
        playsInline
        preload={preload}
        onClick={toggle}
        className="rounded-sm cursor-pointer block"
        style={{ maxHeight: 'calc(100vh - 160px)', maxWidth: '100%' }}
      />
      {paused && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
            <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}

interface FirmData {
  firmName: string
  categoryName: string
  images: MediaItem[]
  videos: MediaItem[]
}

interface Props {
  categorySlug: string
  firmSlug: string
  onClose: () => void
}

export default function ProjectModal({ categorySlug, firmSlug, onClose }: Props) {
  const [data, setData] = useState<FirmData | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const stripRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  useEffect(() => {
    setData(null)
    setActiveIndex(0)
    fetch(`/api/firm/${categorySlug}/${firmSlug}`)
      .then((r) => r.json())
      .then(setData)
  }, [categorySlug, firmSlug])

  const allMedia: MediaItem[] = data ? [...data.videos, ...data.images] : []

  const prev = useCallback(() => setActiveIndex((i) => Math.max(i - 1, 0)), [])
  const next = useCallback(() => setActiveIndex((i) => Math.min(i + 1, allMedia.length - 1)), [allMedia.length])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, prev, next])

  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return
    const thumb = strip.children[activeIndex] as HTMLElement
    thumb?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [activeIndex])

  const active = allMedia[activeIndex] ?? null

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col backdrop-blur-sm" style={{ background: 'var(--t-modal-bg)' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 shrink-0 border-b"
        style={{ borderBottomColor: 'var(--t-border)' }}
      >
        <div>
          {data && (
            <>
              <p className="text-sm font-medium tracking-wide" style={{ color: 'var(--t-text)' }}>{data.firmName}</p>
              <p className="text-[11px] tracking-widest uppercase mt-0.5" style={{ color: 'var(--t-text-sub)' }}>{data.categoryName}</p>
            </>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-11 h-11 flex items-center justify-center transition-colors"
          style={{ color: 'var(--t-text-sub)' }}
          aria-label="Lukk"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 4l12 12M16 4L4 16" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Main display + nav buttons */}
      <div
        className="flex-1 flex items-center justify-center min-h-0 overflow-hidden relative"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX
          touchStartY.current = e.touches[0].clientY
        }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touchStartX.current
          const dy = e.changedTouches[0].clientY - touchStartY.current
          if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
            if (dx < 0) next()
            else prev()
          }
        }}
      >
        {/* Prev */}
        {allMedia.length > 1 && activeIndex > 0 && (
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-11 h-16 flex items-center justify-center transition-colors z-10"
            style={{ color: 'var(--t-text-sub)' }}
            aria-label="Forrige"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {/* Media */}
        <div className="flex items-center justify-center w-full h-full px-14 relative">
          {!data && (
            <div
              className="w-8 h-8 rounded-full animate-spin border"
              style={{ borderColor: 'var(--t-border)', borderTopColor: 'var(--t-text)' }}
            />
          )}
          {allMedia.map((item, i) => {
            const isActive = i === activeIndex
            return (
              <div
                key={item.publicId}
                className="absolute inset-0 flex items-center justify-center px-14"
                style={{ opacity: isActive ? 1 : 0, pointerEvents: isActive ? 'auto' : 'none' }}
              >
                {item.resourceType === 'video' ? (
                  <VideoItem
                    item={item}
                    isActive={isActive}
                    preload={Math.abs(i - activeIndex) <= 1 ? 'auto' : 'metadata'}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt=""
                    style={{ maxHeight: 'calc(100vh - 160px)', maxWidth: '100%', objectFit: 'contain' }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Next */}
        {allMedia.length > 1 && activeIndex < allMedia.length - 1 && (
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-16 flex items-center justify-center transition-colors z-10"
            style={{ color: 'var(--t-text-sub)' }}
            aria-label="Neste"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Thumbnail rows */}
      {allMedia.length > 1 && (
        <div
          ref={stripRef}
          className="shrink-0 border-t px-4 py-3 space-y-3"
          style={{ borderTopColor: 'var(--t-border)' }}
        >
          {(['video', 'image'] as const).map((type) => {
            const items = allMedia.map((item, i) => ({ item, i })).filter(({ item }) => item.resourceType === type)
            if (items.length === 0) return null
            return (
              <div key={type}>
                <p className="text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--t-text-sub)' }}>
                  {type === 'video' ? 'Videoer' : 'Bilder'}
                </p>
                <div className="flex justify-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                  {items.map(({ item, i }) => (
                    <button
                      key={item.publicId}
                      onClick={() => setActiveIndex(i)}
                      className="relative flex-none h-16 overflow-hidden rounded transition-opacity"
                      style={
                        i === activeIndex
                          ? { boxShadow: '0 0 0 2px var(--t-accent)', opacity: 1 }
                          : { opacity: 0.4 }
                      }
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.thumbnailUrl} alt="" className="h-full w-auto object-cover" />
                      {type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>,
    document.body
  )
}
