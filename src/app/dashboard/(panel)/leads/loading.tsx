import { Skeleton } from '@/components/dashboard/Skeleton'

export default function LeadsLoading() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="rounded-xl p-5 h-36 border border-blue-700 bg-blue-800" />
      ))}
    </div>
  )
}
