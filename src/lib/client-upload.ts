/**
 * Sube un archivo directo al bucket S3 desde el navegador con una URL firmada que emite
 * /api/upload (solo usuarios autenticados) — sin pasar por un Server Action: Vercel corta el
 * body en ~4.5MB, muy por debajo de los límites de PDF/video en upload-limits.ts.
 */
export async function uploadDirectToStorage(
  file: File,
  folder: string,
): Promise<{ url?: string; error?: string }> {
  const contentType = file.type || 'application/octet-stream'
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder, filename: file.name, contentType, size: file.size }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) return { error: data.error ?? 'No se pudo preparar la subida.' }

  const put = await fetch(data.uploadUrl, { method: 'PUT', headers: { 'Content-Type': contentType }, body: file })
  if (!put.ok) return { error: 'Falló la subida del archivo.' }
  return { url: data.publicUrl }
}
