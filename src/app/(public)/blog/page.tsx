import type { Metadata } from 'next'
import { asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { categories as categoriesTable } from '@/db/schema'
import { listPublishedPostSummaries } from '@/db/queries'
import { getSiteSettings } from '@/lib/content'
import MiniHero from '@/components/ui/MiniHero'
import BlogList, { type PostSummary, type Category } from './BlogList'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Artículos sobre running, triatlón y entrenamiento de resistencia. Tips, guías y más.',
  alternates: { canonical: '/blog' },
}

async function getData(): Promise<{ posts: PostSummary[]; categories: Category[] }> {
  // El sitio público renderiza aunque la DB no responda (lista vacía).
  try {
    const [posts, categories] = await Promise.all([
      listPublishedPostSummaries(),
      db
        .select({ id: categoriesTable.id, name: categoriesTable.name, slug: categoriesTable.slug })
        .from(categoriesTable)
        .orderBy(asc(categoriesTable.display_order)),
    ])
    return { posts: posts as unknown as PostSummary[], categories }
  } catch (err) {
    console.error('Blog fetch error:', err)
    return { posts: [], categories: [] }
  }
}

export default async function BlogPage() {
  const [{ posts, categories }, settings] = await Promise.all([getData(), getSiteSettings()])

  return (
    <>
      <MiniHero
        image={settings.page_banners.blog.bg_image}
        imageAlt="Equipo entrenando"
        titleWhite="CONOCIMIENTO"
        titleAccent="QUE MUEVE"
      />

      {/* Content */}
      <section className="py-section bg-blue-900">
        <div className="container">
          {posts.length === 0 ? (
            <p className="text-center text-white/50 text-lg py-20">
              Próximamente publicaciones aquí.
            </p>
          ) : (
            <BlogList posts={posts} categories={categories} />
          )}
        </div>
      </section>
    </>
  )
}
