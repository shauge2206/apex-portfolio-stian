'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { MediaItem } from '@/types'

interface Props {
  video: MediaItem
  onClose: () => void
}

export default function VideoPlayer({ video, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  useEffect(() => {
    videoRef.current?.play().catch(() => {})
  }, [])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/96 p-4 sm:p-10"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-9 right-0 p-1 text-white/40 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 4l12 12M16 4L4 16" strokeLinecap="round" />
          </svg>
        </button>

        <video
          ref={videoRef}
          src={video.url}
          poster={video.thumbnailUrl}
          controls
          playsInline
          preload="metadata"
          className="w-full rounded-sm bg-black"
          style={{ maxHeight: '80vh' }}
        />
      </div>
    </div>,
    document.body
  )
}
