import type { Metadata } from 'next'
import type { Viewport } from 'next'
import { Barlow, Barlow_Condensed } from 'next/font/google'
import './globals.css'
import GoogleAnalytics from '@/components/ui/GoogleAnalytics'

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-barlow',
  display: 'swap',
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  variable: '--font-barlow-condensed',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gc2entrenamientoderesistencia.com.ar',
  ),
  icons: {
    icon: [
      { url: '/favicon-light-mode.ico', media: '(prefers-color-scheme: light)' },
      { url: '/favicon-dark-mode.ico', media: '(prefers-color-scheme: dark)' },
    ],
  },
  title: {
    default: 'GC² Entrenamiento de la Resistencia | Córdoba',
    template: '%s | GC² Entrenamiento',
  },
  description:
    'Equipo de entrenamiento para corredores, duatletas y triatletas. Planificación individualizada y grupal, presencial y a distancia. Córdoba, Argentina.',
  keywords: [
    'entrenamiento running Córdoba',
    'triatlón Córdoba',
    'duatlón Córdoba',
    'entrenador running',
    'plan de entrenamiento triatlón',
    'clases grupales running Córdoba',
    'GC2 entrenamiento',
  ],
  authors: [{ name: 'GC² Entrenamiento' }],
  creator: 'CodeTlon',
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://gc2entrenamientoderesistencia.com.ar',
    siteName: 'GC² Entrenamiento de la Resistencia',
    title: 'GC² Entrenamiento de la Resistencia | Córdoba',
    description:
      'Equipo de entrenamiento para corredores, duatletas y triatletas en Córdoba, Argentina.',
    images: [
      {
        url: '/images/hero-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'GC² Entrenamiento de la Resistencia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GC² Entrenamiento de la Resistencia',
    description: 'Entrenamiento para corredores, duatletas y triatletas en Córdoba.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A1628',
}

const schemaOrg = {
  '@context': 'https://schema.org',
  '@type': 'SportsOrganization',
  name: 'GC² Entrenamiento de la Resistencia',
  description:
    'Equipo de entrenamiento para corredores, duatletas y triatletas. Planificación individualizada y grupal, presencial y a distancia.',
  url: 'https://gc2entrenamientoderesistencia.com.ar',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Córdoba',
    addressCountry: 'AR',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'gc2entrenamiento@gmail.com',
    contactType: 'customer service',
  },
  sameAs: ['https://www.instagram.com/gc2entrenamientoderesistencia'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="es"
      className={`${barlow.variable} ${barlowCondensed.variable}`}
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="preload" as="image" href="/_next/image?url=%2Fimages%2Flogo.png&w=128&q=75" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body className="bg-blue-900 text-white font-body">
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        {children}
      </body>
    </html>
  )
}
