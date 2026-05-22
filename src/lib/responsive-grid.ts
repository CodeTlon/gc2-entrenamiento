/**
 * Devuelve la clase de ancho para un item de un flex grid que se adapta al
 * total `count` Y al viewport, evitando filas con un solo ítem suelto.
 *
 * Usar dentro de un padre con: `flex flex-wrap justify-center gap-6`
 *
 * Breakpoints (Tailwind): sm=640, md=768, lg=1024
 *
 * Por cantidad:
 *   1       → centrado, max-w-md
 *   2       → 1 col mobile · 2 cols sm+ (cards capadas a 520px)
 *   3       → 1 col mobile · 3 cols md+
 *   4       → 1 col mobile · 2 cols sm+ (2x2, evita 3+1 huérfano)
 *   5,6,7…  → 1 col mobile · 2 cols sm+ · 3 cols lg+ (huérfanos centrados)
 *
 * Nota: los arbitrary values van SIN underscores ni espacios (`calc(50%-0.75rem)`).
 * Turbopack (dev) tiene un bug que normaliza el class selector quitando
 * underscores, pero deja el HTML con underscores → no matchea. Sin underscores
 * funciona en dev y en producción.
 */
export function adaptiveFlexItemClass(count: number): string {
  if (count <= 0) return ''
  if (count === 1) return 'w-full max-w-md'
  if (count === 2) return 'w-full sm:w-[calc(50%-0.75rem)] max-w-[520px]'
  if (count === 3) return 'w-full md:w-[calc(33.333%-1rem)]'
  if (count === 4) return 'w-full sm:w-[calc(50%-0.75rem)]'
  return 'w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]'
}
