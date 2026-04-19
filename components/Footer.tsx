export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/[0.06] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl flex flex-col items-center gap-3 text-center">
        <span className="text-xs tracking-[0.25em] uppercase text-white/20">Apex Bergen</span>
        <span className="text-xs text-white/10">&copy; {new Date().getFullYear()}</span>
      </div>
    </footer>
  )
}
