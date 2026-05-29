import Link from 'next/link'
import { createSupabaseServiceClient } from '@/lib/supabase'
import PageHeader from '@/components/dashboard/PageHeader'
import { formatDate } from '@/lib/utils'
import { Mail, Phone, MapPin, MessageSquare, User, Tag, ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 20

interface Lead {
  id: string
  nombre: string
  email: string
  telefono: string
  ciudad: string | null
  servicio: string | null
  objetivo: string | null
  mensaje: string
  coach: string | null
  created_at: string
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam ?? 1))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = createSupabaseServiceClient()
  const { data, error, count } = await supabase
    .from('contact_leads')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  const leads: Lead[] = data ?? []
  const total = count ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div>
      <PageHeader
        eyebrow="Formulario de contacto"
        title="Consultas recibidas"
        description={total > 0 ? `${total} consulta${total !== 1 ? 's' : ''} en total.` : 'Todos los mensajes enviados desde el formulario del sitio.'}
      />

      {error && (
        <p className="text-red-400 text-sm mb-6">Error al cargar consultas: {error.message}</p>
      )}

      {leads.length === 0 && !error && (
        <div
          className="rounded-xl p-10 text-center"
          style={{ background: '#0D2247', border: '1px solid #102E66' }}
        >
          <MessageSquare size={28} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">Todavía no hay consultas recibidas.</p>
        </div>
      )}

      <div className="space-y-3">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-white/40 text-sm">
            Página {page} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link
                href={`/dashboard/leads?page=${page - 1}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-white/65 hover:text-white transition-colors"
                style={{ border: '1px solid #102E66' }}
              >
                <ChevronLeft size={14} /> Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/dashboard/leads?page=${page + 1}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-white/65 hover:text-white transition-colors"
                style={{ border: '1px solid #102E66' }}
              >
                Siguiente <ChevronRight size={14} />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function LeadCard({ lead }: { lead: Lead }) {
  return (
    <div
      className="rounded-xl p-5 space-y-4"
      style={{ background: '#0D2247', border: '1px solid #102E66' }}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-heading font-bold text-white text-lg uppercase leading-tight">
            {lead.nombre}
          </p>
          <p className="text-white/35 text-xs mt-0.5">{formatDate(lead.created_at)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {lead.servicio && (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(56,189,248,0.12)', color: '#38BDF8', border: '1px solid rgba(56,189,248,0.25)' }}
            >
              <Tag size={10} /> {lead.servicio}
            </span>
          )}
          {lead.coach && (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <User size={10} /> {lead.coach}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        <InfoRow icon={Mail} text={lead.email} href={`mailto:${lead.email}`} />
        <InfoRow icon={Phone} text={lead.telefono} href={`tel:${lead.telefono}`} />
        {lead.ciudad && <InfoRow icon={MapPin} text={lead.ciudad} />}
      </div>

      {lead.objetivo && (
        <p className="text-white/55 text-sm">
          <span className="text-white/35 font-semibold">Objetivo: </span>
          {lead.objetivo}
        </p>
      )}

      <div
        className="rounded-lg p-4"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="text-white/35 text-xs font-semibold uppercase tracking-wider mb-2">Mensaje</p>
        <p className="text-white/75 text-sm leading-relaxed whitespace-pre-wrap">{lead.mensaje}</p>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, text, href }: { icon: React.ElementType; text: string; href?: string }) {
  const content = (
    <span className="inline-flex items-center gap-2 text-sm text-white/65">
      <Icon size={13} className="text-accent flex-shrink-0" />
      {text}
    </span>
  )
  if (href) return <a href={href} className="hover:text-accent transition-colors">{content}</a>
  return <div>{content}</div>
}
