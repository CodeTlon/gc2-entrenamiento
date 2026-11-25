import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase'
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
  const supabase = createSupabaseClient()
  const [postsRes, catsRes] = await Promise.all([
    supabase
      .from('posts')
      .select('id, title, slug, excerpt, cover_image, youtube_url, created_at, post_categories(category_id, categories(name, slug)), post_authors(coaches(name, photo_url))')
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
          <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-3xl mb-4">
            Guías y consejos prácticos sobre entrenamiento de running, duatlón y triatlón: técnica de
            carrera, planificación de cargas, nutrición y prevención de lesiones, escritos por los
            coaches de GC² Entrenamiento en Córdoba.
          </p>
          <Link
            href="/planes"
            className="inline-flex items-center gap-1.5 text-accent text-sm font-body font-semibold hover:gap-2.5 transition-all mb-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded"
          >
            Ver planes de entrenamiento
            <ArrowRight size={15} />
          </Link>

          {posts.length === 0 ? (
            <p className="text-center text-white/50 text-lg py-20">
              Próximamente publicaciones aquí.
            </p>
          ) : (
            <>
              <BlogList posts={posts} categories={categories} />

              {/* Interlink Planes/Contacto */}
              <div
                className="mt-16 rounded-xl p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left"
                style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.2)' }}
              >
                <div>
                  <p className="font-heading font-bold text-white text-xl uppercase mb-1">
                    ¿Listo para pasar de la teoría a entrenar?
                  </p>
                  <p className="text-white/55 text-sm">
                    Elegí un plan a tu medida o contanos tu objetivo y te asesoramos sin cargo.
                  </p>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <Link href="/planes" className="btn btn--primary uppercase tracking-widest text-xs font-extrabold">
                    Ver Planes
                  </Link>
                  <Link href="/contacto" className="btn btn--outline uppercase tracking-widest text-xs font-extrabold">
                    Contacto
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
