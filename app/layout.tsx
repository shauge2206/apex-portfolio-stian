import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getLogoUrl } from '@/lib/cloudinary'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Apex Bergen',
  description: 'Visuell portefølje',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const logoUrl = await getLogoUrl()

  return (
    <html lang="no" className="h-full">
      <body className={`${inter.variable} font-[family-name:var(--font-inter)] min-h-full flex flex-col bg-[#0f0f0f] text-[#f0ede8] antialiased`}>
        <Navbar logoUrl={logoUrl} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
