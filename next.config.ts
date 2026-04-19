import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Custom loader generates Cloudinary srcset widths, bypassing /_next/image proxy.
    // Images are fetched directly from res.cloudinary.com CDN.
    loaderFile: './lib/cloudinary-image-loader.ts',
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
}

export default nextConfig
