import { getAllProjects } from '@/lib/cloudinary'
import PortfolioGrid from '@/components/PortfolioGrid'

export const revalidate = 3600

export default async function PortfolioPage() {
  const projects = await getAllProjects()

  // Group by category, preserving order
  const categories: {
    name: string
    slug: string
    projects: typeof projects
  }[] = []

  for (const project of projects) {
    let cat = categories.find((c) => c.slug === project.categorySlug)
    if (!cat) {
      cat = { name: project.category, slug: project.categorySlug, projects: [] }
      categories.push(cat)
    }
    cat.projects.push(project)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <PortfolioGrid categories={categories} />
    </div>
  )
}
