import { notFound } from 'next/navigation'
import PageHeader from '@/components/dashboard/PageHeader'
import DeleteButton from '@/components/dashboard/DeleteButton'
import CoachForm from '../CoachForm'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { deleteCoachAction } from '@/actions/coaches'
import type { Coach } from '@/lib/content'

export default async function EditCoachPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const [{ data, error }, { data: ordersData }] = await Promise.all([
    supabase.from('coaches').select('*').eq('id', id).single(),
    supabase.from('coaches').select('id, display_order'),
  ])

  if (error || !data) notFound()
  const coach = data as Coach
  const takenOrders = (ordersData ?? [])
    .filter((c) => c.id !== id)
    .map((c) => c.display_order as number)

  return (
    <div>
      <PageHeader
        eyebrow="Equipo"
        title={coach.name}
        back={{ href: '/dashboard/entrenadores', label: 'Volver al listado' }}
        actions={
          <DeleteButton
            action={deleteCoachAction}
            id={coach.id}
            confirmText={`¿Eliminar a ${coach.name}? Esta acción no se puede deshacer.`}
          />
        }
      />
      <CoachForm coach={coach} takenOrders={takenOrders} />
    </div>
  )
}
