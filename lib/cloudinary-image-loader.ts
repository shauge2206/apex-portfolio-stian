// Custom Next.js image loader for Cloudinary URLs.
// Next.js calls this with each srcset breakpoint width — the loader returns
// a Cloudinary URL with that width substituted in. Images are fetched directly
// from Cloudinary's CDN (no /_next/image proxy).

export default function cloudinaryLoader({
  src,
  width,
}: {
  src: string
  width: number
  quality?: number
}): string {
  if (!src.includes('res.cloudinary.com')) return src

  // Replace existing w_N param (keep all other transforms intact)
  if (/\bw_\d+\b/.test(src)) {
    return src.replace(/\bw_\d+\b/, `w_${width}`)
  }

  // No width in URL — prepend one to the existing transforms
  return src.replace('/upload/', `/upload/w_${width},c_limit,`)
}
