'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export type SaveState = { ok?: boolean; error?: string } | undefined

async function requireUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado.')
  return supabase
}

export async function saveSiteSettingAction(
  key: string,
  value: unknown,
): Promise<SaveState> {
  try {
    const supabase = await requireUser()
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })

    if (error) return { error: error.message }

    revalidatePath('/', 'layout')
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}

export async function uploadMediaAction(formData: FormData): Promise<{ url?: string; error?: string }> {
  try {
    const supabase = await requireUser()
    const file = formData.get('file')
    if (!(file instanceof File)) return { error: 'Archivo inválido.' }
    if (file.size > 8 * 1024 * 1024) return { error: 'Máximo 8MB.' }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
    const path = `${formData.get('folder') ?? 'uploads'}/${crypto.randomUUID()}.${ext}`
    const buf = Buffer.from(await file.arrayBuffer())

    const { error: upErr } = await supabase.storage
      .from('media')
      .upload(path, buf, { contentType: file.type, upsert: false })
    if (upErr) return { error: upErr.message }

    const { data } = supabase.storage.from('media').getPublicUrl(path)
    return { url: data.publicUrl }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}
