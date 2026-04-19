'use client'

import { useState, useTransition } from 'react'
import { publishChanges } from './actions'

export default function PublishBar() {
  const [pending, startTransition] = useTransition()
  const [published, setPublished] = useState(false)

  const handlePublish = () => {
    startTransition(async () => {
      await publishChanges()
      setPublished(true)
      setTimeout(() => setPublished(false), 3000)
    })
  }

  return (
    <div
      className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 mb-8"
      style={{ background: 'var(--t-surface)', borderBottom: '1px solid var(--t-border)' }}
    >
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--t-text)' }}>Admin</p>
        <p className="text-xs" style={{ color: 'var(--t-text-sub)' }}>
          Endringer lagres automatisk. Trykk publiser for å oppdatere portfoliosiden.
        </p>
      </div>
      <button
        onClick={handlePublish}
        disabled={pending}
        className="px-5 py-2 text-sm font-medium rounded transition-all duration-150 active:scale-95 disabled:opacity-50"
        style={{ background: published ? 'var(--t-accent)' : 'white', color: 'black' }}
      >
        {pending ? 'Publiserer…' : published ? 'Publisert!' : 'Publiser endringer'}
      </button>
    </div>
  )
}
