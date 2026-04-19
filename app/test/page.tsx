import { getPortfolioStructure } from '@/lib/cloudinary'

export default async function TestPage() {
  const structure = await getPortfolioStructure()

  return (
    <main style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Cloudinary structure</h1>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {JSON.stringify(structure, null, 2)}
      </pre>
    </main>
  )
}
