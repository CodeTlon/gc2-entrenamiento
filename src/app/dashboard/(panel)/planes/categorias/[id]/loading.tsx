export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-56 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }} />
      <div className="max-w-xl space-y-5">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 w-20 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
            <div className="h-11 rounded-md" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
