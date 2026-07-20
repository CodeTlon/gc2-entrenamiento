import type { Metadata } from 'next'
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import Disciplines from '@/components/sections/Disciplines'
import GroupClasses from '@/components/sections/GroupClasses'
import Locations from '@/components/sections/Locations'
import Coaches from '@/components/sections/Coaches'
import TeamGallery from '@/components/sections/TeamGallery'
import { getCoaches, getSiteSettings } from '@/lib/content'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'GC² Entrenamiento de la Resistencia | Corredores, Duatletas & Triatletas',
  description:
    'Equipo de entrenamiento para corredores, duatletas y triatletas. Planificación individualizada y grupal, presencial y a distancia. Córdoba, Argentina.',
}

export default async function HomePage() {
  const [settings, coaches] = await Promise.all([getSiteSettings(), getCoaches()])

  return (
    <>
      <Hero data={settings.hero} />
      <About data={settings.about} />
      <Disciplines data={settings.disciplines} />
      <GroupClasses data={settings.group_classes} />
      <Locations data={settings.locations} />
      <Coaches coaches={coaches} />
      <TeamGallery data={settings.team_gallery} />
    </>
  )
}
