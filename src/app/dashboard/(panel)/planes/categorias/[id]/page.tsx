import { notFound } from 'next/navigation'
import PageHeader from '@/components/dashboard/PageHeader'
import DeleteButton from '@/components/dashboard/DeleteButton'
import PlanCategoryForm from '../PlanCategoryForm'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { deletePlanCategoryAction } from '@/actions/plan-categories'

export default async function EditPlanCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const [{ data, error }, { data: others }] = await Promise.all([
    supabase.from('plan_categories').select('id, name, slug, display_order').eq('id', id).single(),
    supabase.from('plan_categories').select('display_order').neq('id', id),
  ])
  if (error || !data) notFound()
  const takenOrders = others?.map((c) => c.display_order) ?? []

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
