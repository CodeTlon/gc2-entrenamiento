import PageHeader from '@/components/dashboard/PageHeader'
import PlanForm from '../PlanForm'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function NewPlanPage() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('plan_categories')
    .select('id, name, slug')
    .order('display_order', { ascending: true })

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
