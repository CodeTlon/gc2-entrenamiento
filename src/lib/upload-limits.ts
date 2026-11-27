export const MAX_IMAGE_BYTES = 20 * 1024 * 1024
export const MAX_VIDEO_BYTES = 60 * 1024 * 1024
export const MAX_DOC_BYTES = 10 * 1024 * 1024
// Video insertado inline en el cuerpo del post (vía editor de contenido) — más chico
// que MAX_VIDEO_BYTES (que es para el campo "video propio" del post, uno solo por post).
export const MAX_INLINE_VIDEO_BYTES = 15 * 1024 * 1024

// Tipos que se suben tal cual (sin pasar por sharp). La extensión sale del MIME, nunca del
// nombre del archivo: un filename tipo `x.png/../../foo` armaría un path fuera de la carpeta.
// SVG y HTML quedan afuera a propósito: se servirían desde el bucket público y pueden ejecutar scripts.
const PASSTHROUGH_EXT: Record<string, string> = {
  'image/gif': 'gif',
  'application/pdf': 'pdf',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
}

export function extForPassthroughMime(mime: string): string | null {
  return PASSTHROUGH_EXT[mime] ?? null
}

export function maxBytesForMime(mime: string): number {
  if (mime === 'application/pdf') return MAX_DOC_BYTES
  if (mime.startsWith('video/')) return MAX_VIDEO_BYTES
  return MAX_IMAGE_BYTES
}
