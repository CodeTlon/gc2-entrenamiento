import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import ScrollProgress from '@/components/ui/ScrollProgress'
import { getSiteSettings } from '@/lib/content'

// Dinámico: el layout lee contacto y redes de la base, y el build de Coolify corre sin base (prerenderizaría el contenido de respaldo).
export const dynamic = 'force-dynamic'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()
  const { contact } = settings

  return (
    <>
      <ScrollProgress />
      <Navbar contact={contact} />
      <main>{children}</main>
      <Footer contact={contact} />
    </>
  )
}
