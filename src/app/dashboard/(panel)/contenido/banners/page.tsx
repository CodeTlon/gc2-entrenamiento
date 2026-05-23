import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import BannersForm from './BannersForm'

export default async function BannersEditPage() {
  const settings = await getSiteSettings()
  return (
    <div>
      <PageHeader
        eyebrow="Contenido"
        title="Banners de páginas"
        description="Imagen de fondo de las páginas interiores: Planes, Blog y Contacto. Podés ajustar el punto focal y el zoom."
        back={{ href: '/dashboard/contenido', label: 'Volver a Contenido' }}
      />
      <BannersForm initial={settings.page_banners} />
    </div>
  )
}
