import { readFile } from 'node:fs/promises'
import sharp from 'sharp'
import { fileInfo, keyFromUrl } from '@/lib/storage'

// @vercel/og solo descarga URLs absolutas: una portada propia (/media/...) se lee del volumen y se entrega embebida.
// Se pasa a JPEG de 1080 px de ancho (también cubre WebP, que es lo que deja la subida del dashboard).
export async function portadaParaStory(src: string | null | undefined): Promise<string | null> {
  if (!src) return null
  if (/^https?:\/\//.test(src)) return src
  const key = keyFromUrl(src)
  const info = key ? await fileInfo(key) : null
  if (!info) return null
  try {
    const jpg = await sharp(await readFile(info.abs)).resize({ width: 1080, withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer()
    return `data:image/jpeg;base64,${jpg.toString('base64')}`
  } catch {
    return null
  }
}
