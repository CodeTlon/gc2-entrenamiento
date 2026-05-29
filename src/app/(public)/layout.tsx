import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import ScrollProgress from '@/components/ui/ScrollProgress'
import InviteHandler from '@/components/ui/InviteHandler'
import { getSiteSettings } from '@/lib/content'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()
  const { contact } = settings

  return (
    <>
      <InviteHandler />
      <ScrollProgress />
      <Navbar contact={contact} />
      <main>{children}</main>
      <Footer contact={contact} />
    </>
  )
}
