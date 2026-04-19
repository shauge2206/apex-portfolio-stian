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
  projects: Project[]
}

interface ActiveProject {
  categorySlug: string
  firmSlug: string
}

export default function PortfolioGrid({ categories }: { categories: Category[] }) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [active, setActive] = useState<ActiveProject | null>(null)

  // Category grid view
  if (!selectedCategory) {
    return (
      <>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.map((cat, i) => {
            const cover = cat.projects.find((p) => p.thumbnailUrl) ?? cat.projects[0]
            const totalMedia = cat.projects.reduce(
              (sum, p) => sum + p.imageCount + p.videoCount,
              0
            )
            return (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(cat)}
                className="group relative overflow-hidden rounded-sm aspect-[4/3] bg-[#1a1a1a] text-left"
              >
                {cover?.thumbnailUrl && (
                  <Image
                    src={cover.thumbnailUrl}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    priority={i < 6}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-sm font-semibold text-white tracking-wide">{cat.name}</p>
                  <p className="text-[11px] text-white/50 mt-0.5">
                    {cat.projects.length} prosjekter · {totalMedia} filer
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
      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={() => setSelectedCategory(null)}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Alle kategorier
        </button>
      </div>
      <div className="flex flex-col items-center mb-12">
        <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white text-center">
          {selectedCategory.name}
        </h2>
        <div className="mt-5 w-10 h-px bg-white/20" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {selectedCategory.projects.map((project, i) => (
          <button
            key={project.slug}
            onClick={() => setActive({ categorySlug: project.categorySlug, firmSlug: project.slug })}
            className={`group text-left ${project.wide ? 'col-span-2' : 'col-span-1'}`}
          >
            <div className="relative overflow-hidden bg-[#1a1a1a] rounded-sm">
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
                <div className="aspect-[4/3] bg-[#1a1a1a]" />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
            </div>
            <div className="pt-2.5 pb-1">
              <p className="text-sm font-medium text-white/90 truncate group-hover:text-white transition-colors">
                {project.name}
              </p>
              <span className="text-[11px] text-white/25">
                {[
                  project.imageCount > 0 && `${project.imageCount} bilder`,
                  project.videoCount > 0 && `${project.videoCount} videoer`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </div>
          </button>
        ))}
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
