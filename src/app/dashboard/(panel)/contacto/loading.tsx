import { Skeleton } from '@/components/dashboard/Skeleton'

export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-56" />
      <div className="max-w-3xl space-y-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-24 bg-white/[0.05]" />
            <Skeleton className="h-11 rounded-md border border-white/[0.06] bg-white/[0.04]" />
          </div>
        ))}
      </div>
    </div>
  )
}
