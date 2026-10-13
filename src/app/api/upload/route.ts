import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getUser } from '@/lib/session'
import { presignPut } from '@/lib/storage'
import { maxBytesForMime } from '@/lib/upload-limits'

// Devuelve una URL firmada de subida directa a S3. Solo usuarios autenticados del dashboard.
const body = z.object({
  folder: z.string().regex(/^[a-z0-9_-]{1,40}$/i),
  filename: z.string().min(1).max(200),
  contentType: z.string().min(1).max(100),
  size: z.number().int().positive(),
})

export async function POST(request: Request) {
  if (!(await getUser())) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  const parsed = body.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 })
  const { folder, filename, contentType, size } = parsed.data

  const max = maxBytesForMime(contentType)
  if (size > max) return NextResponse.json({ error: `Máximo ${Math.round(max / (1024 * 1024))}MB.` }, { status: 413 })

  const ext = (filename.split('.').pop() ?? 'bin').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'bin'
  const key = `${folder}/${crypto.randomUUID()}.${ext}`
  return NextResponse.json(await presignPut(key, contentType, size))
}
