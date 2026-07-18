import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  turbopack: {
    root: __dirname,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 80, 85],
    minimumCacheTTL: 60 * 60 * 24 * 60,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },
  async redirects() {
    return [
      { source: '/index.php', destination: '/', permanent: true },
      { source: '/contacto.php', destination: '/contacto', permanent: true },
      { source: '/planes.php', destination: '/planes', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        // Aplica a todas las rutas (sitio público + dashboard + API).
        source: '/:path*',
        headers: [
          // Bloquea que el sitio se embeba en un <iframe> ajeno (clickjacking).
          { key: 'X-Frame-Options', value: 'DENY' },
          // Evita que el browser "adivine" el MIME type de una respuesta.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Manda el origin al navegar afuera, no la URL completa (evita filtrar rutas internas/tokens en el referrer).
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Desactiva APIs de browser que el sitio no usa.
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // Fuerza HTTPS en el browser por 2 años (incl. subdominios). Los browsers ignoran
          // este header si la respuesta llega por HTTP plano, así que es seguro dejarlo
          // siempre activo (Vercel sirve el sitio solo por HTTPS).
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
}
export default nextConfig