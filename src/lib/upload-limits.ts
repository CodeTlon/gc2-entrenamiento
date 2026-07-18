export const MAX_IMAGE_BYTES = 20 * 1024 * 1024
export const MAX_VIDEO_BYTES = 60 * 1024 * 1024
export const MAX_DOC_BYTES = 10 * 1024 * 1024

export function maxBytesForMime(mime: string): number {
  if (mime === 'application/pdf') return MAX_DOC_BYTES
  if (mime.startsWith('video/')) return MAX_VIDEO_BYTES
  return MAX_IMAGE_BYTES
}
