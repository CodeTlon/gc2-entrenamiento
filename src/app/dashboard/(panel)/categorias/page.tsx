import Link from 'next/link'
import { Plus, Tag } from 'lucide-react'
import PageHeader from '@/components/dashboard/PageHeader'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function CategoriasListPage() {
  const supabase = await createSupabaseServerClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, display_order')
    .order('display_order', { ascending: true })

  const list = categories ?? []

  return (
    <div>
      <PageHeader
        eyebrow="Blog"
        title="Categorías"
        description="Creá y editá las categorías que aparecen como filtros en el blog."
        actions={
          <Link href="/dashboard/categorias/nuevo" className="btn btn--primary text-sm">
            <Plus size={14} /> Nueva categoría
          </Link>
        }
      />

      {list.length === 0 ? (
        <p className="text-white/45 text-sm">No hay categorías cargadas todavía.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {list.map((cat) => (
            <Link
              key={cat.id}
              href={`/dashboard/categorias/${cat.id}`}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:-translate-y-0.5 transition-all"
              style={{ background: '#0D2247', border: '1px solid #102E66' }}
            >
              <Tag size={15} className="text-accent flex-shrink-0" />
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
