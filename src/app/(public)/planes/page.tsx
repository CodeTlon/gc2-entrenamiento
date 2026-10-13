import type { Metadata } from 'next'
import { getSiteSettings, type Plan, type PlanCategoryItem } from '@/lib/content'
import { asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { plans as plansTable, planCategories } from '@/db/schema'
import MiniHero from '@/components/ui/MiniHero'
import PlanesContent from './PlanesContent'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Planes',
  description:
    'Planes personalizados para corredores y triatletas. Individual, grupal, presencial y a distancia.',
  alternates: { canonical: '/planes' },
}

export default async function PlanesPage() {
  const [plansData, catsData, settings] = await Promise.all([
    db.select().from(plansTable).orderBy(asc(plansTable.display_order)).catch(() => []),
    db
      .select({
        id: planCategories.id,
        name: planCategories.name,
        slug: planCategories.slug,
        display_order: planCategories.display_order,
      })
      .from(planCategories)
      .orderBy(asc(planCategories.display_order))
      .catch(() => []),
    getSiteSettings(),
  ])
  const plans = plansData as Plan[]
  const categories = catsData as PlanCategoryItem[]
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
