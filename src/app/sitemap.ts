import type { MetadataRoute } from 'next'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { posts } from '@/db/schema'

// Sale del entorno (test publica su propia URL); el valor por defecto es el dominio real.
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gc2entrenamientoderesistencia.com.ar').replace(/\/$/, '')

// Dinámico: el build de Coolify no tiene base y congelaría el sitemap sin los posts publicados.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/planes`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contacto`,
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/blog`,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ]

  // Posts publicados del blog
  let blogRoutes: MetadataRoute.Sitemap = []
  try {
    const data = await db
      .select({ slug: posts.slug, created_at: posts.created_at })
      .from(posts)
      .where(eq(posts.published, true))

    blogRoutes = data.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))
  } catch (err) {
    console.error('Sitemap blog fetch error:', err)
  }

  return [...staticRoutes, ...blogRoutes]
}
