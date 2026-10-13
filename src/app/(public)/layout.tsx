import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import ScrollProgress from '@/components/ui/ScrollProgress'
import { getSiteSettings } from '@/lib/content'

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
