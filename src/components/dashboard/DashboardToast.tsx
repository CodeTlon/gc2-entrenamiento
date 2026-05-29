'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Check, X } from 'lucide-react'

export default function DashboardToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (searchParams.get('saved') !== '1') return
    setVisible(true)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('saved')
    const newUrl = params.size > 0 ? `${pathname}?${params}` : pathname
    router.replace(newUrl, { scroll: false })
    const t = setTimeout(() => setVisible(false), 3500)
    return () => clearTimeout(t)
  }, [searchParams, pathname, router])

  if (!visible) return null

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body font-semibold"
      style={{
        background: '#0D2247',
        border: '1px solid rgba(52,211,153,0.4)',
        color: '#34d399',
        boxShadow: '0 8px 30px rgba(10,22,40,0.6)',
        animation: 'toastSlideIn 0.25s ease',
      }}
    >
      <Check size={15} strokeWidth={2.5} />
      Cambios guardados
      <button
        onClick={() => setVisible(false)}
        className="ml-1 opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Cerrar"
      >
        <X size={13} />
      </button>
    </div>
  )
}
