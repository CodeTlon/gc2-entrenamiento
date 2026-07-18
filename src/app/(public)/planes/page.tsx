import type { Metadata } from 'next'
import { getSiteSettings, type Plan, type PlanCategoryItem } from '@/lib/content'
import { createSupabaseClient } from '@/lib/supabase'
import MiniHero from '@/components/ui/MiniHero'
import PlanesContent from './PlanesContent'

export const metadata: Metadata = {
  title: 'Planes',
  description:
    'Planes personalizados para corredores y triatletas. Individual, grupal, presencial y a distancia.',
}

export default async function PlanesPage() {
  const supabase = createSupabaseClient()
  const [{ data: plansData }, { data: catsData }, settings] = await Promise.all([
    supabase.from('plans').select('*').order('display_order', { ascending: true }),
    supabase.from('plan_categories').select('id, name, slug, display_order').order('display_order', { ascending: true }),
    getSiteSettings(),
  ])
  const plans = (plansData ?? []) as Plan[]
  const categories = (catsData ?? []) as PlanCategoryItem[]
  const whatsappLink = settings.contact.whatsapp_link

  return (
    <>
      <MiniHero
        image={settings.page_banners.planes.bg_image}
        imageAlt="Corredor"
        titleWhite="ELEGÍ TU"
        titleAccent="PLAN"
      />
      <PlanesContent categories={categories} plans={plans} whatsappLink={whatsappLink} />
    </>
  )
}
