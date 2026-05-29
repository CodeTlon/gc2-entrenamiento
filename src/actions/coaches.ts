'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import slugify from 'slugify'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export type CoachState = { ok?: boolean; error?: string } | undefined

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>

async function requireUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado.')
  return supabase
}

async function checkDuplicateCoachName(
  supabase: SupabaseClient,
  name: string,
  excludeId?: string,
): Promise<boolean> {
  let query = supabase.from('coaches').select('id').ilike('name', name)
  if (excludeId) query = query.neq('id', excludeId)
  const { data } = await query
  return (data?.length ?? 0) > 0
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
    const supabase = await requireUser()
    const data = parseFormData(formData)
    if (!data.name) return { error: 'El nombre es obligatorio.' }

    const isDuplicate = await checkDuplicateCoachName(supabase, data.name)
    if (isDuplicate) return { error: 'Ya existe un entrenador con ese nombre.' }

    const slug = slugify(data.name, { lower: true, strict: true })
    const { error } = await supabase.from('coaches').insert({ ...data, slug })
    if (error) return { error: error.message }

    revalidatePath('/', 'layout')
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
    const supabase = await requireUser()
    const data = parseFormData(formData)
    if (!data.name) return { error: 'El nombre es obligatorio.' }

    const isDuplicate = await checkDuplicateCoachName(supabase, data.name, id)
    if (isDuplicate) return { error: 'Ya existe un entrenador con ese nombre.' }

    const { error } = await supabase
      .from('coaches')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return { error: error.message }

    revalidatePath('/', 'layout')
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
  redirect('/dashboard/entrenadores?saved=1')
}

export async function deleteCoachAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) return
  const supabase = await requireUser()
  const { error } = await supabase.from('coaches').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
  redirect('/dashboard/entrenadores')
}
