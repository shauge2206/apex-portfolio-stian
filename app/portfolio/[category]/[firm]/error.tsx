'use client'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 text-center">
      <p className="text-sm text-white/40 mb-4">Could not load firm gallery.</p>
      <button
        onClick={reset}
        className="text-xs text-white/50 underline underline-offset-4 hover:text-white"
      >
        Try again
      </button>
    </div>
  )
}
