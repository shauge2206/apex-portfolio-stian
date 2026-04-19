'use client'

import { useState, useRef } from 'react'
import { toggleHidden, saveOrder, saveCategoryOrder, toggleCategoryHidden } from './actions'

interface Project {
  slug: string
  name: string
  categorySlug: string
  categoryName: string
  thumbnailUrl?: string
  hidden: boolean
}

interface Category {
  slug: string
  name: string
  hidden: boolean
  projects: Project[]
}

export default function ProjectManager({ categories }: { categories: Category[] }) {
  const [cats, setCats] = useState(categories)
  const dragItem = useRef<{ catSlug: string; index: number } | null>(null)
  const dragOver = useRef<{ catSlug: string; index: number } | null>(null)

  // Category-level drag state
  const catDragItem = useRef<number | null>(null)
  const catDragOver = useRef<number | null>(null)

  const handleCatDragStart = (index: number) => {
    catDragItem.current = index
  }

  const handleCatDragEnter = (index: number) => {
    catDragOver.current = index
    const from = catDragItem.current
    if (from === null || from === index) return
    setCats((prev) => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(index, 0, moved)
      catDragItem.current = index
      return next
    })
  }

  const handleCatDragEnd = async () => {
    await saveCategoryOrder(cats.map((c) => c.slug))
    catDragItem.current = null
    catDragOver.current = null
  }

  const handleToggleCategoryHidden = async (catSlug: string) => {
    setCats((prev) =>
      prev.map((c) => c.slug !== catSlug ? c : { ...c, hidden: !c.hidden })
    )
    await toggleCategoryHidden(catSlug)
  }

  const handleDragStart = (catSlug: string, index: number) => {
    dragItem.current = { catSlug, index }
  }

  const handleDragEnter = (catSlug: string, index: number) => {
    dragOver.current = { catSlug, index }
    if (!dragItem.current || dragItem.current.catSlug !== catSlug) return
    const from = dragItem.current.index
    if (from === index) return
    setCats((prev) =>
      prev.map((cat) => {
        if (cat.slug !== catSlug) return cat
        const projects = [...cat.projects]
        const [moved] = projects.splice(from, 1)
        projects.splice(index, 0, moved)
        dragItem.current = { catSlug, index }
        return { ...cat, projects }
      })
    )
  }

  const handleDragEnd = async (catSlug: string) => {
    const cat = cats.find((c) => c.slug === catSlug)
    if (cat) {
      await saveOrder(catSlug, cat.projects.map((p) => p.slug))
    }
    dragItem.current = null
    dragOver.current = null
  }

  const handleToggleHidden = async (catSlug: string, firmSlug: string) => {
    setCats((prev) =>
      prev.map((cat) =>
        cat.slug !== catSlug ? cat : {
          ...cat,
          projects: cat.projects.map((p) =>
            p.slug !== firmSlug ? p : { ...p, hidden: !p.hidden }
          ),
        }
      )
    )
    await toggleHidden(firmSlug)
  }

  return (
    <div className="space-y-10">
      {/* Category order */}
      <div>
        <h2 className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--t-text-sub)' }}>
          Kategorierekkefølge
        </h2>
        <div className="space-y-2">
          {cats.map((cat, index) => (
            <div
              key={cat.slug}
              draggable
              onDragStart={() => handleCatDragStart(index)}
              onDragEnter={() => handleCatDragEnter(index)}
              onDragEnd={handleCatDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className="flex items-center gap-3 p-3 rounded cursor-grab active:cursor-grabbing select-none"
              style={{
                background: 'var(--t-surface)',
                border: '1px solid var(--t-border)',
                opacity: cat.hidden ? 0.4 : 1,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--t-text-sub)', flexShrink: 0 }}>
                <circle cx="9" cy="5" r="1" fill="currentColor" />
                <circle cx="9" cy="12" r="1" fill="currentColor" />
                <circle cx="9" cy="19" r="1" fill="currentColor" />
                <circle cx="15" cy="5" r="1" fill="currentColor" />
                <circle cx="15" cy="12" r="1" fill="currentColor" />
                <circle cx="15" cy="19" r="1" fill="currentColor" />
              </svg>
              <span className="flex-1 text-sm" style={{ color: 'var(--t-text)' }}>{cat.name}</span>
              {cat.hidden && (
                <span className="text-[10px] tracking-widest uppercase px-2 py-0.5" style={{ color: 'var(--t-text-sub)', border: '1px solid var(--t-border)' }}>
                  Skjult
                </span>
              )}
              <button
                onClick={() => handleToggleCategoryHidden(cat.slug)}
                className="text-[11px] tracking-wider uppercase px-3 py-1.5 transition-opacity hover:opacity-70"
                style={{
                  color: cat.hidden ? 'var(--t-accent)' : 'var(--t-text-sub)',
                  border: '1px solid var(--t-border)',
                }}
              >
                {cat.hidden ? 'Vis' : 'Skjul'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <hr style={{ borderColor: 'var(--t-border)' }} />

      {/* Per-category project order */}
      {cats.map((cat) => (
        <div key={cat.slug}>
          <h2 className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--t-text-sub)' }}>
            {cat.name}
          </h2>
          <div className="space-y-2">
            {cat.projects.map((project, index) => (
              <div
                key={project.slug}
                draggable
                onDragStart={() => handleDragStart(cat.slug, index)}
                onDragEnter={() => handleDragEnter(cat.slug, index)}
                onDragEnd={() => handleDragEnd(cat.slug)}
                onDragOver={(e) => e.preventDefault()}
                className="flex items-center gap-3 p-3 rounded cursor-grab active:cursor-grabbing select-none"
                style={{
                  background: 'var(--t-surface)',
                  border: '1px solid var(--t-border)',
                  opacity: project.hidden ? 0.4 : 1,
                }}
              >
                {/* Drag handle */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--t-text-sub)', flexShrink: 0 }}>
                  <circle cx="9" cy="5" r="1" fill="currentColor" />
                  <circle cx="9" cy="12" r="1" fill="currentColor" />
                  <circle cx="9" cy="19" r="1" fill="currentColor" />
                  <circle cx="15" cy="5" r="1" fill="currentColor" />
                  <circle cx="15" cy="12" r="1" fill="currentColor" />
                  <circle cx="15" cy="19" r="1" fill="currentColor" />
                </svg>

                {/* Thumbnail */}
                {project.thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={project.thumbnailUrl} alt="" className="h-10 w-16 object-cover rounded-sm flex-shrink-0" />
                )}

                {/* Name */}
                <span className="flex-1 text-sm" style={{ color: 'var(--t-text)' }}>
                  {project.name}
                </span>

                {/* Hidden badge */}
                {project.hidden && (
                  <span className="text-[10px] tracking-widest uppercase px-2 py-0.5" style={{ color: 'var(--t-text-sub)', border: '1px solid var(--t-border)' }}>
                    Skjult
                  </span>
                )}

                {/* Toggle button */}
                <button
                  onClick={() => handleToggleHidden(cat.slug, project.slug)}
                  className="text-[11px] tracking-wider uppercase px-3 py-1.5 transition-opacity hover:opacity-70"
                  style={{
                    color: project.hidden ? 'var(--t-accent)' : 'var(--t-text-sub)',
                    border: '1px solid var(--t-border)',
                  }}
                >
                  {project.hidden ? 'Vis' : 'Skjul'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
