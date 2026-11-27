import { notFound } from 'next/navigation'
import PageHeader from '@/components/dashboard/PageHeader'
import DeleteButton from '@/components/dashboard/DeleteButton'
import PlanCategoryForm from '../PlanCategoryForm'
import { eq, ne } from 'drizzle-orm'
import { db } from '@/lib/db'
import { planCategories } from '@/db/schema'
import { isUuid } from '@/db/queries'
import { deletePlanCategoryAction } from '@/actions/plan-categories'

export default async function EditPlanCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!isUuid(id)) notFound()
  const [[data], others] = await Promise.all([
    db
      .select({
        id: planCategories.id,
        name: planCategories.name,
        slug: planCategories.slug,
        display_order: planCategories.display_order,
      })
      .from(planCategories)
      .where(eq(planCategories.id, id))
      .limit(1),
    db.select({ display_order: planCategories.display_order }).from(planCategories).where(ne(planCategories.id, id)),
  ])
  if (!data) notFound()
  const takenOrders = others.map((c) => c.display_order)

  return (
    <div>
      <PageHeader
        eyebrow="Categorías de planes"
        title={data.name}
        back={{ href: '/dashboard/planes/categorias', label: 'Volver a categorías' }}
        actions={
          <DeleteButton
            action={deletePlanCategoryAction}
            id={data.id}
            confirmText={`¿Eliminar "${data.name}"? Los planes vinculados quedarán sin categoría.`}
          />
        }
      />
      <PlanCategoryForm category={data} takenOrders={takenOrders} />
    </div>
  )
}
