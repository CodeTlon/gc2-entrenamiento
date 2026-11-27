import PageHeader from '@/components/dashboard/PageHeader'
import PlanForm from '../PlanForm'
import { asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { planCategories } from '@/db/schema'

export default async function NewPlanPage() {
  const data = await db
    .select({ id: planCategories.id, name: planCategories.name, slug: planCategories.slug })
    .from(planCategories)
    .orderBy(asc(planCategories.display_order))

  return (
    <div>
      <PageHeader
        eyebrow="Planes"
        title="Nuevo plan"
        back={{ href: '/dashboard/planes', label: 'Volver a planes' }}
      />
      <PlanForm categories={data ?? []} />
    </div>
  )
}
