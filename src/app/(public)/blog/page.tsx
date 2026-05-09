import type { Metadata } from 'next'
import { createSupabaseClient } from '@/lib/supabase'
import { IMG_GROUP } from '@/lib/constants'
import MiniHero from '@/components/ui/MiniHero'
import BlogList, { type PostSummary, type Category } from './BlogList'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Artículos sobre running, triatlón y entrenamiento de resistencia. Tips, guías y más.',
}

async function getData(): Promise<{ posts: PostSummary[]; categories: Category[] }> {
  const supabase = createSupabaseClient()
  const [postsRes, catsRes] = await Promise.all([
    supabase
      .from('posts')
      .select('id, title, slug, excerpt, cover_image, youtube_url, created_at, category_id, categories(name, slug), coaches(name, photo_url)')
      .eq('published', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('categories')
      .select('id, name, slug')
      .order('display_order', { ascending: true }),
  ])

  if (postsRes.error) console.error('Blog posts fetch error:', postsRes.error)
  if (catsRes.error) console.error('Categories fetch error:', catsRes.error)

  return {
    posts: (postsRes.data ?? []) as unknown as PostSummary[],
    categories: (catsRes.data ?? []) as unknown as Category[],
  }
}

export default async function BlogPage() {
  const { posts, categories } = await getData()

  return (
    <>
      <MiniHero
        image={IMG_GROUP}
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
