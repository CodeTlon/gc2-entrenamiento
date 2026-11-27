import PageHeader from '@/components/dashboard/PageHeader'
import CoachForm from '../CoachForm'
import { db } from '@/lib/db'
import { coaches } from '@/db/schema'

export default async function NewCoachPage() {
  const data = await db.select({ display_order: coaches.display_order }).from(coaches)
  const takenOrders = data.map((c) => c.display_order)

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
