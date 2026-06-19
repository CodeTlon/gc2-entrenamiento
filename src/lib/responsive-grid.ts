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
 *   4       → 1 col mobile · 2 cols sm+ (2x2, evita 3+1 huérfano), cap 460px
 *   5,6,7…  → 1 col mobile · 2 cols sm+ · 3 cols lg+ (huérfanos centrados), cap 460px
 *
 * El cap de 460px en 4 y 5+ evita que las cards se estiren tanto que una
 * imagen de alto fijo (p. ej. 320px en Coaches) recorte el contenido.
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
  if (count === 4) return 'w-full sm:w-[calc(50%-0.75rem)] max-w-[460px]'
  return 'w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] max-w-[460px]'
}

/**
 * `sizes` para un `<Image fill>` dentro de una card de `adaptiveFlexItemClass`.
 * DEBE seguir la misma lógica de columnas/cap que la función de arriba, o el
 * navegador elige un candidato del srcset que no matchea el ancho real y la
 * foto se ve borrosa/"rota". Era el síntoma con 4 coaches: el grid pasó a 2x2
 * capado en 460px pero el `sizes` seguía diciendo 33vw → resolución equivocada.
 */
export function adaptiveImageSizes(count: number): string {
  if (count <= 0) return '100vw'
  if (count === 1) return '(max-width: 768px) 100vw, 448px'   // max-w-md
  if (count === 2) return '(max-width: 640px) 100vw, 520px'   // 2 cols, cap 520
  if (count === 3) return '(max-width: 768px) 100vw, 33vw'    // 3 cols md+
  if (count === 4) return '(max-width: 640px) 100vw, 460px'   // 2x2, cap 460
  return '(max-width: 640px) 100vw, 460px'                    // 2/3 cols, cap 460
}
