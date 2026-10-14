import type { MetadataRoute } from 'next'

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gc2entrenamientoderesistencia.com.ar').replace(/\/$/, '')

// Dinámico: APP_ENV es de runtime y en el build no existe; si se prerenderizara, test saldría indexable.
export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  // Test no se indexa: el sitio real es el único que tiene que aparecer en buscadores.
  if (process.env.APP_ENV === 'test') {
    return { rules: { userAgent: '*', disallow: '/' } }
  }
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/dashboard/',
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
