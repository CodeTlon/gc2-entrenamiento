import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import PageHeader from '@/components/dashboard/PageHeader'

const ITEMS = [
  { href: '/dashboard/contenido/hero', title: 'Hero (portada)', desc: 'Título principal, subtítulo, botones y métricas.' },
  { href: '/dashboard/contenido/nosotros', title: 'Nosotros', desc: 'Sección "Quiénes Somos" con párrafos y features.' },
  { href: '/dashboard/contenido/disciplinas', title: 'Disciplinas', desc: 'Las 3 tarjetas: running, duatlón y triatlón.' },
  { href: '/dashboard/contenido/clases-grupales', title: 'Clases grupales', desc: 'Horario, días y planes grupales destacados.' },
  { href: '/dashboard/contenido/galeria', title: 'Galería del equipo', desc: 'Grilla de fotos al final del home.' },
  { href: '/dashboard/contenido/banners', title: 'Banners de páginas', desc: 'Imagen de fondo de Planes, Blog y Contacto. Con punto focal y zoom.' },
]

export default function ContenidoHub() {
  return (
    <div>
      <PageHeader
        eyebrow="Contenido"
        title="Contenido del sitio"
        description="Editá cada sección del home. Los cambios se publican inmediatamente."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ITEMS.map(({ href, title, desc }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-xl p-5 transition-all hover:-translate-y-0.5 flex items-start gap-3"
            style={{ background: '#0D2247', border: '1px solid #102E66' }}
          >
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-bold text-white text-base uppercase tracking-wide mb-1">
                {title}
              </h3>
              <p className="text-white/50 text-sm">{desc}</p>
            </div>
            <ArrowRight
              size={16}
              className="text-white/30 group-hover:text-accent transition-colors mt-1"
            />
          </Link>
        ))}
      </div>
    </div>
  )
}
