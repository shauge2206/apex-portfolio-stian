'use client'

import { useState, useRef } from 'react'

interface FocalPoint { x: number; y: number }

interface Props {
  publicId: string
  imageWidth: number
  imageHeight: number
  cloudName: string
  initialFocalPoint?: FocalPoint
  onConfirm: (focalPoint: FocalPoint | null) => void
  onBack: () => void
}

export default function ThumbnailCropEditor({
  publicId, imageWidth, imageHeight, cloudName, initialFocalPoint, onConfirm, onBack,
}: Props) {
  const [focal, setFocal] = useState<FocalPoint>(initialFocalPoint ?? { x: 0.5, y: 0.5 })
  const [previewFocal, setPreviewFocal] = useState<FocalPoint>(initialFocalPoint ?? { x: 0.5, y: 0.5 })
  const isDragging = useRef(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  const updateFocal = (clientX: number, clientY: number) => {
    if (!overlayRef.current) return
    const rect = overlayRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
    setFocal({ x, y })
  }

  const commitPreview = () => setPreviewFocal({ ...focal })

  // Compute the 4:3 crop rectangle as percentages of the displayed image
  const cropAspect = 4 / 3
  const imageAspect = imageWidth / imageHeight

  let cropW: number, cropH: number
  if (imageAspect > cropAspect) {
    cropH = imageHeight
    cropW = imageHeight * cropAspect
  } else {
    cropW = imageWidth
    cropH = imageWidth / cropAspect
  }

  const fpx = focal.x * imageWidth
  const fpy = focal.y * imageHeight
  const clampedLeft = Math.max(0, Math.min(imageWidth - cropW, fpx - cropW / 2))
  const clampedTop = Math.max(0, Math.min(imageHeight - cropH, fpy - cropH / 2))

  const cropLeftPct = (clampedLeft / imageWidth) * 100
  const cropTopPct = (clampedTop / imageHeight) * 100
  const cropWidthPct = (cropW / imageWidth) * 100
  const cropHeightPct = (cropH / imageHeight) * 100

  const px = Math.round(previewFocal.x * imageWidth)
  const py = Math.round(previewFocal.y * imageHeight)
  const fullUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_900,q_auto,f_auto/${publicId}`
  const previewUrl = `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_300,h_225,g_xy_center,x_${px},y_${py},q_auto,f_auto/${publicId}`

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-white/40 hover:text-white transition-colors">
          ← Tilbake
        </button>
        <p className="text-xs text-white/30">Dra for å velge utsnitt</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-5 items-start">
        {/* Editor — live crop overlay */}
        <div
          className="relative flex-1 min-w-0 overflow-hidden rounded"
          style={{ cursor: 'crosshair' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fullUrl}
            alt=""
            style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none', userSelect: 'none' }}
            draggable={false}
          />

          {/* Darkened mask around crop area (box-shadow trick) */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${cropLeftPct}%`,
              top: `${cropTopPct}%`,
              width: `${cropWidthPct}%`,
              height: `${cropHeightPct}%`,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.58)',
              outline: '1.5px solid rgba(255,255,255,0.65)',
            }}
          />

          {/* Corner handles */}
          {[
            { left: `${cropLeftPct}%`, top: `${cropTopPct}%`, borderRadius: '2px 0 0 0', borderTop: '2px solid white', borderLeft: '2px solid white' },
            { left: `${cropLeftPct + cropWidthPct}%`, top: `${cropTopPct}%`, transform: 'translateX(-100%)', borderRadius: '0 2px 0 0', borderTop: '2px solid white', borderRight: '2px solid white' },
            { left: `${cropLeftPct}%`, top: `${cropTopPct + cropHeightPct}%`, transform: 'translateY(-100%)', borderRadius: '0 0 0 2px', borderBottom: '2px solid white', borderLeft: '2px solid white' },
            { left: `${cropLeftPct + cropWidthPct}%`, top: `${cropTopPct + cropHeightPct}%`, transform: 'translate(-100%, -100%)', borderRadius: '0 0 2px 0', borderBottom: '2px solid white', borderRight: '2px solid white' },
          ].map((style, i) => (
            <div
              key={i}
              className="absolute pointer-events-none"
              style={{ ...style, width: 12, height: 12 }}
            />
          ))}

          {/* Focal crosshair */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${focal.x * 100}%`,
              top: `${focal.y * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="relative w-5 h-5">
              <div className="absolute inset-0 rounded-full border-[1.5px] border-white" style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.6)' }} />
              <div className="absolute top-1/2 left-0.5 right-0.5 h-px bg-white" style={{ marginTop: '-0.5px' }} />
              <div className="absolute left-1/2 top-0.5 bottom-0.5 w-px bg-white" style={{ marginLeft: '-0.5px' }} />
            </div>
          </div>

          {/* Event capture */}
          <div
            ref={overlayRef}
            className="absolute inset-0"
            onMouseDown={(e) => { isDragging.current = true; updateFocal(e.clientX, e.clientY) }}
            onMouseMove={(e) => { if (isDragging.current) updateFocal(e.clientX, e.clientY) }}
            onMouseUp={() => { isDragging.current = false; commitPreview() }}
            onMouseLeave={() => { if (isDragging.current) { isDragging.current = false; commitPreview() } }}
            onTouchStart={(e) => { updateFocal(e.touches[0].clientX, e.touches[0].clientY) }}
            onTouchMove={(e) => { e.preventDefault(); updateFocal(e.touches[0].clientX, e.touches[0].clientY) }}
            onTouchEnd={() => { commitPreview() }}
          />
        </div>

        {/* Sidebar */}
        <div className="sm:w-52 flex-shrink-0 space-y-3">
          <p className="text-xs text-white/40">Forhåndsvisning (4:3)</p>
          <div className="rounded overflow-hidden bg-[#1a1a1a]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={`${px}-${py}`}
              src={previewUrl}
              alt=""
              className="w-full h-auto block"
            />
          </div>
          <p className="text-[10px] text-white/20">Slipp for å oppdatere forhåndsvisning</p>

          <div className="space-y-2 pt-1">
            <button
              onClick={() => onConfirm(focal)}
              className="w-full py-2 bg-white text-black text-sm font-medium rounded hover:bg-white/90 transition-colors"
            >
              Velg utsnitt
            </button>
            <button
              onClick={() => onConfirm(null)}
              className="w-full py-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Ingen utsnitt (standard)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
