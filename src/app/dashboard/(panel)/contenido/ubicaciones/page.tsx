import PageHeader from '@/components/dashboard/PageHeader'
import LocationsForm from './LocationsForm'
import { getSiteSettings } from '@/lib/content'

export default async function UbicacionesPage() {
  const settings = await getSiteSettings()
  return (
    <div>
      <PageHeader
        eyebrow="Contenido"
        title="Sedes / Ubicaciones"
        description="Dónde entrena el equipo. Agregá o quitá sedes, editá horarios y pegá el embed de Google Maps."
        back={{ href: '/dashboard/contenido', label: 'Volver al contenido' }}
      />
      <LocationsForm initial={settings.locations} />
    </div>
  )
}
