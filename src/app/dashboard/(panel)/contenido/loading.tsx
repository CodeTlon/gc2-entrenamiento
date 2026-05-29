export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-64 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="h-20 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }} />
        ))}
      </div>
    </div>
  )
}
