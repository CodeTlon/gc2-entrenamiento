import { createSupabaseClient } from '@/lib/supabase'
import {
  COACHES as COACHES_FALLBACK,
  GROUP_PLANS,
  RUNNER_PLANS,
  TRIATHLON_PLANS,
  IMG_HERO,
  IMG_ABOUT,
  IMG_RUNNING,
  IMG_CYCLING,
  IMG_SWIMMING,
  IMG_GROUP,
  IMG_GROUP_SIDE,
  PHONE,
  PHONE_DISPLAY,
  EMAIL,
  WHATSAPP_LINK,
  INSTAGRAM_USER,
  INSTAGRAM_LINK,
  SITE_CITY,
} from '@/lib/constants'

// =========================================================
// Tipos
// =========================================================
export interface Coach {
  id: string
  slug: string
  name: string
  specialty: string
  short_desc: string
  bio_long: string
  photo_url: string | null
  ig_handle: string | null
  ig_url: string | null
  certifications: string[]
  achievements: string[]
  services: string[]
  display_order: number
}

export type PlanCategory = string

export interface PlanCategoryItem {
  id: string
  name: string
  slug: string
  display_order: number
}

export interface Plan {
  id: string
  category: PlanCategory
  plan_category_id: string | null
  name: string
  name_display: string | null
  badge: string | null
  features: string[]
  featured: boolean
  display_order: number
}

export interface HeroSettings {
  title_line_1: string
  title_line_2: string
  subtitle: string
  cta_primary_label: string
  cta_primary_href: string
  cta_secondary_label: string
  cta_secondary_href: string
  bg_image: string
  stats: { number: string; label: string }[]
}

export interface AboutSettings {
  label: string
  title_line_1: string
  title_line_2: string
  paragraphs: string[]
  features: string[]
  image: string
}

export interface DisciplineItem {
  title: string
  sub: string
  desc: string
  image: string
}

export interface DisciplinesSettings {
  label: string
  title_line_1: string
  title_line_2: string
  items: DisciplineItem[]
}

export interface GroupClassesSettings {
  label: string
  title_line_1: string
  title_line_2: string
  time: string
  days: string[]
  plans: { name: string; desc: string }[]
  bg_image: string
  side_image: string
}

export interface TeamGalleryItem {
  image: string
  label: string
  large: boolean
}

export interface TeamGallerySettings {
  label: string
  title_line_1: string
  title_line_2: string
  description: string
  items: TeamGalleryItem[]
}

export interface ContactSettings {
  phone: string
  phone_display: string
  email: string
  whatsapp_link: string
  instagram_user: string
  instagram_link: string
  city: string
}

export interface SiteSettings {
  hero: HeroSettings
  about: AboutSettings
  disciplines: DisciplinesSettings
  group_classes: GroupClassesSettings
  team_gallery: TeamGallerySettings
  contact: ContactSettings
}

// =========================================================
// Fallbacks (lo que hoy ya muestra el sitio).
// Si la DB está vacía o no responde, se usan estos.
// =========================================================
const FALLBACK_HERO: HeroSettings = {
  title_line_1: 'SUPERÁ',
  title_line_2: 'TUS LÍMITES',
  subtitle:
    'Equipo de entrenamiento para <strong>corredores, duatletas y triatletas</strong>. Planificación individualizada y grupal, presencial y a distancia.',
  cta_primary_label: 'Ver Planes',
  cta_primary_href: '/planes',
  cta_secondary_label: '¡Contactános!',
  cta_secondary_href: '/contacto',
  bg_image: IMG_HERO,
  stats: [
    { number: '3', label: 'Disciplinas' },
    { number: '6+', label: 'Planes' },
    { number: 'Grupal', label: '& Individual' },
    { number: 'Presencial', label: '& Distancia' },
  ],
}

const FALLBACK_ABOUT: AboutSettings = {
  label: 'Quiénes Somos',
  title_line_1: 'EQUIPO DE ENTRENAMIENTO DE',
  title_line_2: 'DEPORTES DE RESISTENCIA',
  paragraphs: [
    'Somos un equipo dedicado a la planificación y entrenamiento de deportes de resistencia para <strong>corredores, duatletas y triatletas</strong> de todos los niveles y distancias.',
    'Ofrecemos entrenamiento <strong>individual y grupal</strong>, tanto <strong>presencial como a distancia</strong>, con evaluación funcional, testeos y planes de gimnasio personalizados.',
  ],
  features: [
    'Planificación individualizada para cada atleta',
    'Evaluación funcional y testeos periódicos',
    'Entrenamiento presencial y a distancia',
    'Planes de gimnasio complementarios',
  ],
  image: IMG_ABOUT,
}

const FALLBACK_DISCIPLINES: DisciplinesSettings = {
  label: '● Disciplinas',
  title_line_1: 'TRES CAMINOS,',
  title_line_2: 'UN OBJETIVO',
  items: [
    { title: 'RUNNING', sub: 'Corredores', desc: 'Planes para todos los niveles y distancias. Desde 5K hasta ultra maratón.', image: IMG_RUNNING },
    { title: 'DUATLÓN', sub: 'Duatletas', desc: 'Preparación integral para competencias de carrera y ciclismo.', image: IMG_CYCLING },
    { title: 'TRIATLÓN', sub: 'Triatletas', desc: 'Entrenamiento completo: natación, ciclismo y carrera a pie.', image: IMG_SWIMMING },
  ],
}

const FALLBACK_GROUP_CLASSES: GroupClassesSettings = {
  label: '● Entrenamiento en el Parque',
  title_line_1: 'CLASES',
  title_line_2: 'GRUPALES',
  time: '19:30',
  days: ['MARTES', 'JUEVES', 'VIERNES'],
  plans: [
    { name: 'Plan Grupal', desc: 'Entrenamiento grupal en el parque' },
    { name: 'Plan Grupal + Gimnasio', desc: 'Grupal con plan de gimnasio complementario' },
  ],
  bg_image: IMG_GROUP,
  side_image: IMG_GROUP_SIDE,
}

const FALLBACK_TEAM_GALLERY: TeamGallerySettings = {
  label: '● Comunidad',
  title_line_1: 'NUESTRO',
  title_line_2: 'EQUIPO',
  description:
    'Más que un equipo de entrenamiento, somos una comunidad de atletas apasionados por superarse.',
  items: [
    { image: '/images/carrera.jpeg', label: 'Carrera', large: true },
    { image: IMG_SWIMMING, label: 'Natación', large: false },
    { image: 'https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=400&q=80', label: 'Ciclismo', large: false },
    { image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80', label: 'Fuerza', large: false },
    { image: IMG_ABOUT, label: 'Equipo', large: false },
  ],
}

const FALLBACK_CONTACT: ContactSettings = {
  phone: PHONE,
  phone_display: PHONE_DISPLAY,
  email: EMAIL,
  whatsapp_link: WHATSAPP_LINK,
  instagram_user: INSTAGRAM_USER,
  instagram_link: INSTAGRAM_LINK,
  city: SITE_CITY,
}

export const FALLBACK_SETTINGS: SiteSettings = {
  hero: FALLBACK_HERO,
  about: FALLBACK_ABOUT,
  disciplines: FALLBACK_DISCIPLINES,
  group_classes: FALLBACK_GROUP_CLASSES,
  team_gallery: FALLBACK_TEAM_GALLERY,
  contact: FALLBACK_CONTACT,
}

const FALLBACK_COACHES: Coach[] = COACHES_FALLBACK.map((c, i) => ({
  id: `fallback-${i}`,
  slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  name: c.name,
  specialty: c.specialty,
  short_desc: c.desc,
  bio_long: c.desc,
  photo_url: c.img,
  ig_handle: c.ig,
  ig_url: c.igLink,
  certifications: [],
  achievements: [],
  services: [],
  display_order: i,
}))

const FALLBACK_PLANS: Plan[] = [
  ...RUNNER_PLANS.map((p, i) => ({
    id: `fallback-runner-${i}`,
    category: 'runner' as const,
    plan_category_id: null,
    name: p.name,
    name_display: p.name,
    badge: p.badge,
    features: p.features,
    featured: p.featured,
    display_order: i,
  })),
  ...TRIATHLON_PLANS.map((p, i) => ({
    id: `fallback-tri-${i}`,
    category: 'triathlon' as const,
    plan_category_id: null,
    name: p.name,
    name_display: p.name,
    badge: p.badge,
    features: p.features,
    featured: p.featured,
    display_order: i,
  })),
  ...GROUP_PLANS.map((p, i) => ({
    id: `fallback-group-${i}`,
    category: 'group' as const,
    plan_category_id: null,
    name: p.name,
    name_display: 'nameDisplay' in p ? (p.nameDisplay as string) : p.name,
    badge: p.badge,
    features: p.features,
    featured: p.featured,
    display_order: i,
  })),
]

// =========================================================
// Fetchers
// =========================================================
function isPlaceholder() {
  return (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
  )
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (isPlaceholder()) return FALLBACK_SETTINGS

  const supabase = createSupabaseClient()
  const { data, error } = await supabase.from('site_settings').select('key, value')

  if (error || !data) {
    if (error) console.error('site_settings fetch error:', error.message)
    return FALLBACK_SETTINGS
  }

  const map = new Map(data.map((row) => [row.key, row.value]))
  return {
    hero: { ...FALLBACK_HERO, ...((map.get('hero') as HeroSettings | undefined) ?? {}) },
    about: { ...FALLBACK_ABOUT, ...((map.get('about') as AboutSettings | undefined) ?? {}) },
    disciplines: { ...FALLBACK_DISCIPLINES, ...((map.get('disciplines') as DisciplinesSettings | undefined) ?? {}) },
    group_classes: { ...FALLBACK_GROUP_CLASSES, ...((map.get('group_classes') as GroupClassesSettings | undefined) ?? {}) },
    team_gallery: { ...FALLBACK_TEAM_GALLERY, ...((map.get('team_gallery') as TeamGallerySettings | undefined) ?? {}) },
    contact: { ...FALLBACK_CONTACT, ...((map.get('contact') as ContactSettings | undefined) ?? {}) },
  }
}

export async function getCoaches(): Promise<Coach[]> {
  if (isPlaceholder()) return FALLBACK_COACHES

  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from('coaches')
    .select('*')
    .order('display_order', { ascending: true })

  if (error || !data || data.length === 0) {
    if (error) console.error('coaches fetch error:', error.message)
    return FALLBACK_COACHES
  }
  return data as Coach[]
}

export async function getPlansByCategory(category: PlanCategory): Promise<Plan[]> {
  if (isPlaceholder()) return FALLBACK_PLANS.filter((p) => p.category === category)

  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('category', category)
    .order('display_order', { ascending: true })

  if (error || !data || data.length === 0) {
    if (error) console.error(`plans (${category}) fetch error:`, error.message)
    return FALLBACK_PLANS.filter((p) => p.category === category)
  }
  return data as Plan[]
}

export async function getAllPlans(): Promise<Plan[]> {
  if (isPlaceholder()) return FALLBACK_PLANS

  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .order('category', { ascending: true })
    .order('display_order', { ascending: true })

  if (error || !data || data.length === 0) {
    if (error) console.error('plans fetch error:', error.message)
    return FALLBACK_PLANS
  }
  return data as Plan[]
}
