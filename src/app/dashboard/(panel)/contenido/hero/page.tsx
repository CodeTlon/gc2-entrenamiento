import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import HeroForm from './HeroForm'

export default async function HeroEditPage() {
  const settings = await getSiteSettings()
  return (
    <div>
      <PageHeader
        eyebrow="Contenido"
        title="Hero (portada)"
        description="El bloque que se ve apenas se entra al sitio."
        back={{ href: '/dashboard/contenido', label: 'Volver a Contenido' }}
      />
      <HeroForm initial={settings.hero} />
    </div>
  )
}
