import {
  pgTable, pgEnum, uuid, text, boolean, integer, jsonb, timestamp, primaryKey,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export * from './auth-schema'

// Las claves de las columnas son snake_case (igual que en Supabase) para que las filas
// mantengan la misma forma que ya consumen las páginas y componentes.
// Mismo modelo que tenía Supabase (supabase/migrations/001-012). Sin RLS: la autorización
// vive en el servidor (requireUser en las acciones del dashboard).
const created = () => timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow()
const updated = () => timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow()

export const planCategoryEnum = pgEnum('plan_category', ['runner', 'triathlon', 'group'])

export const contactLeads = pgTable('contact_leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  email: text('email').notNull(),
  telefono: text('telefono').notNull(),
  ciudad: text('ciudad'),
  servicio: text('servicio'),
  objetivo: text('objetivo'),
  mensaje: text('mensaje').notNull(),
  coach: text('coach'),
  created_at: created(),
})

export const siteSettings = pgTable('site_settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updated_at: updated(),
})

export const coaches = pgTable('coaches', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  specialty: text('specialty').notNull(),
  short_desc: text('short_desc').notNull().default(''),
  bio_long: text('bio_long').notNull().default(''),
  photo_url: text('photo_url'),
  ig_handle: text('ig_handle'),
  ig_url: text('ig_url'),
  certifications: text('certifications').array().notNull().default(sql`'{}'`),
  achievements: text('achievements').array().notNull().default(sql`'{}'`),
  services: text('services').array().notNull().default(sql`'{}'`),
  display_order: integer('display_order').notNull().default(0),
  created_at: created(),
  updated_at: updated(),
})

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  display_order: integer('display_order').notNull().default(0),
  created_at: created(),
})

export const planCategories = pgTable('plan_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  display_order: integer('display_order').notNull().default(0),
  created_at: created(),
})

export const plans = pgTable('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  category: planCategoryEnum('category').notNull(),
  plan_category_id: uuid('plan_category_id').references(() => planCategories.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  name_display: text('name_display'),
  badge: text('badge'),
  features: text('features').array().notNull().default(sql`'{}'`),
  featured: boolean('featured').notNull().default(false),
  display_order: integer('display_order').notNull().default(0),
  description_long: text('description_long').notNull().default(''),
  created_at: created(),
  updated_at: updated(),
})

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  cover_image: text('cover_image'),
  youtube_url: text('youtube_url'),
  video_url: text('video_url'),
  attachment_url: text('attachment_url'),
  published: boolean('published').notNull().default(false),
  // author_id apuntaba a auth.users de Supabase; ahora es solo un id legado sin FK.
  author_id: uuid('author_id'),
  coach_id: uuid('coach_id').references(() => coaches.id, { onDelete: 'set null' }),
  // legacy: la fuente de verdad es post_categories
  category_id: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  created_at: created(),
  updated_at: updated(),
})

export const postCategories = pgTable(
  'post_categories',
  {
    post_id: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    category_id: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.post_id, t.category_id] })],
)

export const postAuthors = pgTable(
  'post_authors',
  {
    post_id: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    coach_id: uuid('coach_id').notNull().references(() => coaches.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.post_id, t.coach_id] })],
)
