import Link from 'next/link'
import { Users, ListChecks, FileText, Tag, Settings, ArrowRight, LayoutGrid, Inbox } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase-server'

const SECTIONS = [
  {
    href: '/dashboard/contenido',
    title: 'Contenido del sitio',
    desc: 'Editá hero, sección "Nosotros", disciplinas, clases grupales y galería.',
    icon: LayoutGrid,
  },
  {
    href: '/dashboard/entrenadores',
    title: 'Entrenadores',
    desc: 'Editá perfiles, fotos, bio y certificaciones del equipo.',
    icon: Users,
  },
  {
    href: '/dashboard/planes',
    title: 'Planes',
    desc: 'Administrá los planes para corredores, triatletas y grupales.',
    icon: ListChecks,
  },
  {
    href: '/dashboard/blog',
    title: 'Blog',
    desc: 'Publicá artículos. Podés subir imágenes o incrustar videos de YouTube.',
    icon: FileText,
  },
  {
    href: '/dashboard/categorias',
    title: 'Categorías del blog',
    desc: 'Creá y editá las categorías que filtran los artículos del blog.',
    icon: Tag,
  },
  {
    href: '/dashboard/leads',
    title: 'Consultas recibidas',
    desc: 'Mensajes enviados desde el formulario de contacto del sitio.',
    icon: Inbox,
  },
  {
    href: '/dashboard/contacto',
    title: 'Datos de contacto',
    desc: 'Actualizá teléfono, email, WhatsApp e Instagram.',
    icon: Settings,
  },
]

export default async function DashboardHome() {
  const supabase = await createSupabaseServerClient()

  const serviceSupabase = (await import('@/lib/supabase')).createSupabaseServiceClient()

  const [
    { count: coachesCount },
    { count: plansCount },
    { count: postsCount },
    { count: leadsCount },
  ] = await Promise.all([
    supabase.from('coaches').select('*', { count: 'exact', head: true }),
    supabase.from('plans').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    serviceSupabase.from('contact_leads').select('*', { count: 'exact', head: true }),
  ])

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <p className="text-accent text-[11px] font-body font-bold uppercase tracking-[3px] mb-1">
          Panel
        </p>
        <h1 className="font-heading font-extrabold text-white text-2xl md:text-3xl uppercase leading-tight">
          Bienvenidos
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Desde acá podés editar toda la información pública del sitio.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Entrenadores" value={coachesCount ?? 0} href="/dashboard/entrenadores" />
        <StatCard label="Planes" value={plansCount ?? 0} href="/dashboard/planes" />
        <StatCard label="Artículos" value={postsCount ?? 0} href="/dashboard/blog" />
        <StatCard label="Consultas" value={leadsCount ?? 0} href="/dashboard/leads" accent />
      </div>

      {/* Sections */}
      <div className="space-y-2">
        {SECTIONS.map(({ href, title, desc, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 px-5 py-4 rounded-xl transition-all hover:-translate-y-0.5"
            style={{ background: '#0D2247', border: '1px solid #102E66' }}
          >
            <span
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-accent"
              style={{ background: '#102E66' }}
            >
              <Icon size={16} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-body font-semibold text-white text-sm leading-none mb-0.5">
                {title}
              </p>
              <p className="text-white/40 text-xs leading-snug truncate">{desc}</p>
            </div>
            <ArrowRight size={15} className="text-white/20 group-hover:text-accent transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>

    </div>
  )
}

function StatCard({ label, value, href, accent }: { label: string; value: number; href: string; accent?: boolean }) {
  return (
    <Link
      href={href}
      className="rounded-xl p-4 flex flex-col gap-1 hover:-translate-y-0.5 transition-all"
      style={{ background: '#0D2247', border: `1px solid ${accent ? 'rgba(56,189,248,0.3)' : '#102E66'}` }}
    >
      <p className="text-white/40 text-[10px] font-body font-bold uppercase tracking-wider leading-none">
        {label}
      </p>
      <p className={`font-heading font-black text-3xl leading-none ${accent ? 'text-accent' : 'text-white'}`}>
        {value}
      </p>
    </Link>
  )
}
