import PageHeader from '@/components/dashboard/PageHeader'
import CoachForm from '../CoachForm'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function NewCoachPage() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from('coaches').select('display_order')
  const takenOrders = data?.map((c) => c.display_order as number) ?? []

  return (
    <div>
      <PageHeader
        eyebrow="Equipo"
        title="Nuevo entrenador"
        back={{ href: '/dashboard/entrenadores', label: 'Volver al listado' }}
      />
      <CoachForm takenOrders={takenOrders} />
    </div>
  )
}
