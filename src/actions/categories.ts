'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { and, eq, ne, ilike } from 'drizzle-orm'
import slugify from 'slugify'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/session'
import { errorMessage } from '@/lib/errors'
import { categories } from '@/db/schema'

export type CategoryState = { ok?: boolean; error?: string } | undefined

// Escapa % y _ para que ilike compare el nombre literal.
const likeLiteral = (v: string) => v.replace(/[\\%_]/g, '\\$&')

async function checkDuplicateCategoryName(name: string, excludeId?: string): Promise<boolean> {
  const rows = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(ilike(categories.name, likeLiteral(name)), excludeId ? ne(categories.id, excludeId) : undefined))
    .limit(1)
  return rows.length > 0
}

export async function createCategoryAction(
  _prev: CategoryState,
  formData: FormData,
): Promise<CategoryState> {
  try {
    await requireUser()
    const name = String(formData.get('name') ?? '').trim()
    const display_order = Number(formData.get('display_order') ?? 0)
    if (!name) return { error: 'El nombre es obligatorio.' }

    const isDuplicate = await checkDuplicateCategoryName(name)
    if (isDuplicate) return { error: 'Ya existe una categoría con ese nombre.' }

    const slug = slugify(name, { lower: true, strict: true })
    await db.insert(categories).values({ name, slug, display_order })

    revalidatePath('/blog')
  } catch (e) {
    return { error: errorMessage(e) }
  }
  redirect('/dashboard/categorias?saved=1')
}

export async function updateCategoryAction(
  id: string,
  _prev: CategoryState,
  formData: FormData,
): Promise<CategoryState> {
  try {
    await requireUser()
    const name = String(formData.get('name') ?? '').trim()
    const display_order = Number(formData.get('display_order') ?? 0)
    if (!name) return { error: 'El nombre es obligatorio.' }

    const isDuplicate = await checkDuplicateCategoryName(name, id)
    if (isDuplicate) return { error: 'Ya existe una categoría con ese nombre.' }

    const slug = slugify(name, { lower: true, strict: true })
    await db.update(categories).set({ name, slug, display_order }).where(eq(categories.id, id))

    revalidatePath('/blog')
  } catch (e) {
    return { error: errorMessage(e) }
  }
  redirect('/dashboard/categorias?saved=1')
}

export async function deleteCategoryAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) return
  await requireUser()
  await db.delete(categories).where(eq(categories.id, id))
  revalidatePath('/blog')
  redirect('/dashboard/categorias')
}
