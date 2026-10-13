'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { and, eq, ne, ilike, isNull } from 'drizzle-orm'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/session'
import { errorMessage } from '@/lib/errors'
import { plans, planCategories } from '@/db/schema'

export type PlanState = { ok?: boolean; error?: string } | undefined

type PlanEnum = (typeof plans.$inferInsert)['category']

const SLUG_TO_ENUM: Record<string, PlanEnum> = {
  runner: 'runner',
  corredores: 'runner',
  triathlon: 'triathlon',
  triatletas: 'triathlon',
  group: 'group',
  grupales: 'group',
}

// Escapa % y _ para que ilike compare el nombre literal.
const likeLiteral = (v: string) => v.replace(/[\%_]/g, '\$&')

const sameCategory = (plan_category_id: string | null) =>
  plan_category_id ? eq(plans.plan_category_id, plan_category_id) : isNull(plans.plan_category_id)

async function checkDuplicateName(
  name: string,
  plan_category_id: string | null,
  excludeId?: string,
): Promise<boolean> {
  const rows = await db
    .select({ id: plans.id })
    .from(plans)
    .where(and(ilike(plans.name, likeLiteral(name)), sameCategory(plan_category_id), excludeId ? ne(plans.id, excludeId) : undefined))
    .limit(1)
  return rows.length > 0
}

async function checkDuplicateNameDisplay(
  name_display: string | null,
  plan_category_id: string | null,
  excludeId?: string,
): Promise<boolean> {
  if (!name_display) return false
  const rows = await db
    .select({ id: plans.id })
    .from(plans)
    .where(and(ilike(plans.name_display, likeLiteral(name_display)), sameCategory(plan_category_id), excludeId ? ne(plans.id, excludeId) : undefined))
    .limit(1)
  return rows.length > 0
}

async function resolveCategory(plan_category_id: string | null): Promise<PlanEnum> {
  if (!plan_category_id) return 'runner'
  const [row] = await db
    .select({ slug: planCategories.slug })
    .from(planCategories)
    .where(eq(planCategories.id, plan_category_id))
    .limit(1)
  return SLUG_TO_ENUM[row?.slug ?? 'runner'] ?? 'runner'
}

function parseFormData(formData: FormData) {
  let features: string[]
  try {
    const parsed = JSON.parse(String(formData.get('features') ?? '[]'))
    features = Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    features = []
  }
  return {
    plan_category_id: String(formData.get('plan_category_id') ?? '') || null,
    name: String(formData.get('name') ?? '').trim(),
    name_display: String(formData.get('name_display') ?? '') || null,
    badge: String(formData.get('badge') ?? '') || null,
    features,
    featured: formData.get('featured') === 'on',
    display_order: Number(formData.get('display_order') ?? 0),
    description_long: String(formData.get('description_long') ?? ''),
  }
}

export async function createPlanAction(_prev: PlanState, formData: FormData): Promise<PlanState> {
  try {
    await requireUser()
    const data = parseFormData(formData)
    if (!data.name) return { error: 'El nombre es obligatorio.' }
    const isDuplicateName = await checkDuplicateName(data.name, data.plan_category_id)
    if (isDuplicateName) return { error: 'Ya existe un plan con ese nombre interno en esta categoría.' }
    const isDuplicate = await checkDuplicateNameDisplay(data.name_display, data.plan_category_id)
    if (isDuplicate) return { error: 'Ya existe un plan con ese nombre visible en esta categoría.' }
    const category = await resolveCategory(data.plan_category_id)
    await db.insert(plans).values({ ...data, category })
    revalidatePath('/planes')
  } catch (e) {
    return { error: errorMessage(e) }
  }
  redirect('/dashboard/planes?saved=1')
}

export async function updatePlanAction(
  id: string,
  _prev: PlanState,
  formData: FormData,
): Promise<PlanState> {
  try {
    await requireUser()
    const data = parseFormData(formData)
    if (!data.name) return { error: 'El nombre es obligatorio.' }
    const isDuplicateName = await checkDuplicateName(data.name, data.plan_category_id, id)
    if (isDuplicateName) return { error: 'Ya existe un plan con ese nombre interno en esta categoría.' }
    const isDuplicate = await checkDuplicateNameDisplay(data.name_display, data.plan_category_id, id)
    if (isDuplicate) return { error: 'Ya existe un plan con ese nombre visible en esta categoría.' }
    const category = await resolveCategory(data.plan_category_id)
    await db.update(plans).set({ ...data, category, updated_at: new Date().toISOString() }).where(eq(plans.id, id))
    revalidatePath('/planes')
  } catch (e) {
    return { error: errorMessage(e) }
  }
  redirect('/dashboard/planes?saved=1')
}

export async function deletePlanAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) return
  await requireUser()
  await db.delete(plans).where(eq(plans.id, id))
  revalidatePath('/', 'layout')
  redirect('/dashboard/planes')
}
