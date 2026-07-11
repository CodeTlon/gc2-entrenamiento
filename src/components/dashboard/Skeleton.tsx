import { cn } from '@/lib/utils'

/**
 * Bloque de carga genérico para los `loading.tsx` del panel. Sigue la misma API que el
 * `Skeleton` de shadcn/ui (className + props de `div`) pero sin traer la dependencia:
 * este proyecto no tiene shadcn/ui instalado (sin `components.json`), así que se
 * replica el primitivo con los tokens de color propios del dashboard (fondo oscuro).
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-white/[0.06]', className)}
      {...props}
    />
  )
}
