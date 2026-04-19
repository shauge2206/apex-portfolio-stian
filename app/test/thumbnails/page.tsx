import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

async function getFirmImages(firmPath: string) {
  const { folders: subs } = await cloudinary.api
    .sub_folders(firmPath)
    .catch(() => ({ folders: [] }))
  const paths: string[] = subs.length > 0 ? subs.map((s: any) => s.path) : [firmPath]
  const results = await Promise.all(
    paths.map((p) =>
      cloudinary.api
        .resources_by_asset_folder(p, { max_results: 500, resource_type: 'image' })
        .then((r: any) => r.resources)
        .catch(() => [])
    )
  )
  return results.flat()
}

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

function thumbUrl(publicId: string) {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/w_200,h_200,c_fill/${publicId}`
}

export default async function ThumbnailPickerPage() {
  const { folders: cats } = await cloudinary.api.sub_folders('apex')
  const allFirms = (
    await Promise.all(
      cats.map(async (cat: any) => {
        const { folders: firms } = await cloudinary.api
          .sub_folders(cat.path)
          .catch(() => ({ folders: [] }))
        return firms.map((f: any) => ({ ...f, cat: cat.name }))
      })
    )
  ).flat()

  const firmsWithImages = await Promise.all(
    allFirms.map(async (firm: any) => ({
      name: firm.name,
      path: firm.path,
      images: await getFirmImages(firm.path),
    }))
  )

  return (
    <main style={{ padding: '2rem', fontFamily: 'monospace', fontSize: '12px', background: '#0a0a0a', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Thumbnail picker</h1>
      <p style={{ color: '#888', marginBottom: '2rem' }}>
        Find the image you want, copy its public_id, and add it to <code>lib/thumbnail-overrides.ts</code>.
      </p>
      {firmsWithImages.map((firm) => (
        <div key={firm.path} style={{ marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: '1rem', color: '#ccc' }}>{firm.name}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {firm.images.map((img: any) => (
              <div key={img.public_id} style={{ width: 200 }}>
                <img src={thumbUrl(img.public_id)} width={200} height={200} style={{ display: 'block', objectFit: 'cover' }} alt="" />
                <div style={{ marginTop: '4px', wordBreak: 'break-all', color: '#666', fontSize: '10px' }}>
                  {img.public_id}
                </div>
              </div>
            ))}
            {firm.images.length === 0 && <span style={{ color: '#555' }}>No images</span>}
          </div>
        </div>
      ))}
    </main>
  )
}
