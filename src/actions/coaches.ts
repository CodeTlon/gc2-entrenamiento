'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import slugify from 'slugify'
import { and, eq, ne, ilike } from 'drizzle-orm'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/session'
import { coaches } from '@/db/schema'

export type CoachState = { ok?: boolean; error?: string } | undefined

// Escapa % y _ para que ilike compare el nombre literal.
const likeLiteral = (v: string) => v.replace(/[\%_]/g, '\$&')

async function checkDuplicateCoachName(name: string, excludeId?: string): Promise<boolean> {
  const rows = await db
    .select({ id: coaches.id })
    .from(coaches)
    .where(and(ilike(coaches.name, likeLiteral(name)), excludeId ? ne(coaches.id, excludeId) : undefined))
    .limit(1)
  return rows.length > 0
}

function safeJsonArray(raw: string | null, fallback: string[] = []): string[] {
  try {
    const parsed = JSON.parse(raw ?? '[]')
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

function parseFormData(formData: FormData) {
  return {
    name: String(formData.get('name') ?? '').trim(),
    specialty: String(formData.get('specialty') ?? '').trim(),
    short_desc: String(formData.get('short_desc') ?? '').trim(),
    bio_long: String(formData.get('bio_long') ?? '').trim(),
    photo_url: String(formData.get('photo_url') ?? '') || null,
    ig_handle: String(formData.get('ig_handle') ?? '').trim() || null,
    ig_url: String(formData.get('ig_url') ?? '').trim() || null,
    certifications: safeJsonArray(formData.get('certifications') as string | null),
    achievements: safeJsonArray(formData.get('achievements') as string | null),
    services: safeJsonArray(formData.get('services') as string | null),
    display_order: Number(formData.get('display_order') ?? 0),
  }
}

export async function createCoachAction(_prev: CoachState, formData: FormData): Promise<CoachState> {
  try {
    await requireUser()
    const data = parseFormData(formData)
    if (!data.name) return { error: 'El nombre es obligatorio.' }

    const isDuplicate = await checkDuplicateCoachName(data.name)
    if (isDuplicate) return { error: 'Ya existe un entrenador con ese nombre.' }

    const slug = slugify(data.name, { lower: true, strict: true })
    await db.insert(coaches).values({ ...data, slug })

    revalidatePath('/')
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
  redirect('/dashboard/entrenadores?saved=1')
}

export async function updateCoachAction(
  id: string,
  _prev: CoachState,
  formData: FormData,
): Promise<CoachState> {
  try {
    await requireUser()
    const data = parseFormData(formData)
    if (!data.name) return { error: 'El nombre es obligatorio.' }

    const isDuplicate = await checkDuplicateCoachName(data.name, id)
    if (isDuplicate) return { error: 'Ya existe un entrenador con ese nombre.' }

    await db.update(coaches).set({ ...data, updated_at: new Date().toISOString() }).where(eq(coaches.id, id))

    revalidatePath('/')
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
  redirect('/dashboard/entrenadores?saved=1')
}

export async function deleteCoachAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) return
  await requireUser()
  await db.delete(coaches).where(eq(coaches.id, id))
  revalidatePath('/', 'layout')
  redirect('/dashboard/entrenadores')
}
