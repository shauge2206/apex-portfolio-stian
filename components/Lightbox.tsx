'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import { MediaItem } from '@/types'

const BLUR =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACv/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8AKgD/2Q=='

interface Props {
  images: MediaItem[]
  initialIndex: number
  onClose: () => void
}

export default function Lightbox({ images, initialIndex, onClose }: Props) {
  const [index, setIndex] = useState(initialIndex)
  const [scale, setScale] = useState(1)

  const touchStartX = useRef(0)
  const lastPinchDist = useRef(0)
  const lastTap = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const prev = useCallback(() => {
    if (scale > 1) return
    setIndex((i) => (i - 1 + images.length) % images.length)
  }, [images.length, scale])

  const next = useCallback(() => {
    if (scale > 1) return
    setIndex((i) => (i + 1) % images.length)
  }, [images.length, scale])

  // Reset zoom when image changes
  useEffect(() => setScale(1), [index])

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { scale > 1 ? setScale(1) : onClose() }
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, prev, next, scale])

  // Lock body scroll
  useEffect(() => {
    const orig = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = orig }
  }, [])

  // Prevent native page pinch-zoom inside the lightbox
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const block = (e: TouchEvent) => { if (e.touches.length > 1) e.preventDefault() }
    el.addEventListener('touchmove', block, { passive: false })
    return () => el.removeEventListener('touchmove', block)
  }, [])

  const getPinchDist = (t: React.TouchList) =>
    Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) touchStartX.current = e.touches[0].clientX
    if (e.touches.length === 2) lastPinchDist.current = getPinchDist(e.touches)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = getPinchDist(e.touches)
      setScale((s) => Math.min(Math.max(s * (dist / lastPinchDist.current), 1), 5))
      lastPinchDist.current = dist
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length === 1 && e.touches.length === 0) {
      const now = Date.now()
      // Double-tap resets zoom
      if (now - lastTap.current < 300) { setScale(1); lastTap.current = 0; return }
      lastTap.current = now
      // Swipe to navigate (only when not zoomed)
      if (scale <= 1) {
        const diff = touchStartX.current - e.changedTouches[0].clientX
        if (diff > 50) next()
        else if (diff < -50) prev()
      }
    }
  }

  const current = images[index]

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/96"
      onClick={scale > 1 ? undefined : onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Counter */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 text-xs text-white/40 tabular-nums select-none pointer-events-none">
        {index + 1} / {images.length}
      </div>

      {/* Close — 44px touch target */}
      <button
        onClick={(e) => { e.stopPropagation(); scale > 1 ? setScale(1) : onClose() }}
        className="absolute top-1 right-1 flex items-center justify-center w-11 h-11 text-white/40 hover:text-white transition-colors"
        aria-label="Close"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 4l12 12M16 4L4 16" strokeLinecap="round" />
        </svg>
      </button>

      {/* Prev — 44px touch target, hidden when zoomed */}
      {images.length > 1 && scale <= 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); prev() }}
          className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-16 text-white/40 hover:text-white transition-colors"
          aria-label="Previous"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* Image — pinch-scalable */}
      <div
        className="relative w-[90vw] h-[85vh]"
        style={{
          transform: `scale(${scale})`,
          transition: scale === 1 ? 'transform 0.2s ease' : 'none',
          transformOrigin: 'center center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          key={current.publicId}
          src={current.url}
          alt=""
          fill
          sizes="100vw"
          className="object-contain"
          placeholder="blur"
          blurDataURL={BLUR}
          priority
        />
      </div>

      {/* Next — 44px touch target, hidden when zoomed */}
      {images.length > 1 && scale <= 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); next() }}
          className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-16 text-white/40 hover:text-white transition-colors"
          aria-label="Next"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>,
    document.body
  )
}
