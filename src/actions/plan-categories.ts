'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import slugify from 'slugify'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export type PlanCategoryState = { ok?: boolean; error?: string } | undefined

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>

async function requireUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado.')
  return supabase
}

async function checkDuplicateCategoryName(
  supabase: SupabaseClient,
  name: string,
  excludeId?: string,
): Promise<boolean> {
  let query = supabase
    .from('plan_categories')
    .select('id')
    .ilike('name', name)
  if (excludeId) query = query.neq('id', excludeId)
  const { data } = await query
  return (data?.length ?? 0) > 0
}

export async function createPlanCategoryAction(
  _prev: PlanCategoryState,
  formData: FormData,
): Promise<PlanCategoryState> {
  try {
    const supabase = await requireUser()
    const name = String(formData.get('name') ?? '').trim()
    const display_order = Number(formData.get('display_order') ?? 0)
    if (!name) return { error: 'El nombre es obligatorio.' }

    const isDuplicate = await checkDuplicateCategoryName(supabase, name)
    if (isDuplicate) return { error: 'Ya existe una categoría con ese nombre.' }

    const slug = slugify(name, { lower: true, strict: true })
    const { error } = await supabase.from('plan_categories').insert({ name, slug, display_order })
    if (error) return { error: error.message }

    revalidatePath('/planes')
    revalidatePath('/dashboard/planes')
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
  redirect('/dashboard/planes/categorias')
}

export async function updatePlanCategoryAction(
  id: string,
  _prev: PlanCategoryState,
  formData: FormData,
): Promise<PlanCategoryState> {
  try {
    const supabase = await requireUser()
    const name = String(formData.get('name') ?? '').trim()
    const display_order = Number(formData.get('display_order') ?? 0)
    if (!name) return { error: 'El nombre es obligatorio.' }

    const isDuplicate = await checkDuplicateCategoryName(supabase, name, id)
    if (isDuplicate) return { error: 'Ya existe una categoría con ese nombre.' }

    const slug = slugify(name, { lower: true, strict: true })
    const { error } = await supabase
      .from('plan_categories')
      .update({ name, slug, display_order })
      .eq('id', id)
    if (error) return { error: error.message }

    revalidatePath('/planes')
    revalidatePath('/dashboard/planes')
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}

export async function deletePlanCategoryAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) return
  const supabase = await requireUser()
  const { error } = await supabase.from('plan_categories').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/planes')
  revalidatePath('/dashboard/planes')
  redirect('/dashboard/planes/categorias')
}
