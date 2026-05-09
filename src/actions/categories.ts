'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import slugify from 'slugify'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export type CategoryState = { ok?: boolean; error?: string } | undefined

async function requireUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado.')
  return supabase
}

export async function createCategoryAction(
  _prev: CategoryState,
  formData: FormData,
): Promise<CategoryState> {
  try {
    const supabase = await requireUser()
    const name = String(formData.get('name') ?? '').trim()
    const display_order = Number(formData.get('display_order') ?? 0)
    if (!name) return { error: 'El nombre es obligatorio.' }

    const slug = slugify(name, { lower: true, strict: true })
    const { error } = await supabase.from('categories').insert({ name, slug, display_order })
    if (error) return { error: error.message }

    revalidatePath('/blog')
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
  redirect('/dashboard/categorias')
}

export async function updateCategoryAction(
  id: string,
  _prev: CategoryState,
  formData: FormData,
): Promise<CategoryState> {
  try {
    const supabase = await requireUser()
    const name = String(formData.get('name') ?? '').trim()
    const display_order = Number(formData.get('display_order') ?? 0)
    if (!name) return { error: 'El nombre es obligatorio.' }

    const slug = slugify(name, { lower: true, strict: true })
    const { error } = await supabase
      .from('categories')
      .update({ name, slug, display_order })
      .eq('id', id)
    if (error) return { error: error.message }

    revalidatePath('/blog')
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}

export async function deleteCategoryAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) return
  const supabase = await requireUser()
  await supabase.from('categories').delete().eq('id', id)
  revalidatePath('/blog')
  redirect('/dashboard/categorias')
}
