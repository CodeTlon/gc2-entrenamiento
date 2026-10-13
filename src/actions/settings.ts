'use server'

import { revalidatePath } from 'next/cache'
import sharp from 'sharp'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/session'
import { siteSettings } from '@/db/schema'
import { putObject, deleteObject, keyFromUrl } from '@/lib/storage'
import { maxBytesForMime } from '@/lib/upload-limits'

export type SaveState = { ok?: boolean; error?: string } | undefined

const SETTING_PATHS: Record<string, string[]> = {
  page_banners: ['/', '/planes', '/blog'],
}

export async function saveSiteSettingAction(
  key: string,
  value: unknown,
): Promise<SaveState> {
  try {
    await requireUser()
    const updated_at = new Date().toISOString()
    await db
      .insert(siteSettings)
      .values({ key, value, updated_at })
      .onConflictDoUpdate({ target: siteSettings.key, set: { value, updated_at } })

    for (const p of SETTING_PATHS[key] ?? ['/']) revalidatePath(p)
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}

export async function uploadMediaAction(formData: FormData): Promise<{ url?: string; error?: string }> {
  try {
    await requireUser()
    const file = formData.get('file')
    if (!(file instanceof File)) return { error: 'Archivo inválido.' }
    const maxBytes = maxBytesForMime(file.type || '')
    if (file.size > maxBytes) return { error: `Máximo ${Math.round(maxBytes / (1024 * 1024))}MB.` }

    const rawFolder = String(formData.get('folder') ?? 'uploads')
    const folder = /^[a-z0-9_-]{1,40}$/i.test(rawFolder) ? rawFolder : 'uploads'

    // Borrar imagen anterior si viene de nuestro bucket
    const oldUrl = String(formData.get('oldUrl') ?? '')
    if (oldUrl) {
      const oldKey = keyFromUrl(oldUrl)
      if (oldKey) await deleteObject(oldKey)
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

    return { url: await putObject(path, buf, contentType) }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}
