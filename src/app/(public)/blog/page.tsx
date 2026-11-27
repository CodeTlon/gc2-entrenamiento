import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { categories as categoriesTable } from '@/db/schema'
import { listPublishedPostSummaries } from '@/db/queries'
import { getSiteSettings } from '@/lib/content'
import MiniHero from '@/components/ui/MiniHero'
import BlogList, { type PostSummary, type Category } from './BlogList'

// Dinámica: en Coolify el build corre sin base de datos, así que prerenderizar dejaría el contenido de respaldo hasta la próxima revalidación.
export const dynamic = 'force-dynamic'

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
                <div className="flex gap-3 shrink-0">
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
