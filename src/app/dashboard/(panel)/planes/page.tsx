import Link from 'next/link'
import { Plus, Tag } from 'lucide-react'
import PageHeader from '@/components/dashboard/PageHeader'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Plan, PlanCategoryItem } from '@/lib/content'

export default async function PlansListPage() {
  const supabase = await createSupabaseServerClient()
  const [{ data: plansData }, { data: catsData }] = await Promise.all([
    supabase.from('plans').select('*').order('display_order', { ascending: true }),
    supabase.from('plan_categories').select('id, name, slug, display_order').order('display_order', { ascending: true }),
  ])
  const plans = (plansData ?? []) as Plan[]
  const categories = (catsData ?? []) as PlanCategoryItem[]
  const grouped = categories.map((cat) => ({
    cat,
    plans: plans.filter((p) => p.plan_category_id === cat.id),
  }))
  const uncategorized = plans.filter((p) => !p.plan_category_id)

  return (
    <div>
      <PageHeader
        eyebrow="Planes"
        title="Planes"
        description="Administrá los planes que se ven en /planes."
        actions={
          <div className="flex gap-2">
            <Link
              href="/dashboard/planes/categorias"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-white/65 hover:text-accent transition-colors"
              style={{ border: '1px solid #102E66' }}
            >
              <Tag size={13} /> Categorías
            </Link>
            <Link href="/dashboard/planes/nuevo" className="btn btn--primary text-sm">
              <Plus size={14} /> Nuevo plan
            </Link>
          </div>
        }
      />

      {grouped.map(({ cat, plans: catPlans }) => (
        <section key={cat.id} className="mb-8">
          <h2 className="font-heading font-bold text-white text-base uppercase tracking-wide mb-3 flex items-center gap-2">
            {cat.name}
            <span className="text-white/35 text-xs font-body font-normal normal-case">
              {catPlans.length} {catPlans.length === 1 ? 'plan' : 'planes'}
            </span>
          </h2>
          {catPlans.length === 0 ? (
            <p className="text-white/35 text-sm">Sin planes en esta categoría.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {catPlans.map((p) => <PlanRow key={p.id} plan={p} />)}
            </div>
          )}
        </section>
      ))}

      {uncategorized.length > 0 && (
        <section className="mb-8">
          <h2 className="font-heading font-bold text-white/40 text-base uppercase tracking-wide mb-3">
            Sin categoría
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {uncategorized.map((p) => <PlanRow key={p.id} plan={p} />)}
          </div>
        </section>
      )}

      {plans.length === 0 && (
        <p className="text-white/45 text-sm">No hay planes todavía.</p>
      )}
    </div>
  )
}

function PlanRow({ plan }: { plan: Plan }) {
  return (
    <Link
      href={`/dashboard/planes/${plan.id}`}
      className="rounded-xl p-4 hover:-translate-y-0.5 transition-all flex items-center gap-3"
      style={{
        background: '#0D2247',
        border: plan.featured ? '1px solid #2563EB' : '1px solid #102E66',
      }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-accent text-[11px] font-body font-bold uppercase truncate" style={{ letterSpacing: '2px' }}>
            Plan {plan.name_display ?? plan.name}
          </p>
          {plan.badge && (
            <span
              className="flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-body font-bold uppercase tracking-wider text-blue-900"
              style={{ background: '#38BDF8' }}
            >
              {plan.badge}
            </span>
          )}
        </div>
        <p className="text-white/40 text-xs">
          {plan.features.length} {plan.features.length === 1 ? 'característica' : 'características'}
        </p>
      </div>
    </Link>
  )
}
