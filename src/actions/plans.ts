'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export type PlanState = { ok?: boolean; error?: string } | undefined

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>

async function requireUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado.')
  return supabase
}

async function resolveCategory(supabase: SupabaseClient, plan_category_id: string | null): Promise<string> {
  if (!plan_category_id) return 'runner'
  const { data } = await supabase
    .from('plan_categories')
    .select('slug')
    .eq('id', plan_category_id)
    .single()
  return data?.slug ?? 'runner'
}

function parseFormData(formData: FormData) {
  const features = JSON.parse(String(formData.get('features') ?? '[]'))
  return {
    plan_category_id: String(formData.get('plan_category_id') ?? '') || null,
    name: String(formData.get('name') ?? '').trim(),
    name_display: String(formData.get('name_display') ?? '') || null,
    badge: String(formData.get('badge') ?? '') || null,
    features: Array.isArray(features) ? features : [],
    featured: formData.get('featured') === 'on',
    display_order: Number(formData.get('display_order') ?? 0),
  }
}

export async function createPlanAction(_prev: PlanState, formData: FormData): Promise<PlanState> {
  try {
    const supabase = await requireUser()
    const data = parseFormData(formData)
    if (!data.name) return { error: 'El nombre es obligatorio.' }
    const category = await resolveCategory(supabase, data.plan_category_id)
    const { error } = await supabase.from('plans').insert({ ...data, category })
    if (error) return { error: error.message }
    revalidatePath('/', 'layout')
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
  redirect('/dashboard/planes')
}

export async function updatePlanAction(
  id: string,
  _prev: PlanState,
  formData: FormData,
): Promise<PlanState> {
  try {
    const supabase = await requireUser()
    const data = parseFormData(formData)
    if (!data.name) return { error: 'El nombre es obligatorio.' }
    const category = await resolveCategory(supabase, data.plan_category_id)
    const { error } = await supabase
      .from('plans')
      .update({ ...data, category, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/', 'layout')
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}

export async function deletePlanAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) return
  const supabase = await requireUser()
  await supabase.from('plans').delete().eq('id', id)
  revalidatePath('/', 'layout')
  redirect('/dashboard/planes')
}
