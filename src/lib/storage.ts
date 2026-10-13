import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Bucket S3-compatible (Cloudflare R2): vive fuera del VPS, no consume RAM de Coolify.
// El cliente se crea perezosamente para que el build no necesite credenciales.
let client: S3Client | undefined
function s3() {
  client ??= new S3Client({
    region: process.env.S3_REGION || 'auto',
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
    // Desde el SDK 3.729 firma por defecto un CRC32 del cuerpo vacío en la URL; el PUT del navegador
    // manda otro cuerpo y el bucket (R2 incluido) lo rechaza con 400. Solo se pide checksum si el servicio lo exige.
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
    },
  })
  return client
}

const bucket = () => process.env.S3_BUCKET ?? ''
const publicBase = () => (process.env.S3_PUBLIC_BASE_URL ?? '').replace(/\/$/, '')

export const publicUrl = (key: string) => `${publicBase()}/${key}`

/** Devuelve la key si la URL pertenece a nuestro bucket (para poder borrarla), si no null. */
export function keyFromUrl(url: string): string | null {
  const base = publicBase()
  if (!base || !url.startsWith(`${base}/`)) return null
  return decodeURIComponent(url.slice(base.length + 1).split(/[?#]/)[0])
}

export async function putObject(key: string, body: Buffer, contentType: string) {
  await s3().send(new PutObjectCommand({ Bucket: bucket(), Key: key, Body: body, ContentType: contentType }))
  return publicUrl(key)
}

export async function deleteObject(key: string) {
  await s3().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }))
}

/** URL firmada para que el navegador suba directo (bypass del límite de ~4.5MB de Vercel). */
export async function presignPut(key: string, contentType: string, contentLength: number) {
  const url = await getSignedUrl(
    s3(),
    new PutObjectCommand({ Bucket: bucket(), Key: key, ContentType: contentType, ContentLength: contentLength }),
    { expiresIn: 300 },
  )
  return { uploadUrl: url, publicUrl: publicUrl(key) }
}
