'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

interface ShareButtonProps {
  title: string
  text?: string
  /** URL a compartir. Default: la URL actual del navegador. */
  url?: string
  className?: string
  label?: string
}

/** Botón de compartir: Web Share API nativa (mobile) con fallback a copiar link (desktop / sin soporte). */
export default function ShareButton({ title, text, url, className = '', label = 'Compartir' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const shareUrl = url ?? window.location.href

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl })
      } catch {
        // Usuario canceló el share nativo — no hacer nada
      }
      return
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard no disponible — fallback silencioso
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-body font-semibold
        text-white/70 hover:text-accent transition-all duration-300 hover:-translate-y-0.5
        active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${className}`}
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}
      aria-label={copied ? 'Link copiado' : label}
    >
      {copied ? <Check size={16} className="text-success" /> : <Share2 size={16} />}
      {copied ? 'Link copiado' : label}
    </button>
  )
}
