'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { and, eq, ne, ilike } from 'drizzle-orm'
import slugify from 'slugify'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/session'
import { errorMessage } from '@/lib/errors'
import { planCategories } from '@/db/schema'

export type PlanCategoryState = { ok?: boolean; error?: string } | undefined

// Escapa % y _ para que ilike compare el nombre literal.
const likeLiteral = (v: string) => v.replace(/[\\%_]/g, '\\$&')

async function checkDuplicateCategoryName(name: string, excludeId?: string): Promise<boolean> {
  const rows = await db
    .select({ id: planCategories.id })
    .from(planCategories)
    .where(and(ilike(planCategories.name, likeLiteral(name)), excludeId ? ne(planCategories.id, excludeId) : undefined))
    .limit(1)
  return rows.length > 0
}

export async function createPlanCategoryAction(
  _prev: PlanCategoryState,
  formData: FormData,
): Promise<PlanCategoryState> {
  try {
    await requireUser()
    const name = String(formData.get('name') ?? '').trim()
    const display_order = Number(formData.get('display_order') ?? 0)
    if (!name) return { error: 'El nombre es obligatorio.' }

    const isDuplicate = await checkDuplicateCategoryName(name)
    if (isDuplicate) return { error: 'Ya existe una categoría con ese nombre.' }

    const slug = slugify(name, { lower: true, strict: true })
    await db.insert(planCategories).values({ name, slug, display_order })

    revalidatePath('/planes')
    revalidatePath('/dashboard/planes')
  } catch (e) {
    return { error: errorMessage(e) }
  }
  redirect('/dashboard/planes/categorias?saved=1')
}

export async function updatePlanCategoryAction(
  id: string,
  _prev: PlanCategoryState,
  formData: FormData,
): Promise<PlanCategoryState> {
  try {
    await requireUser()
    const name = String(formData.get('name') ?? '').trim()
    const display_order = Number(formData.get('display_order') ?? 0)
    if (!name) return { error: 'El nombre es obligatorio.' }

    const isDuplicate = await checkDuplicateCategoryName(name, id)
    if (isDuplicate) return { error: 'Ya existe una categoría con ese nombre.' }

    const slug = slugify(name, { lower: true, strict: true })
    await db.update(planCategories).set({ name, slug, display_order }).where(eq(planCategories.id, id))

    revalidatePath('/planes')
    revalidatePath('/dashboard/planes')
  } catch (e) {
    return { error: errorMessage(e) }
  }
  redirect('/dashboard/planes/categorias?saved=1')
}

export async function deletePlanCategoryAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) return
  await requireUser()
  await db.delete(planCategories).where(eq(planCategories.id, id))
  revalidatePath('/planes')
  revalidatePath('/dashboard/planes')
  redirect('/dashboard/planes/categorias')
}
