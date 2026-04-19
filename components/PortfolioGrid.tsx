'use client'

import { useState } from 'react'
import Image from 'next/image'
import ProjectModal from './ProjectModal'

interface Project {
  name: string
  slug: string
  categorySlug: string
  thumbnailUrl: string | undefined
  thumbnailWidth: number
  thumbnailHeight: number
  wide: boolean
  imageCount: number
  videoCount: number
}

interface Category {
  name: string
  slug: string
  thumbnailUrl?: string
  projects: Project[]
}

interface ActiveProject {
  categorySlug: string
  firmSlug: string
}

export default function PortfolioGrid({ categories }: { categories: Category[] }) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [active, setActive] = useState<ActiveProject | null>(null)
  const [visible, setVisible] = useState(true)

  const navigate = (cat: Category | null) => {
    setVisible(false)
    setTimeout(() => {
      setSelectedCategory(cat)
      setVisible(true)
    }, 180)
  }

  // Category grid view
  if (!selectedCategory) {
    return (
      <>
        <div
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 transition-opacity duration-200"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {categories.map((cat, i) => {
            const cover = cat.projects.find((p) => p.thumbnailUrl) ?? cat.projects[0]
            const coverUrl = cat.thumbnailUrl ?? cover?.thumbnailUrl
            const totalMedia = cat.projects.reduce(
              (sum, p) => sum + p.imageCount + p.videoCount,
              0
            )
            return (
              <button
                key={cat.slug}
                onClick={() => navigate(cat)}
                className="group relative overflow-hidden aspect-[4/3] text-left"
                style={{ background: 'var(--t-surface)', borderRadius: 'var(--t-radius)', border: '1px solid var(--t-border)' }}
              >
                {coverUrl && (
                  <Image
                    src={coverUrl}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    priority={i < 6}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0" style={{ padding: '20px' }}>
                  <p className="text-base font-semibold" style={{ color: 'white', fontFamily: 'var(--t-font-display)', letterSpacing: '0.05em', textShadow: '0 1px 8px rgba(0,0,0,0.7)' }}>{cat.name}</p>
                  <p className="text-[11px] mt-1 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.6)', textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}>
                    {cat.projects.length} {cat.projects.length === 1 ? 'prosjekt' : 'prosjekter'} · {totalMedia} {totalMedia === 1 ? 'fil' : 'filer'}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </>
    )
  }

  // Project grid view for selected category
  return (
    <>
      {/* Back + heading */}
      <div
        className="transition-opacity duration-200"
        style={{ opacity: visible ? 1 : 0 }}
      >
      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={() => navigate(null)}
          className="flex items-center gap-2 hover:opacity-100 transition-colors text-sm"
          style={{ color: 'var(--t-text-sub)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Alle kategorier
        </button>
      </div>
      <div className="flex flex-col items-center mb-12">
        <h2
          className="text-4xl sm:text-5xl font-semibold text-center"
          style={{ fontFamily: 'var(--t-font-display)', textTransform: 'var(--t-heading-transform)' as any, letterSpacing: 'var(--t-heading-tracking)' }}
        >
          {selectedCategory.name}
        </h2>
        <div className="mt-5 w-10 h-px" style={{ background: 'var(--t-border-strong)' }} />
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {selectedCategory.projects.map((project, i) => (
          <button
            key={project.slug}
            onClick={() => setActive({ categorySlug: project.categorySlug, firmSlug: project.slug })}
            className={`group text-left ${project.wide ? 'w-[calc(50%-6px)] sm:w-[calc(50%-6px)]' : 'w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] lg:w-[calc(25%-9px)]'}`}
          >
            <div
              className="relative overflow-hidden"
              style={{ background: 'var(--t-surface)', borderRadius: 'var(--t-radius)', border: '1px solid var(--t-border)' }}
            >
              {project.thumbnailUrl ? (
                <Image
                  src={project.thumbnailUrl}
                  alt={project.name}
                  width={project.thumbnailWidth}
                  height={project.thumbnailHeight}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  priority={i < 8}
                  className="w-full h-auto transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              ) : (
                <div className="aspect-[4/3]" style={{ background: 'var(--t-surface)' }} />
              )}
              {/* Gradient + bottom label */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-sm font-semibold truncate" style={{ color: 'white', textShadow: '0 1px 6px rgba(0,0,0,0.8)', fontFamily: 'var(--t-font-display)', letterSpacing: '0.05em' }}>
                  {project.name}
                </p>
                <p className="text-[10px] mt-0.5 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.6)', textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}>
                  {[
                    project.imageCount > 0 && `${project.imageCount} ${project.imageCount === 1 ? 'bilde' : 'bilder'}`,
                    project.videoCount > 0 && `${project.videoCount} ${project.videoCount === 1 ? 'video' : 'videoer'}`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              {project.videoCount > 0 && (
                <div className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.35)' }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
      </div>

      {active && (
        <ProjectModal
          categorySlug={active.categorySlug}
          firmSlug={active.firmSlug}
          onClose={() => setActive(null)}
        />
      )}
    </>
  )
}
