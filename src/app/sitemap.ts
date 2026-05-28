import type { MetadataRoute } from 'next'
import { createSupabaseClient } from '@/lib/supabase'

const BASE_URL = 'https://gc2entrenamientoderesistencia.com.ar'

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

  // Blog posts from Supabase
  let blogRoutes: MetadataRoute.Sitemap = []
  try {
    const supabase = createSupabaseClient()
    const { data } = await supabase
      .from('posts')
      .select('slug, created_at')
      .eq('published', true)

    if (data) {
      blogRoutes = data.map((post) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.created_at),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      }))
    }
  } catch (err) {
    console.error('Sitemap blog fetch error:', err)
  }

  return [...staticRoutes, ...blogRoutes]
}
