'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MediaItem } from '@/types'
import Lightbox from './Lightbox'
import VideoPlayer from './VideoPlayer'

const BLUR = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACv/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8AKgD/2Q=='

function VideoCard({ item, onOpen }: { item: MediaItem; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="relative cursor-pointer overflow-hidden bg-[#111] group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
    >
      <img
        src={item.thumbnailUrl}
        alt=""
        width={item.width}
        height={item.height}
        loading="lazy"
        className="w-full h-auto"
      />

      {hovered && (
        <video
          src={item.url}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      <div className="absolute inset-0 flex items-center justify-center transition-opacity group-hover:opacity-0">
        <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </div>
  )
}

interface Props {
  images: MediaItem[]
  videos: MediaItem[]
}

export default function FirmGallery({ images, videos }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [activeVideo, setActiveVideo] = useState<MediaItem | null>(null)

  return (
    <div className="space-y-10">
      {/* Photos */}
      {images.length > 0 && (
        <section>
          {videos.length > 0 && (
            <p className="text-xs text-white/30 uppercase tracking-widest mb-4">
              Photos <span className="ml-1 opacity-60">{images.length}</span>
            </p>
          )}
          <div className="columns-2 gap-2 md:columns-3">
            {images.map((img, i) => (
              <div
                key={img.publicId}
                className="break-inside-avoid mb-2 cursor-pointer overflow-hidden group"
                onClick={() => setLightboxIndex(i)}
              >
                <Image
                  src={img.thumbnailUrl}
                  alt=""
                  width={img.width}
                  height={img.height}
                  placeholder="blur"
                  blurDataURL={BLUR}
                  priority={i < 6}
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="w-full h-auto transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <section>
          {images.length > 0 && (
            <p className="text-xs text-white/30 uppercase tracking-widest mb-4">
              Videos <span className="ml-1 opacity-60">{videos.length}</span>
            </p>
          )}
          <div className="columns-2 gap-2 md:columns-3">
            {videos.map((v) => (
              <div key={v.publicId} className="break-inside-avoid mb-2">
                <VideoCard
                  item={v}
                  onOpen={() => setActiveVideo(v)}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {images.length === 0 && videos.length === 0 && (
        <p className="text-sm text-white/20">No media.</p>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {activeVideo && (
        <VideoPlayer
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </div>
  )
}
