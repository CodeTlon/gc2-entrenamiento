import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import DisciplinesForm from './DisciplinesForm'

export default async function DisciplinesEditPage() {
  const settings = await getSiteSettings()
  return (
    <div>
      <PageHeader
        eyebrow="Contenido"
        title="Disciplinas"
        description="Las 3 tarjetas: running, duatlón y triatlón."
        back={{ href: '/dashboard/contenido', label: 'Volver a Contenido' }}
      />
      <DisciplinesForm initial={settings.disciplines} />
    </div>
  )
}
