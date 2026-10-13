// Mensaje seguro para mostrar en el dashboard: los errores de Drizzle/pg incluyen la consulta SQL
// y sus parámetros, que no deben llegar al navegador. El detalle completo va al log del servidor.
const NO_AUTH = 'No autenticado.'

function pgCode(e: unknown): string | undefined {
  const c = e as { code?: string; cause?: { code?: string } }
  return c?.cause?.code ?? c?.code
}

export function errorMessage(e: unknown, fallback = 'No se pudo guardar. Intentá de nuevo.'): string {
  if (e instanceof Error && e.message === NO_AUTH) return NO_AUTH
  const code = pgCode(e)
  console.error('[action]', e instanceof Error ? e.message : e)
  if (code === '23505') return 'Ya existe un registro con ese nombre o slug.'
  if (code === '23503') return 'Hay datos relacionados: elegí valores válidos o quitá las referencias.'
  if (code === '22P02') return 'Algún identificador no es válido.'
  return fallback
}
