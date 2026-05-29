import PageHeader from '@/components/dashboard/PageHeader'
import PlanCategoryForm from '../PlanCategoryForm'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function NewPlanCategoryPage() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from('plan_categories').select('display_order')
  const takenOrders = data?.map((c) => c.display_order) ?? []

  return (
    <div>
      <PageHeader
        eyebrow="Categorías de planes"
        title="Nueva categoría"
        back={{ href: '/dashboard/planes/categorias', label: 'Volver a categorías' }}
      />
      <PlanCategoryForm takenOrders={takenOrders} />
    </div>
  )
}
