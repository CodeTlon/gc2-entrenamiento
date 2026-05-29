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

const SLUG_TO_ENUM: Record<string, string> = {
  runner: 'runner',
  corredores: 'runner',
  triathlon: 'triathlon',
  triatletas: 'triathlon',
  group: 'group',
  grupales: 'group',
}

async function checkDuplicateName(
  supabase: SupabaseClient,
  name: string,
  plan_category_id: string | null,
  excludeId?: string,
): Promise<boolean> {
  let query = supabase.from('plans').select('id').ilike('name', name)
  query = plan_category_id
    ? query.eq('plan_category_id', plan_category_id)
    : query.is('plan_category_id', null)
  if (excludeId) query = query.neq('id', excludeId)
  const { data } = await query
  return (data?.length ?? 0) > 0
}

async function checkDuplicateNameDisplay(
  supabase: SupabaseClient,
  name_display: string | null,
  plan_category_id: string | null,
  excludeId?: string,
): Promise<boolean> {
  if (!name_display) return false
  let query = supabase.from('plans').select('id').ilike('name_display', name_display)
  query = plan_category_id
    ? query.eq('plan_category_id', plan_category_id)
    : query.is('plan_category_id', null)
  if (excludeId) query = query.neq('id', excludeId)
  const { data } = await query
  return (data?.length ?? 0) > 0
}

async function resolveCategory(supabase: SupabaseClient, plan_category_id: string | null): Promise<string> {
  if (!plan_category_id) return 'runner'
  const { data } = await supabase
    .from('plan_categories')
    .select('slug')
    .eq('id', plan_category_id)
    .single()
  const slug = data?.slug ?? 'runner'
  return SLUG_TO_ENUM[slug] ?? 'runner'
}

function parseFormData(formData: FormData) {
  let features: unknown[]
  try {
    const parsed = JSON.parse(String(formData.get('features') ?? '[]'))
    features = Array.isArray(parsed) ? parsed : []
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
  }
}

export async function createPlanAction(_prev: PlanState, formData: FormData): Promise<PlanState> {
  try {
    const supabase = await requireUser()
    const data = parseFormData(formData)
    if (!data.name) return { error: 'El nombre es obligatorio.' }
    const isDuplicateName = await checkDuplicateName(supabase, data.name, data.plan_category_id)
    if (isDuplicateName) return { error: 'Ya existe un plan con ese nombre interno en esta categoría.' }
    const isDuplicate = await checkDuplicateNameDisplay(supabase, data.name_display, data.plan_category_id)
    if (isDuplicate) return { error: 'Ya existe un plan con ese nombre visible en esta categoría.' }
    const category = await resolveCategory(supabase, data.plan_category_id)
    const { error } = await supabase.from('plans').insert({ ...data, category })
    if (error) return { error: error.message }
    revalidatePath('/planes')
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
  redirect('/dashboard/planes?saved=1')
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
    const isDuplicateName = await checkDuplicateName(supabase, data.name, data.plan_category_id, id)
    if (isDuplicateName) return { error: 'Ya existe un plan con ese nombre interno en esta categoría.' }
    const isDuplicate = await checkDuplicateNameDisplay(supabase, data.name_display, data.plan_category_id, id)
    if (isDuplicate) return { error: 'Ya existe un plan con ese nombre visible en esta categoría.' }
    const category = await resolveCategory(supabase, data.plan_category_id)
    const { error } = await supabase
      .from('plans')
      .update({ ...data, category, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/planes')
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
  redirect('/dashboard/planes?saved=1')
}

export async function deletePlanAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) return
  const supabase = await requireUser()
  const { error } = await supabase.from('plans').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
  redirect('/dashboard/planes')
}
