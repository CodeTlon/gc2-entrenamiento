import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import GroupClassesForm from './GroupClassesForm'

export default async function GroupClassesEditPage() {
  const settings = await getSiteSettings()
  return (
    <div>
      <PageHeader
        eyebrow="Contenido"
        title="Clases grupales"
        description="Horario, días y planes que se muestran en la sección grupal."
        back={{ href: '/dashboard/contenido', label: 'Volver a Contenido' }}
      />
      <GroupClassesForm initial={settings.group_classes} />
    </div>
  )
}
