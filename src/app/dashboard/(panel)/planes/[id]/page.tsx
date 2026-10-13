import { notFound } from 'next/navigation'
import PageHeader from '@/components/dashboard/PageHeader'
import DeleteButton from '@/components/dashboard/DeleteButton'
import PlanForm from '../PlanForm'
import { asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { plans, planCategories } from '@/db/schema'
import { isUuid } from '@/db/queries'
import { deletePlanAction } from '@/actions/plans'
import type { Plan } from '@/lib/content'

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isUuid(id)) notFound()
  const [[data], cats] = await Promise.all([
    db.select().from(plans).where(eq(plans.id, id)).limit(1),
    db
      .select({ id: planCategories.id, name: planCategories.name, slug: planCategories.slug })
      .from(planCategories)
      .orderBy(asc(planCategories.display_order)),
  ])
  if (!data) notFound()
  const plan = data as Plan

  return (
    <div>
      <PageHeader
        eyebrow="Planes"
        title={`Plan ${plan.name_display ?? plan.name}`}
        back={{ href: '/dashboard/planes', label: 'Volver a planes' }}
        actions={
          <DeleteButton
            action={deletePlanAction}
            id={plan.id}
            confirmText="¿Eliminar este plan? No se puede deshacer."
          />
        }
      />
      <PlanForm plan={plan} categories={cats ?? []} />
    </div>
  )
}
