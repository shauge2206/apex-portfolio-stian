'use client'

import { useState, useRef } from 'react'

interface Props {
  publicId: string
  cloudName: string
  initialOffset?: number
  onConfirm: (offset: number) => void
  onBack: () => void
}

export default function VideoFramePicker({ publicId, cloudName, initialOffset = 0, onConfirm, onBack }: Props) {
  const [currentTime, setCurrentTime] = useState(initialOffset)
  const [previewTime, setPreviewTime] = useState(initialOffset)
  const [manualInput, setManualInput] = useState(String(initialOffset))
  const videoRef = useRef<HTMLVideoElement>(null)

  const videoUrl = `https://res.cloudinary.com/${cloudName}/video/upload/q_auto/${publicId}`
  const frameUrl = `https://res.cloudinary.com/${cloudName}/video/upload/so_${previewTime},c_fill,w_300,h_225,q_auto,f_jpg/${publicId}`

  const captureTime = () => {
    if (!videoRef.current) return
    const t = Math.round(videoRef.current.currentTime)
    setCurrentTime(t)
    setPreviewTime(t)
    setManualInput(String(t))
  }

  const applyManual = (val: string) => {
    const t = Math.round(parseFloat(val))
    if (!isNaN(t) && t >= 0) {
      setCurrentTime(t)
      setPreviewTime(t)
      setManualInput(String(t))
      if (videoRef.current) videoRef.current.currentTime = t
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-white/40 hover:text-white transition-colors">
          ← Tilbake
        </button>
        <p className="text-xs text-white/30">Pause videoen på ønsket øyeblikk</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-5 items-start">
        {/* Video player */}
        <div className="flex-1 min-w-0 space-y-3">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            className="w-full rounded"
            style={{ maxHeight: '360px', background: '#000' }}
            onPause={captureTime}
            onSeeked={captureTime}
          />
          {/* Manual time input */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40 flex-shrink-0">Eller skriv inn sekund:</span>
            <input
              type="number"
              min={0}
              step={1}
              value={manualInput}
              onChange={(e) => applyManual(e.target.value)}
              className="w-20 bg-white/10 text-white text-sm rounded px-2 py-1.5 border border-white/15 focus:outline-none focus:border-white/40"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="sm:w-52 flex-shrink-0 space-y-2">
          <p className="text-xs text-white/40">Forhåndsvisning thumbnail (4:3)</p>
          <div className="relative rounded overflow-hidden bg-[#1a1a1a]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={previewTime}
              src={frameUrl}
              alt=""
              className="w-full h-auto block"
            />
            <div
              className="absolute bottom-2 right-2 text-[11px] font-mono px-2 py-0.5 rounded"
              style={{ background: 'rgba(0,0,0,0.7)', color: 'rgba(255,255,255,0.7)' }}
            >
              {currentTime}s
            </div>
          </div>
          <p className="text-[10px] text-white/20">Pause eller seek videoen for å oppdatere</p>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <button
          onClick={() => onConfirm(currentTime)}
          className="px-6 py-2 text-sm font-medium rounded transition-all duration-150 active:scale-95 active:brightness-90"
          style={{ background: 'var(--t-accent)', color: 'var(--t-bg)' }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Velg dette øyeblikket
        </button>
      </div>
    </div>
  )
}
