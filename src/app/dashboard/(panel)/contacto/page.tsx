import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import ContactForm from './ContactForm'

export default async function ContactSettingsPage() {
  const settings = await getSiteSettings()
  return (
    <div>
      <PageHeader
        eyebrow="Contacto"
        title="Datos de contacto"
        description="Información que aparece en el navbar, footer y sección de contacto."
      />
      <ContactForm initial={settings.contact} />
    </div>
  )
}
