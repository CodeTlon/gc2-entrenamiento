import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import ScrollProgress from '@/components/ui/ScrollProgress'
import InviteHandler from '@/components/ui/InviteHandler'
import BackToTop from '@/components/ui/BackToTop'
import StickyMobileCTA from '@/components/ui/StickyMobileCTA'
import { getSiteSettings } from '@/lib/content'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()
  const { contact } = settings

  return (
    <>
      <InviteHandler />
      <ScrollProgress />
      <Navbar contact={contact} />
      {/* pb-20: reserva el espacio de StickyMobileCTA en mobile para que no tape el final del contenido */}
      <main className="pb-20 md:pb-0">{children}</main>
      <Footer contact={contact} />
      <BackToTop />
      <StickyMobileCTA whatsappLink={contact.whatsapp_link} />
    </>
  )
}
