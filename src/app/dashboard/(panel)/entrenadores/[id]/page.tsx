import { notFound } from 'next/navigation'
import PageHeader from '@/components/dashboard/PageHeader'
import DeleteButton from '@/components/dashboard/DeleteButton'
import CoachForm from '../CoachForm'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { coaches } from '@/db/schema'
import { isUuid } from '@/db/queries'
import { deleteCoachAction } from '@/actions/coaches'
import type { Coach } from '@/lib/content'

export default async function EditCoachPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isUuid(id)) notFound()
  const [[data], ordersData] = await Promise.all([
    db.select().from(coaches).where(eq(coaches.id, id)).limit(1),
    db.select({ id: coaches.id, display_order: coaches.display_order }).from(coaches),
  ])

  if (!data) notFound()
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
