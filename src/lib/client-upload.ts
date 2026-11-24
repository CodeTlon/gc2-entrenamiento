import { createBrowserClient } from '@supabase/ssr'
import { extForPassthroughMime, maxBytesForMime } from '@/lib/upload-limits'

/**
 * Sube un archivo directo al bucket `media` desde el navegador, sin pasar
 * por un Server Action — Vercel corta el body de una Server Action en
 * ~4.5MB antes de llegar al chequeo de tamaño de `uploadMediaAction`, muy
 * por debajo de los límites de PDF/video en upload-limits.ts. Usa
 * `createBrowserClient` (no el cliente anon plano de lib/supabase.ts) para
 * que la sesión de auth por cookies coincida con la del dashboard y la
 * policy RLS de storage.objects (authenticated) lo acepte.
 */
export async function uploadDirectToStorage(
  file: File,
  folder: string,
): Promise<{ url?: string; error?: string }> {
  const ext = extForPassthroughMime(file.type)
  if (!ext) return { error: 'Tipo de archivo no permitido.' }
  const maxBytes = maxBytesForMime(file.type)
  if (file.size > maxBytes) return { error: `Máximo ${Math.round(maxBytes / (1024 * 1024))}MB.` }

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookieOptions: { secure: process.env.NODE_ENV === 'production' } },
  )
  const path = `${folder}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from('media')
    .upload(path, file, { contentType: file.type, upsert: false })
  if (error) return { error: error.message }

  const { data } = supabase.storage.from('media').getPublicUrl(path)
  return { url: data.publicUrl }
}
