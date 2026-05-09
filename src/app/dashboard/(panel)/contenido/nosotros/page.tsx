import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import AboutForm from './AboutForm'

export default async function AboutEditPage() {
  const settings = await getSiteSettings()
  return (
    <div>
      <PageHeader
        eyebrow="Contenido"
        title="Nosotros"
        description="Sección institucional con párrafos y features."
        back={{ href: '/dashboard/contenido', label: 'Volver a Contenido' }}
      />
      <AboutForm initial={settings.about} />
    </div>
  )
}
