import { notFound } from 'next/navigation'
import PageHeader from '@/components/dashboard/PageHeader'
import DeleteButton from '@/components/dashboard/DeleteButton'
import PlanForm from '../PlanForm'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { deletePlanAction } from '@/actions/plans'
import type { Plan } from '@/lib/content'

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const [{ data, error }, { data: cats }] = await Promise.all([
    supabase.from('plans').select('*').eq('id', id).single(),
    supabase
      .from('plan_categories')
      .select('id, name, slug')
      .order('display_order', { ascending: true }),
  ])
  if (error || !data) notFound()
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
