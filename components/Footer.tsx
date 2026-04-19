export default function Footer() {
  return (
    <footer
      className="mt-24 border-t px-4 py-10 sm:px-6"
      style={{ borderTopColor: 'var(--t-border)' }}
    >
      <div className="mx-auto max-w-6xl flex flex-col items-center gap-3 text-center">
        <span className="text-xs tracking-[0.25em] uppercase" style={{ color: 'var(--t-text-sub)' }}>Apex Bergen</span>
      </div>
    </footer>
  )
}
