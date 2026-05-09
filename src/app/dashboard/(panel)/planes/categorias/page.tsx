import Link from 'next/link'
import { Plus, Tag } from 'lucide-react'
import PageHeader from '@/components/dashboard/PageHeader'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function PlanCategoriasPage() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('plan_categories')
    .select('id, name, slug, display_order')
    .order('display_order', { ascending: true })

  const list = data ?? []

  return (
    <div>
      <PageHeader
        eyebrow="Planes"
        title="Categorías de planes"
        description="Las categorías agrupan los planes en la página pública."
        back={{ href: '/dashboard/planes', label: 'Volver a planes' }}
        actions={
          <Link href="/dashboard/planes/categorias/nuevo" className="btn btn--primary text-sm">
            <Plus size={14} /> Nueva categoría
          </Link>
        }
      />

      {list.length === 0 ? (
        <p className="text-white/45 text-sm">No hay categorías todavía.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {list.map((cat) => (
            <Link
              key={cat.id}
              href={`/dashboard/planes/categorias/${cat.id}`}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:-translate-y-0.5 transition-all"
              style={{ background: '#0D2247', border: '1px solid #102E66' }}
            >
              <Tag size={14} className="text-accent flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-white font-body font-semibold text-sm truncate">{cat.name}</p>
                <p className="text-white/35 text-xs mt-0.5">/{cat.slug}</p>
              </div>
              <span className="ml-auto text-white/25 text-xs flex-shrink-0">#{cat.display_order}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
