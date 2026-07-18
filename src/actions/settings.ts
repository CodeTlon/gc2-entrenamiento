'use server'

import { revalidatePath } from 'next/cache'
import sharp from 'sharp'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { maxBytesForMime } from '@/lib/upload-limits'

export type SaveState = { ok?: boolean; error?: string } | undefined

async function requireUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado.')
  return supabase
}

const SETTING_PATHS: Record<string, string[]> = {
  page_banners: ['/', '/planes', '/blog'],
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

    for (const p of SETTING_PATHS[key] ?? ['/']) revalidatePath(p)
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}

function extractStoragePath(url: string): string | null {
  // URLs de Supabase Storage: .../storage/v1/object/public/media/<path>
  const match = url.split('#')[0].match(/\/storage\/v1\/object\/public\/media\/(.+)/)
  return match?.[1] ?? null
}

export async function uploadMediaAction(formData: FormData): Promise<{ url?: string; error?: string }> {
  try {
    const supabase = await requireUser()
    const file = formData.get('file')
    if (!(file instanceof File)) return { error: 'Archivo inválido.' }
    const maxBytes = maxBytesForMime(file.type || '')
    if (file.size > maxBytes) return { error: `Máximo ${Math.round(maxBytes / (1024 * 1024))}MB.` }

    const folder = String(formData.get('folder') ?? 'uploads')

    // Borrar imagen anterior si viene del mismo bucket
    const oldUrl = String(formData.get('oldUrl') ?? '')
    if (oldUrl) {
      const oldPath = extractStoragePath(oldUrl)
      if (oldPath) {
        await supabase.storage.from('media').remove([oldPath])
      }
    }
    const id = crypto.randomUUID()
    const original = Buffer.from(await file.arrayBuffer())
    const mime = file.type || ''

    // Pasamos por sharp solo si es una imagen rasterizada: SVG queda vectorial
    // y GIF lo dejamos tal cual para preservar animaciones.
    const optimizable =
      mime.startsWith('image/') && mime !== 'image/svg+xml' && mime !== 'image/gif'

    let buf: Buffer
    let ext: string
    let contentType: string

    if (optimizable) {
      buf = await sharp(original)
        .rotate()
        .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82, effort: 2 })
        .toBuffer()
      ext = 'webp'
      contentType = 'image/webp'
    } else {
      buf = original
      ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
      contentType = mime || 'application/octet-stream'
    }

    const path = `${folder}/${id}.${ext}`

    const { error: upErr } = await supabase.storage
      .from('media')
      .upload(path, buf, { contentType, upsert: false })
    if (upErr) return { error: upErr.message }

    const { data } = supabase.storage.from('media').getPublicUrl(path)
    return { url: data.publicUrl }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}
