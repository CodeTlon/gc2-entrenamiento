import { Skeleton } from '@/components/dashboard/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-3 w-20 bg-accent/15" />
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-3 w-72 bg-white/4" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl border border-white/6 bg-white/4" />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl border border-white/6 bg-white/4" />
        ))}
      </div>
    </div>
  )
}
