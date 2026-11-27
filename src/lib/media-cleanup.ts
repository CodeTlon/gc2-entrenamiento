import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { deleteObject, keyFromUrl, MEDIA_PREFIX } from '@/lib/storage'

// Archivos propios (/media/...) que aparecen en un texto: una URL suelta, el contenido HTML de un post o un JSON de ajustes.
const RE_MEDIA = /\/media\/[A-Za-z0-9._/-]+/g

/**
 * Borra del volumen los archivos que ya no usa ninguna fila. Se llama DESPUÉS de guardar o borrar la fila, con los textos
 * anteriores (portada, video, PDF, contenido, foto, ajustes): cada archivo se borra solo si nadie más lo referencia.
 * Nunca falla la acción que lo llama; ante cualquier duda (error de base), el archivo se conserva.
 */
export async function liberarArchivos(...textos: Array<string | null | undefined>): Promise<void> {
  const claves = new Set<string>()
  for (const t of textos) for (const m of t?.match(RE_MEDIA) ?? []) {
    const key = keyFromUrl(m)
    if (key) claves.add(key)
  }
  for (const key of claves) {
    try {
      const ruta = MEDIA_PREFIX + key
      const r = await db.execute(sql`
        select 1 from posts where strpos(coalesce(content, '') || ' ' || coalesce(cover_image, '') || ' ' || coalesce(video_url, '') || ' ' || coalesce(attachment_url, ''), ${ruta}) > 0
        union all select 1 from coaches where strpos(coalesce(photo_url, ''), ${ruta}) > 0
        union all select 1 from site_settings where strpos(value::text, ${ruta}) > 0
        limit 1`)
      if (r.rows.length === 0) await deleteObject(key)
    } catch (e) {
      console.error('liberarArchivos:', key, e)
    }
  }
}
