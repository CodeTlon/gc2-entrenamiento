import { Skeleton } from '@/components/dashboard/Skeleton'

export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-3 w-64 bg-white/[0.04]" />
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-20 rounded-xl border border-white/[0.06] bg-white/[0.04]" />
      ))}
    </div>
  )
}
