import PageHeader from '@/components/dashboard/PageHeader'
import PlanCategoryForm from '../PlanCategoryForm'
import { db } from '@/lib/db'
import { planCategories } from '@/db/schema'

export default async function NewPlanCategoryPage() {
  const data = await db.select({ display_order: planCategories.display_order }).from(planCategories)
  const takenOrders = data.map((c) => c.display_order)

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
