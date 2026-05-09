'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import slugify from 'slugify'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export type CoachState = { ok?: boolean; error?: string } | undefined

async function requireUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado.')
  return supabase
}

function parseFormData(formData: FormData) {
  const certifications = JSON.parse(String(formData.get('certifications') ?? '[]'))
  const achievements = JSON.parse(String(formData.get('achievements') ?? '[]'))
  const services = JSON.parse(String(formData.get('services') ?? '[]'))
  return {
    name: String(formData.get('name') ?? '').trim(),
    specialty: String(formData.get('specialty') ?? '').trim(),
    short_desc: String(formData.get('short_desc') ?? ''),
    bio_long: String(formData.get('bio_long') ?? ''),
    photo_url: String(formData.get('photo_url') ?? '') || null,
    ig_handle: String(formData.get('ig_handle') ?? '') || null,
    ig_url: String(formData.get('ig_url') ?? '') || null,
    certifications: Array.isArray(certifications) ? certifications : [],
    achievements: Array.isArray(achievements) ? achievements : [],
    services: Array.isArray(services) ? services : [],
    display_order: Number(formData.get('display_order') ?? 0),
  }
}

export async function createCoachAction(_prev: CoachState, formData: FormData): Promise<CoachState> {
  try {
    const supabase = await requireUser()
    const data = parseFormData(formData)
    if (!data.name) return { error: 'El nombre es obligatorio.' }

    const slug = slugify(data.name, { lower: true, strict: true })
    const { error } = await supabase.from('coaches').insert({ ...data, slug })
    if (error) return { error: error.message }

    revalidatePath('/', 'layout')
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
  redirect('/dashboard/entrenadores')
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

    const { error } = await supabase
      .from('coaches')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return { error: error.message }

    revalidatePath('/', 'layout')
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}

export async function deleteCoachAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) return
  const supabase = await requireUser()
  await supabase.from('coaches').delete().eq('id', id)
  revalidatePath('/', 'layout')
  redirect('/dashboard/entrenadores')
}
