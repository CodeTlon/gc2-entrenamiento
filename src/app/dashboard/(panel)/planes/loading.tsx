import { Skeleton } from '@/components/dashboard/Skeleton'

export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-40" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-14 rounded-xl border border-white/[0.06] bg-white/[0.04]" />
        ))}
      </div>
    </div>
  )
}
