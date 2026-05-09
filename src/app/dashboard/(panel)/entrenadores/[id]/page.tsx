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
  const { data, error } = await supabase.from('coaches').select('*').eq('id', id).single()
  if (error || !data) notFound()
  const coach = data as Coach

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
      <CoachForm coach={coach} />
    </div>
  )
}
