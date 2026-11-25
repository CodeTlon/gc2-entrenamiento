'use server'

import { revalidatePath } from 'next/cache'
import sharp from 'sharp'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { extForPassthroughMime, maxBytesForMime } from '@/lib/upload-limits'

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

// Whitelist de carpetas del bucket `media` — coincide con los `folder` hardcodeados
// que pasan los forms del dashboard (ImageUpload/FileUpload, ver src/components/dashboard/Field.tsx
// y ContentEditor en PostForm.tsx). El `folder` llega como FormData de un Server Action:
// sin esto, un `folder` con `../` armado a mano escribiría fuera de la carpeta esperada
// dentro del mismo bucket.
const ALLOWED_UPLOAD_FOLDERS = new Set([
  'uploads', 'gallery', 'about', 'banners', 'blog', 'blog/video',
  'blog/adjuntos', 'blog/content', 'disciplines', 'hero', 'group', 'coaches',
])

function sanitizeFolder(raw: string): string {
  return ALLOWED_UPLOAD_FOLDERS.has(raw) ? raw : 'uploads'
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

    // `contact` alimenta Navbar/Footer/CTAs de WhatsApp en todas las páginas públicas.
    if (key === 'contact') revalidatePath('/', 'layout')
    else for (const p of SETTING_PATHS[key] ?? ['/']) revalidatePath(p)
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

    const folder = sanitizeFolder(String(formData.get('folder') ?? 'uploads'))

    // Borrar imagen anterior si viene del mismo bucket
    const oldUrl = String(formData.get('oldUrl') ?? '')
    if (oldUrl) {
      const oldPath = extractStoragePath(oldUrl)
      // Solo se borra dentro de carpetas conocidas: oldUrl viene del cliente.
      const oldFolder = oldPath ? oldPath.slice(0, oldPath.lastIndexOf('/')) : ''
      if (oldPath && !oldPath.includes('..') && ALLOWED_UPLOAD_FOLDERS.has(oldFolder)) {
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
      const safeExt = extForPassthroughMime(mime)
      if (!safeExt) return { error: 'Tipo de archivo no permitido.' }
      buf = original
      ext = safeExt
      contentType = mime
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
