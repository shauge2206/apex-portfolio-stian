import { getFirmMedia } from '@/lib/cloudinary'
import { NextResponse } from 'next/server'

export const revalidate = 3600

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ category: string; firm: string }> }
) {
  const { category, firm } = await params
  const data = await getFirmMedia(category, firm)
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
