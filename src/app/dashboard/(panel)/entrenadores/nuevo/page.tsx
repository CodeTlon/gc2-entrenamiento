import PageHeader from '@/components/dashboard/PageHeader'
import CoachForm from '../CoachForm'

export default function NewCoachPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Equipo"
        title="Nuevo entrenador"
        back={{ href: '/dashboard/entrenadores', label: 'Volver al listado' }}
      />
      <CoachForm />
    </div>
  )
}
