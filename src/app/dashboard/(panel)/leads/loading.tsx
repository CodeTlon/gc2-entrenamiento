export default function LeadsLoading() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="rounded-xl p-5 h-36"
          style={{ background: '#0D2247', border: '1px solid #102E66' }}
        />
      ))}
    </div>
  )
}
