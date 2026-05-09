import Link from 'next/link'
import Image from 'next/image'
import { Plus, Instagram } from 'lucide-react'
import PageHeader from '@/components/dashboard/PageHeader'
import { getCoaches } from '@/lib/content'

export default async function CoachesListPage() {
  const coaches = await getCoaches()

  return (
    <div>
      <PageHeader
        eyebrow="Equipo"
        title="Entrenadores"
        description="Listado del equipo. Editá cada perfil o sumá uno nuevo."
        actions={
          <Link href="/dashboard/entrenadores/nuevo" className="btn btn--primary text-sm">
            <Plus size={14} /> Nuevo entrenador
          </Link>
        }
      />

      {coaches.length === 0 && (
        <p className="text-white/45 text-sm">No hay entrenadores cargados.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coaches.map((c) => (
          <Link
            key={c.id}
            href={`/dashboard/entrenadores/${c.id}`}
            className="rounded-xl overflow-hidden flex hover:-translate-y-0.5 transition-all group"
            style={{ background: '#0D2247', border: '1px solid #102E66' }}
          >
            <div className="relative w-28 flex-shrink-0" style={{ background: '#102E66' }}>
              {c.photo_url ? (
                <Image
                  src={c.photo_url}
                  alt={c.name}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="flex-1 p-4 min-w-0">
              <p
                className="text-accent text-[11px] font-body font-bold uppercase mb-1"
                style={{ letterSpacing: '2px' }}
              >
                {c.specialty}
              </p>
              <h3 className="font-heading font-bold text-white text-lg uppercase tracking-wide truncate">
                {c.name}
              </h3>
              <p className="text-white/50 text-sm line-clamp-2 mt-1">{c.short_desc}</p>
              {c.ig_handle && (
                <span className="inline-flex items-center gap-1 text-white/40 text-xs mt-2">
                  <Instagram size={12} /> {c.ig_handle}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
