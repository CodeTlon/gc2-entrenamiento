import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import GalleryForm from './GalleryForm'

export default async function GalleryEditPage() {
  const settings = await getSiteSettings()
  return (
    <div>
      <PageHeader
        eyebrow="Contenido"
        title="Galería del equipo"
        description="Grilla de fotos al final del home. La primera con 'large' ocupa 2 filas."
        back={{ href: '/dashboard/contenido', label: 'Volver a Contenido' }}
      />
      <GalleryForm initial={settings.team_gallery} />
    </div>
  )
}
